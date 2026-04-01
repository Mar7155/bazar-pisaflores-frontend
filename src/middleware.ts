import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function isTokenExpired(token: string | undefined): boolean {
  if (!token || token === "mock-jwt-token") return false;
  const payload = decodeJwtPayload(token);
  if (!payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= (payload.exp as number) - 10;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const isAuthenticated = token && !isTokenExpired(token);

  // 1. Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protect the dashboard route tree
  if (pathname.startsWith('/dashboard')) {
    // Block access if entirely unauthenticated or expired
    if (!isAuthenticated) {
      const isExpired = !!token;
      const url = new URL('/auth/login', request.url);
      if (isExpired) url.searchParams.set('expired', '1');

      const response = NextResponse.redirect(url);

      // Clear cookies if they were present but invalid/expired
      if (tokenCookie) {
        response.cookies.delete('auth_token');
        response.cookies.delete('user_role');
        response.cookies.delete('user_data');
      }

      return response;
    }

    // Role-Based Access Control (RBAC)
    const isDashboardRoot = pathname === '/dashboard';
    if (userRole === 'visitor' && !isDashboardRoot) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure the middleware only builds for routes that actually matter
// (This skips static files, images, api routes, etc to optimize speed)
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};

