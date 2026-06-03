/**
 * osrm.ts — Servicio de enrutamiento geográfico
 *
 * Consume la API pública de OSRM (Project-OSRM) para calcular la geometría
 * de una ruta conducida entre dos o más coordenadas.
 *
 * Documentación: http://project-osrm.org/docs/v5.5.1/api/
 */

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface Coordinate {
  lat: number;
  lng: number;
}

/** GeoJSON LineString geometry devuelto por OSRM */
export interface GeoJSONLineString {
  type:        "LineString";
  coordinates: [number, number][]; // [lng, lat][]
}

export interface OSRMRouteResult {
  /** Geometría GeoJSON de la ruta, o null si OSRM no pudo calcularla */
  geometry:        GeoJSONLineString | null;
  /** Duración estimada en minutos (redondeada) */
  durationMinutes: number;
  /** Distancia en kilómetros */
  distanceKm:      number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTE
// ─────────────────────────────────────────────────────────────────────────────

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la geometría de conducción entre las coordenadas dadas.
 *
 * @param coordinates - Arreglo ordenado: [origen, ...paradas?, destino]
 *                      Mínimo 2 puntos requeridos.
 * @returns Geometría GeoJSON, duración en minutos y distancia en km.
 *          Si OSRM falla o la red no responde, geometry es null y los números son 0.
 *
 * @example
 * const result = await getRouteGeometry([
 *   { lat: 20.13, lng: -99.23 },  // Pisaflores
 *   { lat: 20.08, lng: -98.73 },  // Pachuca
 * ]);
 */
export async function getRouteGeometry(
  coordinates: Coordinate[]
): Promise<OSRMRouteResult> {
  const fallback: OSRMRouteResult = { geometry: null, durationMinutes: 0, distanceKm: 0 };

  if (coordinates.length < 2) {
    console.warn("[OSRM] Se requieren al menos 2 coordenadas.");
    return fallback;
  }

  // OSRM espera coordenadas en formato "lng,lat" separadas por punto y coma
  const coordString = coordinates
    .map(c => c.lng.toFixed(7) + "," + c.lat.toFixed(7))
    .join(";");

  const url = OSRM_BASE + "/" + coordString + "?overview=full&geometries=geojson";

  try {
    const res = await fetch(url, {
      // OSRM es una API externa — no enviamos Authorization header
      headers: { Accept: "application/json" },
      // Timeout de 8 segundos para no bloquear la UI si el servicio es lento
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.error("[OSRM] HTTP", res.status, res.statusText);
      return fallback;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) {
      console.warn("[OSRM] Sin ruta disponible:", data.code);
      return fallback;
    }

    const route = data.routes[0];

    return {
      geometry:        route.geometry as GeoJSONLineString,
      durationMinutes: Math.round((route.duration as number) / 60),
      distanceKm:      Math.round(((route.distance as number) / 1000) * 10) / 10,
    };
  } catch (err) {
    // Incluye AbortError (timeout) y errores de red
    if (err instanceof DOMException && err.name === "AbortError") {
      console.warn("[OSRM] Timeout al conectar con el servidor de rutas.");
    } else {
      console.error("[OSRM] Error de red:", err);
    }
    return fallback;
  }
}
