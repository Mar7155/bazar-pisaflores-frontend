"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Route, Users, Package, Car, MapPin, Flag,
  Loader2, Clock, Phone,
} from "lucide-react";

import { getTravelRoutes, type TravelRoute } from "@/lib/api";
import { appToast } from "@/lib/toast";
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map-config";
import {
  Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MapRoute,
} from "@/components/ui/map";
import { getWhatsAppLink } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type RouteCoords = [number, number][];

/**
 * Extrae coordenadas [lng, lat][] del campo waypoints (JSONB).
 * El backend guarda la geometría OSRM como { geojson: [[lng, lat], ...] }.
 * Si no hay geometría válida, retorna null para no crashear MapLibre.
 */
function extractRouteCoords(waypoints: Record<string, unknown>): RouteCoords | null {
  if (!waypoints || typeof waypoints !== "object") return null;

  const geojson = waypoints.geojson;
  if (!Array.isArray(geojson) || geojson.length < 2) return null;

  // Validar que cada elemento sea un par numérico [lng, lat]
  const coords = geojson as unknown[];
  const valid = coords.every(
    c => Array.isArray(c) && c.length >= 2 && typeof c[0] === "number" && typeof c[1] === "number"
  );
  if (!valid) return null;

  return coords as RouteCoords;
}

// ─────────────────────────────────────────────────────────────────────────────
// POPUP DE RUTA
// ─────────────────────────────────────────────────────────────────────────────

function RoutePopupContent({ route }: { route: TravelRoute }) {
  const departure = (() => {
    try {
      return format(new Date(route.departure_time), "EEE d MMM · HH:mm 'h'", { locale: es });
    } catch {
      return route.departure_time;
    }
  })();

  return (
    <div className="w-60 flex flex-col gap-2.5 p-2">
      {/* Origen → Destino */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="truncate">{route.origin_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Flag className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate">{route.dest_name}</span>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Fecha de salida */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="capitalize">{departure}</span>
      </div>

      {/* Asientos */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span>
          {route.available_seats > 0
            ? `${route.available_seats} lugar${route.available_seats !== 1 ? "es" : ""} disponible${route.available_seats !== 1 ? "s" : ""}`
            : "Sin lugares disponibles"}
        </span>
      </div>

      {/* Badge paquetería */}
      {route.accepts_packages && (
        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1.5">
          <Package className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-primary">
            Acepta Paquetería
          </span>
        </div>
      )}

      {/* Duración estimada */}
      {route.estimated_duration && (
        <div className="text-xs text-muted-foreground">
          ~{route.estimated_duration} min de trayecto
        </div>
      )}

      {/* CTA */}
      <Link
        href={getWhatsAppLink(route.phone, route.businessName || "", undefined, undefined, true, departure)}
        target="_blank"
        className="mt-1 w-full flex items-center justify-center gap-1.5 bg-primary text-foreground hover:bg-primary/90 text-xs font-bold py-2 rounded-lg transition-colors"
      >
        <Phone className="w-3.5 h-3.5" /> Contactar Conductor
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN DE ORIGEN (verde)
// ─────────────────────────────────────────────────────────────────────────────

function OriginPin({ route }: { route: TravelRoute }) {
  return (
    <MapMarker longitude={route.origin_lng} latitude={route.origin_lat}>
      <MarkerContent>
        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
            <MapPin className="w-3 h-3 text-white fill-white" />
          </div>
          <div className="w-0.5 h-2 bg-green-500/60" />
        </div>
      </MarkerContent>
      <MarkerPopup closeButton className="p-0 overflow-hidden">
        <RoutePopupContent route={route} />
      </MarkerPopup>
    </MapMarker>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN DE DESTINO (rojo oscuro)
// ─────────────────────────────────────────────────────────────────────────────

function DestinationPin({ route }: { route: TravelRoute }) {
  return (
    <MapMarker longitude={route.dest_lng} latitude={route.dest_lat}>
      <MarkerContent>
        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
            <Flag className="w-3 h-3 text-white fill-white" />
          </div>
          <div className="w-0.5 h-2 bg-red-600/60" />
        </div>
      </MarkerContent>
      <MarkerPopup closeButton className="p-0 overflow-hidden">
        <RoutePopupContent route={route} />
      </MarkerPopup>
    </MapMarker>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN DE PARADAS (Azul)
// ─────────────────────────────────────────────────────────────────────────────

function StopPin({ lng, lat }: { lng: number; lat:number }) {
  return (
    <MapMarker longitude={lng} latitude={lat}>
      <MarkerContent>
        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
            <MapPin className="w-3 h-3 text-white fill-white" />
          </div>
          <div className="w-0.5 h-2 bg-green-500/60" />
        </div>
      </MarkerContent>
    </MapMarker>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

type FilterMode = "all" | "passengers" | "packages";

export default function TravelsPage() {
  const [routes,      setRoutes]      = useState<TravelRoute[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [filterMode,  setFilterMode]  = useState<FilterMode>("all");
  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);

  // Fetch de rutas — reacciona al cambio de filtro
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const opts = {
      limit:            50,
      accepts_packages: filterMode === "packages" ? true : undefined,
    };

    getTravelRoutes(opts).then(res => {
      if (cancelled) return;
      // Si el filtro es "passengers", mostrar solo las que NO aceptan paquetes exclusivamente
      // (rutas que aceptan pasajeros — todas las activas excepto las puras de paquetería)
      const data = filterMode === "passengers"
        ? res.data.filter(r => r.available_seats > 0)
        : res.data;
      setRoutes(data);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [filterMode]);

  // GPS del visitante — solo en memoria
  const handleLocate = useCallback(
    ({ longitude, latitude }: { longitude: number; latitude: number }) => {
      setUserLocation({ lng: longitude, lat: latitude });
    },
    []
  );

  // Estadísticas rápidas
  const totalPassengers = routes.reduce((s, r) => s + r.available_seats, 0);
  const withPackages    = routes.filter(r => r.accepts_packages).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* ── Barra superior de controles ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0 flex-wrap gap-3">

        {/* Título + estadísticas */}
        <div className="flex items-center gap-3">
          <Route className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-black text-base leading-none">Viajes y Encomiendas</h1>
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {routes.length} ruta{routes.length !== 1 ? "s" : ""} activa{routes.length !== 1 ? "s" : ""}
                {" · "}{totalPassengers} lugar{totalPassengers !== 1 ? "es" : ""}
                {" · "}{withPackages} aceptan paquetes
              </p>
            )}
          </div>
        </div>

        {/* Filtros tipo toggle */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1">
          {([
            { key: "all",        icon: <Route   className="w-3.5 h-3.5" />, label: "Todos"        },
            { key: "passengers", icon: <Car     className="w-3.5 h-3.5" />, label: "🚗 Pasajeros"  },
            { key: "packages",   icon: <Package className="w-3.5 h-3.5" />, label: "📦 Paquetería" },
          ] as { key: FilterMode; icon: React.ReactNode; label: string }[]).map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterMode(f.key)}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
                (filterMode === f.key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {f.icon}
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Mapa ────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <Map
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM - 2}
        >
          <MapControls
            showZoom
            showLocate
            showFullscreen
            position="bottom-right"
            onLocate={handleLocate}
          />

          {/* Rutas y pines */}
          {routes.map(route => {
            const coords = extractRouteCoords(route.waypoints);
            return (
              <span key={route.id}>
                {/* Línea de ruta — solo si hay geometría válida */}
                {coords && coords.length >= 2 && (
                  <MapRoute
                    id={"route-" + route.id}
                    coordinates={coords}
                    color={route.route_color || "#3b82f6"}
                    width={4}
                    opacity={0.75}
                  />
                )}

                {/* Pin de origen */}
                <OriginPin route={route} />

                {/* Pins de paradas intermedias — extraídos de waypoints.stops */}
                {Array.isArray((route.waypoints as Record<string, unknown>).stops) &&
                  ((route.waypoints as Record<string, unknown>).stops as { lat: number; lng: number }[])
                    .map((stop, i) => (
                      <StopPin key={"stop-" + route.id + "-" + i} lng={stop.lng} lat={stop.lat} />
                    ))
                }
                {/* Pin de destino */}
                <DestinationPin route={route} />
              </span>
            );
          })}

          {/* Marcador de posición del visitante */}
          {userLocation && (
            <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
              <MarkerContent>
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex w-5 h-5 rounded-full bg-blue-400/40 animate-ping" />
                  <span className="relative inline-flex w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                </div>
              </MarkerContent>
            </MapMarker>
          )}
        </Map>

        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Cargando rutas...
            </div>
          </div>
        )}

        {/* Estado vacío sobre el mapa */}
        {!isLoading && routes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-2xl p-6 text-center shadow-xl max-w-xs pointer-events-auto">
              <Route className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold">Sin rutas disponibles</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filterMode === "packages"
                  ? "No hay viajes que acepten paquetería en este momento."
                  : "No hay viajes activos por el momento."}
              </p>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className="mt-3 text-xs text-primary underline underline-offset-2"
              >
                Ver todos los viajes
              </button>
            </div>
          </div>
        )}

        {/* Leyenda flotante — desktop */}
        {!isLoading && routes.length > 0 && (
          <div className="absolute bottom-10 left-3 hidden md:flex flex-col gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-xl p-3 shadow-md z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Referencia
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-white/50" />
              <span>Punto de origen</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-600 border border-white/50" />
              <span>Punto de destino</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-1 rounded-full bg-blue-500" />
              <span>Trayecto</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
