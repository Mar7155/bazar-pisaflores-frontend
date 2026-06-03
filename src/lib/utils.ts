import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CDN = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? "";

export function getImageUrl(s3Key: string | undefined | null, size: "sm" | "md" | "lg" = "md"): string {
  if (!s3Key) return "/placeholder.jpg";
  const key = s3Key.replace("processed/md/", `processed/${size}/`);
  if (!CDN) return `/placeholder.jpg`; // fallback si CDN no esta configurado
  const baseUrl = CDN.startsWith("http") ? CDN : `https://${CDN}`;
  return `${baseUrl}/${key}`;
}

export function getBusinessImageUrl(url: string, size: "sm" | "md" | "lg" = "md"): string {
  if (!url) return "/placeholder.jpg";
  const key = url.replace("processed/md/", `processed/${size}/`);
  if (!CDN) return `/placeholder.jpg`; // fallback si CDN no esta configurado
  const baseUrl = CDN.startsWith("http") ? CDN : `https://${CDN}`;
  return `${baseUrl}/${key}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP LINK BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye un enlace de WhatsApp con un mensaje predeterminado estructurado.
 *
 * @param phone       - Número de teléfono (con o sin formato, se limpian los no numéricos)
 * @param businessName - Nombre del negocio para personalizar el saludo
 * @param productName  - (opcional) Nombre del producto — activa el mensaje transaccional
 * @param price        - (opcional) Precio del producto en MXN
 * @returns URL completa de wa.me con el mensaje codificado como URI
 */
export function getWhatsAppLink(
  phone: string | null | undefined,
  businessName: string,
  productName?: string,
  price?: number,
  isTravel?: boolean,
  date?: string,
): string {
  // Retornar vacío si no hay teléfono — el caller decide si renderiza el botón
  if (!phone) return "";

  // Eliminar todo lo que no sea dígito (espacios, guiones, paréntesis, +)
  const cleanPhone = phone.replace(/\D/g, "");

  let message: string;

  if (productName !== undefined && price !== undefined) {
    // Mensaje transaccional de producto
    message =
      `¡Hola, ${businessName}! Estoy interesado en el producto "${productName}" ` +
      `que vi en Bazar Pisaflores con precio de $${price}. ` +
      `¿Tienen disponibilidad y cuentan con servicio a domicilio?`;
  } 
  else if (isTravel && date !== undefined ) {
    message =
      `¡Hola, ${businessName}!, vi tu ruta en Bazar Pisaflores.` +
      `¿Aún tienes lugares disponibles o espacio para paqueteria el dia ${date}? `;
  }
  else {
    // Mensaje general de negocio
    message =
      `Hola, buenas tardes. Encontré su negocio "${businessName}" en Bazar Pisaflores. ` +
      `Me interesa conocer más sobre sus servicios/productos. ` +
      `¿Cuál es su horario de atención hoy?`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

