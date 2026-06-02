/**
 * map-config.ts — Constantes geoespaciales de Bazar Pisaflores
 *
 * Centro base: Tlahuelilpan / Pisaflores, Hidalgo, México
 * Coordenadas en formato [longitude, latitude] (convención MapLibre/GeoJSON)
 */

/** Centro fijo del mapa — [longitude, latitude] */
export const MAP_CENTER: [number, number] = [-99.0065, 21.1951];

/** Zoom por defecto al abrir el mapa público */
export const MAP_DEFAULT_ZOOM = 14;

/** Zoom al abrir el editor de coordenadas en el dashboard */
export const MAP_EDITOR_ZOOM = 15;

/** Colores de pin por category_id. Fallback: COLOR_DEFAULT */
export const CATEGORY_COLORS: Record<string, string> = {
  // Alimentos y Bebidas
  "a1000000-0000-0000-0000-000000000001": "#ef4444", // rojo
  // Ropa y Accesorios
  "a1000000-0000-0000-0000-000000000002": "#f97316", // naranja
  // Electronica
  "a1000000-0000-0000-0000-000000000003": "#22c55e", // verde
  // Hogar y Mueble
  "a1000000-0000-0000-0000-000000000004": "#3b82f6", // azul
  // Salud y Belleza
  "a1000000-0000-0000-0000-000000000005": "#a855f7", // morado
  // Servicios
  "a1000000-0000-0000-0000-000000000006": "#06b6d4", // cyan
  // Mascotas
  "a1000000-0000-0000-0000-000000000007": "#eab308", // amarillo
  // Deportes
  "a1000000-0000-0000-0000-000000000008": "#6366f1", // índigo
  // Juguetes y Juegos
  "a1000000-0000-0000-0000-000000000009": "#ec4899", // rosa
  // Paqueteria y Oficina
  "a1000000-0000-0000-0000-000000000010": "#71717a", // gris zinc
  // Ferreteria
  "a1000000-0000-0000-0000-000000000011": "#b45309", // ámbar / marrón
  // Flores y Plantas
  "a1000000-0000-0000-0000-000000000012": "#10b981", // esmeralda
};

/** Color de pin para categorías no mapeadas */
export const COLOR_DEFAULT = "#00a33d"; // verde primario del tema

/**
 * Devuelve el color de pin para un category_id dado.
 * Si no está en el diccionario, retorna el color por defecto.
 */
export function getPinColor(categoryId: string | null | undefined): string {
  if (!categoryId) return COLOR_DEFAULT;
  return CATEGORY_COLORS[categoryId] ?? COLOR_DEFAULT;
}
