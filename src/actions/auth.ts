"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Role } from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Decodes the payload of a JWT without verifying the signature (client-side use only).
 *  The backend verifies signatures — we just read the role claim here. */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return {};
  }
}

async function setCookies(idToken: string, user: User) {
  const cookieStore = await cookies();
  const cookieOpts = {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24h
  };
  cookieStore.set({ name: "auth_token",       value: idToken,              ...cookieOpts, httpOnly: true });
  cookieStore.set({ name: "auth_token_client", value: idToken,              ...cookieOpts, httpOnly: false }); // legible por JS para apiFetch en cliente
  cookieStore.set({ name: "user_role",         value: user.role,            ...cookieOpts, httpOnly: false });
  cookieStore.set({ name: "user_data",         value: JSON.stringify(user), ...cookieOpts, httpOnly: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthActionResult {
  error?: string;
  user?: User;
}

/** Register a new user via POST /auth/register */
export async function registerAction(email: string, password: string): Promise<AuthActionResult> {
  if (USE_MOCK) {
    // Mock: just pretend it worked. Redirect to confirm page with email pre-filled.
    return {};
  }
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Error al registrarse." };
    return {};
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
}

/** Confirm email code via POST /auth/confirm */
export async function confirmEmailAction(email: string, code: string): Promise<AuthActionResult> {
  if (USE_MOCK) return {};
  try {
    const res = await fetch(`${API_URL}/auth/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Código incorrecto o expirado." };
    return {};
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
}

/** Resend confirmation code via POST /auth/resend-code */
export async function resendCodeAction(email: string): Promise<AuthActionResult> {
  if (USE_MOCK) return {};
  try {
    const res = await fetch(`${API_URL}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Error al reenviar el código." };
    return {};
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
}

/** Login via POST /auth/login → saves idToken + role in cookies */
export async function loginAction(email: string, password?: string): Promise<AuthActionResult> {
  if (USE_MOCK) {
    // Mock mode: assign mock token + mock user data
    const mockUser: User = {
      id: "mock-uuid-123",
      email: email || "dueno@ejemplo.com",
      emailVerified: true,
      role: "owner",
      createdAt: new Date().toISOString()
    };
    await setCookies("mock-jwt-token", mockUser);
    redirect("/dashboard");
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Usuario o contraseña incorrectos." };

    const { idToken, user } = body as { idToken: string; accessToken: string; refreshToken: string; user?: any };
    
    // Use the user from response or rebuild it if missing
    let finalUser: User;
    if (user) {
      finalUser = {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        role: (user.role as Role) || "visitor",
        createdAt: user.createdAt
      };
    } else {
      // Decode role from Cognito custom claim if user object is not present
      const payload = decodeJwtPayload(idToken);
      const role = (payload["custom:role"] as string) ?? "visitor";
      finalUser = {
        id: (payload["sub"] as string) || "unknown",
        email: (payload["email"] as string) || email,
        emailVerified: (payload["email_verified"] as boolean) ?? false,
        role: role as Role,
        createdAt: new Date().toISOString() // fallback
      };
    }

    await setCookies(idToken, finalUser);
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }

  redirect("/dashboard");
}

/** Forgot password via POST /auth/forgot-password */
export async function forgotPasswordAction(email: string): Promise<AuthActionResult> {
  if (USE_MOCK) return {};
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Error al enviar el código." };
    return {};
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
}

/** Reset password via POST /auth/reset-password */
export async function resetPasswordAction(email: string, code: string, newPassword: string): Promise<AuthActionResult> {
  if (USE_MOCK) return {};
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "Error al restablecer la contraseña." };
    return {};
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
}

/** Become owner via POST /auth/become-owner */
export async function upgradeRoleAction(): Promise<AuthActionResult> {
  const cookieStore = await cookies();
  const cookieOpts = { 
    path: "/", 
    sameSite: "lax" as const, 
    secure: process.env.NODE_ENV === "production", 
    maxAge: 60 * 60 * 24 
  };

  if (USE_MOCK) {
    cookieStore.set({ name: "user_role", value: "owner", ...cookieOpts, httpOnly: false });
    
    // Also update user_data in mock
    const userDataCookie = await cookieStore.get("user_data");
    const userDataStr = userDataCookie?.value;
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      user.role = "owner";
      cookieStore.set({ name: "user_data", value: JSON.stringify(user), ...cookieOpts, httpOnly: true });
    }
    
    redirect("/dashboard?status=welcome");
  }
  try {
    const tokenCookie = await cookieStore.get("auth_token");
    const token = tokenCookie?.value;
    const res = await fetch(`${API_URL}/auth/become-owner`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error ?? "No se pudo actualizar el rol." };
    
    cookieStore.set({ name: "user_role", value: "owner", ...cookieOpts, httpOnly: false });
    
    // Sync user_data cookie if it exists
    const userDataCookie = await cookieStore.get("user_data");
    const userDataStr = userDataCookie?.value;
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      user.role = "owner";
      cookieStore.set({ name: "user_data", value: JSON.stringify(user), ...cookieOpts, httpOnly: true });
    }
  } catch {
    return { error: "No se pudo conectar al servidor." };
  }
  redirect("/dashboard?status=welcome");
}

/** Logout — clears cookies */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_token_client");
  cookieStore.delete("user_role");
  cookieStore.delete("user_data");
  redirect("/");
}

/** Read auth session from cookies (for Server Components) */
export async function getAuthSession() {
  const cookieStore = await cookies();
  const tokenCookie = await cookieStore.get("auth_token");
  const token = tokenCookie?.value;
  const roleCookie = await cookieStore.get("user_role");
  const role = roleCookie?.value;
  const userDataCookie = await cookieStore.get("user_data");
  const userData = userDataCookie?.value;
  
  let user: User | null = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  return { 
    isLoggedIn: !!token, 
    role: role || null,
    user
  };
}
