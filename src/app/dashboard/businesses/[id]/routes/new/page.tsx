"use client";

import { use, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft, Loader2, Route, MapPin, Flag, Navigation,
  RotateCcw, Trash2, Save, Package, Users, Palette, Circle,
  Clock,
} from "lucide-react";

import { createTravelRoute } from "@/lib/api";
import { getRouteGeometry, type Coordinate } from "@/lib/osrm";
import { appToast } from "@/lib/toast";
import { MAP_CENTER, MAP_EDITOR_ZOOM } from "@/lib/map-config";

// Bounding box ~150km alrededor de Pisaflores para maxBounds
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-100.58, 18.78], // SW [lng, lat]
  [-97.88,  21.48], // NE [lng, lat]
];
import { TravelRouteFormSchema, type TravelRouteFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  Map, MapControls, MapMarker, MarkerContent, MarkerLabel, MapRoute,
} from "@/components/ui/map";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface LatLng { lat: number; lng: number; }

type ClickMode = "origin" | "destination" | "waypoint" | "idle";

// GeoJSON LineString coordinates [lng, lat][]
type RouteCoords = [number, number][];

const ROUTE_COLORS = [
  "#3b82f6", // azul
  "#22c55e", // verde
  "#f97316", // naranja
  "#ef4444", // rojo
  "#a855f7", // morado
  "#06b6d4", // cyan
  "#eab308", // amarillo
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte GeoJSON coordinates [lng,lat][] → formato MapRoute [lng,lat][] */
function toMapRouteCoords(geojsonCoords: number[][]): [number, number][] {
  return geojsonCoords.map(c => [c[0], c[1]] as [number, number]);
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────────────────────

export default function NewTravelRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: businessId } = use(params);
  const router = useRouter();

  // ── Estado de puntos en el mapa ───────────────────────────────────────────
  const [origin,      setOrigin]      = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [waypoints,   setWaypoints]   = useState<LatLng[]>([]);
  const [clickMode,   setClickMode]   = useState<ClickMode>("origin");

  // ── Estado de ruta OSRM ────────────────────────────────────────────────────
  const [routeCoords,       setRouteCoords]       = useState<RouteCoords | null>(null);
  const [estimatedMinutes,  setEstimatedMinutes]  = useState<number | null>(null);
  const [isCalculating,     setIsCalculating]     = useState(false);

  // ── Formulario con React Hook Form + Zod ────────────────────────────────
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d;
  }, []);

  const {
    register,
    handleSubmit: rhfSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TravelRouteFormValues>({
    resolver: zodResolver(TravelRouteFormSchema),
    defaultValues: {
      available_seats:  4,
      accepts_packages: false,
      route_color:      ROUTE_COLORS[0],
    },
  });

  const { field: departureDateField } = useController({ name: "departure_time", control });
  const { field: routeColorField    } = useController({ name: "route_color",    control });

  // Leer route_color del form para usarlo en el mapa en tiempo real
  const routeColor = watch("route_color") ?? ROUTE_COLORS[0];

  // ── Calcular ruta OSRM — reacciona a origen, destino Y waypoints ──────────
  useEffect(() => {
    if (!origin || !destination) {
      setRouteCoords(null);
      setEstimatedMinutes(null);
      return;
    }

    let cancelled = false;
    setIsCalculating(true);

    // Orden estricto: origen → paradas intermedias → destino
    const coords: Coordinate[] = [
      { lat: origin.lat,      lng: origin.lng },
      ...waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
      { lat: destination.lat, lng: destination.lng },
    ];

    getRouteGeometry(coords).then(result => {
      if (cancelled) return;
      setIsCalculating(false);
      if (result.geometry) {
        setRouteCoords(toMapRouteCoords(result.geometry.coordinates));
        setEstimatedMinutes(result.durationMinutes);
      } else {
        setRouteCoords(null);
        setEstimatedMinutes(null);
        appToast.error("No se pudo calcular la ruta.", {
          description: "Verifica que los puntos sean accesibles por carretera.",
        });
      }
    });

    return () => { cancelled = true; };
  }, [origin, destination, waypoints]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleOriginDrag = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    setOrigin({ lat, lng });
  }, []);

  const handleDestinationDrag = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    setDestination({ lat, lng });
  }, []);

  // ── Click en el mapa para colocar pins ────────────────────────────────────
  // El componente Map no expone onClick directamente; usamos el estado para
  // que el usuario elija el modo y luego arrastre el pin ya colocado.
  const placeOrigin = useCallback(() => {
    if (!origin) {
      setOrigin({ lat: MAP_CENTER[1], lng: MAP_CENTER[0] });
    }
    setClickMode("idle");
  }, [origin]);

  const placeDestination = useCallback(() => {
    if (!destination) {
      setDestination({ lat: MAP_CENTER[1] + 0.05, lng: MAP_CENTER[0] + 0.05 });
    }
    setClickMode("idle");
  }, [destination]);

  // ── Undo / Clear ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (destination) {
      setDestination(null);
      setClickMode("destination");
    } else if (origin) {
      setOrigin(null);
      setClickMode("origin");
    }
  }, [origin, destination]);

  const handleClear = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setRouteCoords(null);
    setEstimatedMinutes(null);
    setClickMode("origin");
  }, []);

  // ── Añadir parada intermedia ──────────────────────────────────────────────
  const addWaypoint = useCallback(() => {
    // Colocar la parada ligeramente desplazada del centro para que sea visible
    const offset = waypoints.length * 0.03;
    setWaypoints(prev => [
      ...prev,
      { lat: MAP_CENTER[1] + 0.02 + offset, lng: MAP_CENTER[0] + 0.02 + offset },
    ]);
    setClickMode("idle");
  }, [waypoints.length]);

  const handleWaypointDrag = useCallback(
    (index: number, { lng, lat }: { lng: number; lat: number }) => {
      setWaypoints(prev => prev.map((wp, i) => i === index ? { lat, lng } : wp));
    },
    []
  );

  // ── Submit con validación Zod ────────────────────────────────────────────
  const onSubmit = async (data: TravelRouteFormValues) => {
    if (!origin || !destination) {
      appToast.error("Define el punto de origen y destino en el mapa.");
      return;
    }
    try {
      await createTravelRoute(businessId, {
        origin_name:        `Lat ${origin.lat.toFixed(4)}, Lng ${origin.lng.toFixed(4)}`,
        origin_lat:          origin.lat,
        origin_lng:          origin.lng,
        dest_name:          `Lat ${destination.lat.toFixed(4)}, Lng ${destination.lng.toFixed(4)}`,
        dest_lat:            destination.lat,
        dest_lng:            destination.lng,
        departure_time:      data.departure_time.toISOString(),
        waypoints:           { stops: waypoints, geojson: routeCoords ?? [] },
        estimated_duration:  estimatedMinutes ?? undefined,
        available_seats:     data.available_seats,
        accepts_packages:    data.accepts_packages,
        route_color:         data.route_color,
      });
      appToast.success("¡Ruta publicada!", {
        description: "Ya está visible para los usuarios del directorio.",
      });
      router.push(`/dashboard/businesses/${businessId}`);
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "No se pudo publicar la ruta.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto pb-12">

      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
          <Link href={`/dashboard/businesses/${businessId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Route className="w-6 h-6 text-primary" />
            Trazar Nueva Ruta
          </h1>
          <p className="text-sm text-muted-foreground">
              Diseña el trayecto para tu próximo viaje. Fija tu origen, destino y paradas intermedias.
          </p>
        </div>
      </div>

      <div className="relative h-[750px] rounded-2xl overflow-hidden border border-border shadow-sm">

        {/* Header flotante sobre el mapa */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 shadow-md">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-7 w-7 shrink-0">
            <Link href={`/dashboard/businesses/${businessId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <Route className="w-4 h-4 text-primary" />
            <span className="text-sm font-black">Trazar Nueva Ruta</span>
          </div>
        </div>

        {/* Barra de acciones flotante sobre el mapa */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-background backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md">
          <Button
            size="sm"
            variant={origin ? "secondary" : "default"}
            onClick={placeOrigin}
            className="gap-1.5 h-7 text-xs"
          >
            <MapPin className="w-3 h-3 text-green-500" />
          </Button>
          <Button
            size="sm"
            variant={destination ? "secondary" : origin ? "default" : "outline"}
            onClick={placeDestination}
            disabled={!origin}
            className="gap-1.5 h-7 text-xs"
          >
            <Flag className="w-3 h-3 text-red-500" />
          </Button>
          <Button
            size="sm"
            variant={clickMode === "waypoint" ? "default" : "outline"}
            onClick={addWaypoint}
            disabled={!origin || !destination}
            className="gap-1.5 h-7 text-xs"
            title="Añade paradas intermedias para desviar la ruta"
          >
            <Circle className="w-3 h-3 text-blue-400" />
            {waypoints.length > 0 ? `Paradas (${waypoints.length})` : "Añadir Parada"}
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button size="sm" variant="ghost" onClick={handleUndo} disabled={!origin} className="gap-1 h-7 text-xs">
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClear} disabled={!origin} className="gap-1 h-7 text-xs text-destructive hover:text-destructive">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Badge de cálculo OSRM */}
        {isCalculating && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-2 shadow">
            <Loader2 className="w-3 h-3 animate-spin" /> Calculando ruta...
          </div>
        )}

        {/* Badge de duración estimada */}
        {estimatedMinutes !== null && !isCalculating && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-2 shadow text-primary">
            <Navigation className="w-3 h-3 shrink-0" />
            ~{estimatedMinutes} min de trayecto
          </div>
        )}

        <Map center={MAP_CENTER} zoom={MAP_EDITOR_ZOOM} maxBounds={MAP_BOUNDS}>
          <MapControls showZoom showLocate showFullscreen showCompass position="bottom-right" />

          {/* Pins de WAYPOINTS — azul, iterados */}
          {waypoints.map((wp, idx) => (
            <MapMarker
              key={"wp-" + idx}
              longitude={wp.lng}
              latitude={wp.lat}
              draggable
              onDragEnd={(pos) => handleWaypointDrag(idx, pos)}
            >
              <MarkerContent>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                    <Circle className="w-3 h-3 text-white fill-white" />
                  </div>
                  <div className="w-0.5 h-2.5 bg-blue-500/60" />
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-background/80 px-1 rounded">
                  Parada {idx + 1}
                </span>
              </MarkerLabel>
            </MapMarker>
          ))}

          {/* Pin de ORIGEN — verde */}
          {origin && (
            <MapMarker
              longitude={origin.lng}
              latitude={origin.lat}
              draggable
              onDragEnd={handleOriginDrag}
            >
              <MarkerContent>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="w-0.5 h-3 bg-green-500/60" />
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom">
                <span className="text-[11px] font-bold text-green-700 dark:text-green-400 bg-background/80 px-1 rounded">
                  Origen
                </span>
              </MarkerLabel>
            </MapMarker>
          )}

          {/* Pin de DESTINO — rojo */}
          {destination && (
            <MapMarker
              longitude={destination.lng}
              latitude={destination.lat}
              draggable
              onDragEnd={handleDestinationDrag}
            >
              <MarkerContent>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                    <Flag className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="w-0.5 h-3 bg-red-500/60" />
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom">
                <span className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-background/80 px-1 rounded">
                  Destino
                </span>
              </MarkerLabel>
            </MapMarker>
          )}

          {/* Línea de ruta */}
          {routeCoords && routeCoords.length > 1 && (
            <MapRoute
              coordinates={routeCoords}
              color={routeColor}
              width={4}
              opacity={0.85}
            />
          )}
        </Map>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground/90 space-y-4">
        {/* Cabecera del tutorial */}
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
            💡
          </span>
          <span>¿Cómo trazar tu ruta?</span>
        </div>

        {/* Lista de pasos */}
        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <p>
              <strong>1. Inicio:</strong> Selecciona este icono y haz clic en el mapa para colocar el punto de partida.
            </p>
          </li>

          <li className="flex items-start gap-3">
            <Flag className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>
              <strong>2. Destino:</strong> Selecciona este icono y haz clic en el mapa para indicar el punto de llegada.
            </p>
          </li>

          <li className="flex items-start gap-3">
            <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong>3. Paradas:</strong> Selecciona este icono y haz clic en el mapa para añadir desvíos o puntos intermedios.
            </p>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/50"></span>
            </div>
            <p className="text-foreground/80">
              <strong>4. Ajustar:</strong> Puedes modificar la posición de los puntos arrastrándolos; la ruta se recalculará automáticamente.
            </p>
          </li>
        </ul>

        {/* Nota final de herramientas */}
        <div className="bg-background/50 rounded-lg p-3 border border-border/50 mt-2 flex items-start gap-2">
          <p className="text-xs text-foreground/70 leading-relaxed">
            <strong>Herramientas:</strong> Usa <RotateCcw className="inline w-3 h-3 mx-0.5 text-foreground" /> para deshacer el último punto o <Trash2 className="inline w-3 h-3 text-red-500 mx-0.5" /> para limpiar toda la ruta y comenzar de cero.
          </p>
        </div>    
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground/90 space-y-4">
        <h2 className="font-bold text-base flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" /> Detalles del Viaje
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Completa la información del trayecto.
        </p>
      </div>

      <div className="w-full md:w-[350px] md:h-full md:overflow-y-auto border-t md:border-t-0 md:border-l border-border bg-background rounded-2xl">
        <form onSubmit={rhfSubmit(onSubmit)} className="flex flex-col gap-0">

          {/* Campos */}
          <div className="flex flex-col gap-5 px-5 py-5">

            {/* Fecha y hora — DateTimePicker con límite de 2 meses */}
            <div className="space-y-2">
              <Label htmlFor="departure_time" className="flex items-center gap-1.5 text-sm">
                Fecha y Hora de Salida <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                id="departure_time"
                value={departureDateField.value}
                onChange={departureDateField.onChange}
                maxDate={maxDate}
                placeholder="Selecciona fecha y hora de salida"
                className={errors.departure_time ? "border-destructive" : ""}
              />
              {errors.departure_time && (
                <p className="text-xs text-destructive">{errors.departure_time.message}</p>
              )}
            </div>

            {/* Asientos */}
            <div className="space-y-2">
              <Label htmlFor="available_seats" className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" /> Asientos Disponibles
              </Label>
              <Input
                id="available_seats"
                type="number"
                min={0}
                max={50}
                className={"w-32 " + (errors.available_seats ? "border-destructive" : "")}
                {...register("available_seats", { valueAsNumber: true })}
              />
              {errors.available_seats && (
                <p className="text-xs text-destructive">{errors.available_seats.message}</p>
              )}
            </div>

            {/* Acepta paquetes */}
            <div className="flex items-center gap-3">
              <input
                id="accepts_packages"
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                {...register("accepts_packages")}
              />
              <Label htmlFor="accepts_packages" className="cursor-pointer flex items-center gap-1.5 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" /> Acepta Encomiendas / Paquetes
              </Label>
            </div>

            {/* Color de ruta — controlado */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Palette className="w-4 h-4 text-muted-foreground" /> Color de Ruta
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {ROUTE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => routeColorField.onChange(color)}
                    className={"w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 " + (routeColorField.value === color ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: color }}
                    aria-label={"Color " + color}
                  />
                ))}
                <label
                  className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground transition-colors"
                  title="Color personalizado"
                >
                  <Palette className="w-3 h-3 text-muted-foreground" />
                  <input
                    type="color"
                    value={routeColorField.value}
                    onChange={e => routeColorField.onChange(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-5 py-4 border-t border-border flex flex-col gap-2 mt-auto">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 shadow-md"
              disabled={isSubmitting || !origin || !destination}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
              ) : (
                <><Save className="w-4 h-4" /> Publicar Ruta</>
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild disabled={isSubmitting} className="w-full">
              <Link href={`/dashboard/businesses/${businessId}`}>Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
