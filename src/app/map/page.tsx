"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ExternalLink, Clock, Map as MapIcon } from "lucide-react";
import { getBusinesses } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { getPinColor, MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map-config";
import type { Business, Schedule } from "@/types";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

// ── Bounding box de ~150km alrededor de Pisaflores ────────────────────────────
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-100.58, 18.78], // SW [lng, lat]
  [-97.88,  21.48], // NE [lng, lat]
];

// ── Helpers de horario ────────────────────────────────────────────────────────

/** Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche */
function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + (mm ?? 0);
}

/**
 * Devuelve si el negocio está abierto ahora basándose en sus schedules.
 * Día de semana: 0 = Domingo … 6 = Sábado (igual que JS Date.getDay())
 */
function isOpenNow(schedules: Schedule[] | undefined): boolean {
  if (!schedules || schedules.length === 0) return false;
  const now    = new Date();
  const dow    = now.getDay();                   // 0-6
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = schedules.find(s => s.day_of_week === dow);
  if (!todaySchedule || todaySchedule.is_closed) return false;

  const opens  = timeToMinutes(todaySchedule.opens_at);
  const closes = timeToMinutes(todaySchedule.closes_at);

  // Maneja cierre pasada la medianoche
  if (closes <= opens) {
    return nowMin >= opens || nowMin < closes;
  }
  return nowMin >= opens && nowMin < closes;
}

// ── Componente: popup de un negocio ──────────────────────────────────────────

function BusinessPopupContent({ business }: { business: Business }) {
  const open = isOpenNow(business.schedules);

  return (
    <div className="w-60 flex flex-col gap-2">
      {/* Imagen de portada */}
      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-muted">
        <Image
          src={getImageUrl(business.coverImage, "sm")}
          alt={business.name}
          fill
          className="object-cover"
          sizes="208px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-2">
        <p className="font-bold text-sm text-foreground leading-tight line-clamp-1">
          {business.name}
        </p>
        {business.category && (
          <p className="text-xs text-muted-foreground">{business.category.name}</p>
        )}
      </div>

      {/* Badge abierto / cerrado */}
      <div className="flex items-center gap-1.5 p-2">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            open
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {open ? "Abierto ahora" : "Cerrado"}
        </span>
      </div>

      {/* Botón de acción */}
      <Link
        href={`/businesses/${business.id}`}
        className="w-full text-center text-xs font-bold py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
      >
        <ExternalLink className="w-3 h-3" />
        Visitar Directorio
      </Link>
    </div>
  );
}

// ── Marcador del negocio con popup ────────────────────────────────────────────

function BusinessMarker({ business }: { business: Business }) {
  if (business.latitude == null || business.longitude == null) return null;

  const color = getPinColor(business.category_id);

  return (
    <MapMarker longitude={business.longitude} latitude={business.latitude}>
      <MarkerContent>
        <div className="relative flex flex-col items-center cursor-pointer group">
          <div
            className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
          > 
            <MapPin className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div className="w-0.5 h-2.5 opacity-60" style={{ backgroundColor: color }} />
        </div>
      </MarkerContent>
      <MarkerPopup closeButton className="p-0 overflow-hidden">
        <BusinessPopupContent business={business} />
      </MarkerPopup>
    </MapMarker>
  );
}

// ── Marcador de posición del usuario (punto azul pulsante) ───────────────────

function UserLocationMarker({ lng, lat }: { lng: number; lat: number }) {
  return (
    <MapMarker longitude={lng} latitude={lat}>
      <MarkerContent>
        <div className="relative flex items-center justify-center">
          {/* Onda pulsante exterior */}
          <span className="absolute inline-flex w-5 h-5 rounded-full bg-blue-400/40 animate-ping" />
          {/* Punto central */}
          <span className="relative inline-flex w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
        </div>
      </MarkerContent>
    </MapMarker>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PublicMapPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["businesses-map"],
    queryFn: () => getBusinesses({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const businesses = response?.data ?? [];
  // Solo los negocios con coordenadas válidas aparecen en el mapa
  const mappedBusinesses = businesses.filter(
    (b): b is Business & { latitude: number; longitude: number } =>
      b.latitude != null && b.longitude != null
  );

  // Estado de geolocalización del visitante — solo en memoria, nunca persiste
  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);

  const handleLocate = useCallback(({ longitude, latitude }: { longitude: number; latitude: number }) => {
    setUserLocation({ lng: longitude, lat: latitude });
  }, []);

  // Seguimiento en tiempo real de la posición del usuario
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      },
      () => { /* Permiso denegado o error — no hacer nada */ },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* Header compacto */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary" />
          <h1 className="font-black text-lg">Mapa de Pisaflores</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {isLoading ? (
            <span>Cargando negocios...</span>
          ) : (
            <span>{mappedBusinesses.length} negocio{mappedBusinesses.length !== 1 ? "s" : ""} en el mapa</span>
          )}
        </div>
      </div>

      {/* Mapa — ocupa el resto de la pantalla */}
      <div className="flex-1 relative">
        <Map
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          maxBounds={MAP_BOUNDS}
        >
          <MapControls
            showZoom
            showLocate
            showFullscreen
            position="bottom-right"
            onLocate={handleLocate}
          />

          {/* Pins de negocios */}
          {mappedBusinesses.map(business => (
            <BusinessMarker key={business.id} business={business} />
          ))}

          {/* Marcador de posición del visitante */}
          {userLocation && (
            <UserLocationMarker lng={userLocation.lng} lat={userLocation.lat} />
          )}
        </Map>

        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Cargando negocios...
            </div>
          </div>
        )}

        {/* Leyenda de colores */}
        {!isLoading && mappedBusinesses.length > 0 && (
          <div className="absolute bottom-10 left-3 flex-col gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-xl p-3 shadow-md z-10 max-w-[180px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Categorías
            </p>
            {mappedBusinesses
              .reduce((acc, b) => {
                // Filtrar duplicados basándonos en el category_id de forma segura
                if (b.category_id && !acc.some(c => c.catId === b.category_id)) {
                  acc.push({
                    catId: b.category_id,
                      catName: b.category?.name || "Sin categoría"
                    });
                }
                return acc;
                }, [] as { catId: string; catName: string }[])
                .map(({ catId, catName }) => (
                  <div key={catId ?? "default"} className="flex items-center gap-2">
                    <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/50"
                    style={{ backgroundColor: getPinColor(catId) }}
                    />
                    <span className="text-[11px] text-foreground truncate">{catName}</span>
                  </div>
                ))
                }
          </div>
        )}
      </div>
    </div>
  );
}
