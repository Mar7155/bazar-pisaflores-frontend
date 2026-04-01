/**
 * toast.ts — Módulo centralizado de notificaciones (Sonner)
 *
 * Patrón: cada acción del sistema tiene su propia función tipada
 * con valores por defecto y opciones opcionales para personalización.
 *
 * Uso:
 *   import { appToast } from "@/lib/toast";
 *   appToast.logout();
 *   appToast.login("María");
 *   appToast.error("No se pudo guardar");
 *   appToast.loading("Cargando...");
 */

import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface ToastOptions {
  description?: string;
  duration?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULO DE TOASTS
// ─────────────────────────────────────────────────────────────────────────────
export const appToast = {

  // ── Auth ──────────────────────────────────────────────────────────────────

  /** Muestra notificación de sesión cerrada con animación de carga previa */
  logout(opts?: ToastOptions) {
    const id = toast.loading("Cerrando sesión...", { duration: Infinity });
    // El toast de éxito reemplaza al loading cuando el redirect ocurre
    setTimeout(() => {
      toast.success("Sesión cerrada", {
        id,
        description: opts?.description ?? "¡Hasta pronto! Vuelve cuando quieras.",
        duration: opts?.duration ?? 3000,
      });
    }, 600);
    return id;
  },

  login(name?: string, opts?: ToastOptions) {
    toast.success(`¡Bienvenido${name ? `, ${name}` : ""}!`, {
      description: opts?.description ?? "Has iniciado sesión correctamente.",
      duration: opts?.duration ?? 3000,
    });
  },

  registered(opts?: ToastOptions) {
    toast.success("¡Cuenta creada!", {
      description: opts?.description ?? "Revisa tu correo para verificar tu cuenta.",
      duration: opts?.duration ?? 5000,
    });
  },

  emailConfirmed(opts?: ToastOptions) {
    toast.success("¡Correo verificado!", {
      description: opts?.description ?? "Tu cuenta está activa. Ya puedes iniciar sesión.",
      duration: opts?.duration ?? 4000,
    });
  },

  // ── Negocio ───────────────────────────────────────────────────────────────

  businessCreated(name?: string, opts?: ToastOptions) {
    toast.success(`¡Negocio registrado!`, {
      description: opts?.description ?? (name ? `"${name}" ya está visible en el directorio.` : "Tu negocio ya está activo."),
      duration: opts?.duration ?? 4000,
    });
  },

  businessUpdated(opts?: ToastOptions) {
    toast.success("Negocio actualizado", {
      description: opts?.description ?? "Los cambios se guardaron correctamente.",
      duration: opts?.duration ?? 3000,
    });
  },

  // ── Producto ──────────────────────────────────────────────────────────────

  productCreated(name?: string, opts?: ToastOptions) {
    toast.success("¡Producto publicado!", {
      description: opts?.description ?? (name ? `"${name}" ya está en tu catálogo.` : "El producto ya es visible."),
      duration: opts?.duration ?? 3000,
    });
  },

  productUpdated(opts?: ToastOptions) {
    toast.success("Producto actualizado", {
      description: opts?.description ?? "Los cambios se aplicaron.",
      duration: opts?.duration ?? 3000,
    });
  },

  // ── Oferta ────────────────────────────────────────────────────────────────

  offerCreated(opts?: ToastOptions) {
    toast.success("¡Oferta publicada!", {
      description: opts?.description ?? "La oferta relámpago ya está activa.",
      duration: opts?.duration ?? 3000,
    });
  },

  offerDeleted(opts?: ToastOptions) {
    toast.success("Oferta desactivada", {
      description: opts?.description ?? "La oferta fue eliminada del listado.",
      duration: opts?.duration ?? 3000,
    });
  },

  // ── Horarios ──────────────────────────────────────────────────────────────

  scheduleSaved(opts?: ToastOptions) {
    toast.success("Horarios guardados", {
      description: opts?.description ?? "Tu horario de atención fue actualizado.",
      duration: opts?.duration ?? 3000,
    });
  },

  // ── Utilidades ────────────────────────────────────────────────────────────

  /** Toast de carga — retorna el ID para poder cerrarlo con toast.dismiss(id) */
  loading(message: string, opts?: ToastOptions) {
    return toast.loading(message, {
      description: opts?.description,
      duration: opts?.duration ?? Infinity,
    });
  },

  /** Toast de error genérico */
  error(message: string, opts?: ToastOptions) {
    toast.error(message, {
      description: opts?.description,
      duration: opts?.duration ?? 5000,
    });
  },

  /** Toast de información */
  info(message: string, opts?: ToastOptions) {
    toast.info(message, {
      description: opts?.description,
      duration: opts?.duration ?? 4000,
    });
  },

  /** Toast de éxito genérico */
  success(message: string, opts?: ToastOptions) {
    toast.success(message, {
      description: opts?.description,
      duration: opts?.duration ?? 3000,
    });
  },

  /** Descarta un toast por ID (útil para cerrar loadings) */
  dismiss: toast.dismiss,
};
