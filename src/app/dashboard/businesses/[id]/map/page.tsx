"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Save } from "lucide-react";

import { useBusiness } from "@/hooks/use-data.hook";
import { updateBusinessCoordinates } from "@/lib/api";
import { appToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
} from "@/components/ui/map";
import {
  MAP_CENTER,
  MAP_EDITOR_ZOOM,
} from "@/lib/map-config";

// ── Bounding box aproximado de 150 km alrededor de Pisaflores ─────────────────
// SW: [-100.58, 18.78]  NE: [-97.88, 21.48]
const BOUNDS_SW: [number, number] = [-100.58, 18.78]; // [lng, lat]
const BOUNDS_NE: [number, number] = [-97.88,  21.48];

function clampToBounds(lng: number, lat: number): { lng: number; lat: number; clamped: boolean } {
  const clampedLng = Math.min(Math.max(lng, BOUNDS_SW[0]), BOUNDS_NE[0]);
  const clampedLat = Math.min(Math.max(lat, BOUNDS_SW[1]), BOUNDS_NE[1]);
  const clamped = clampedLng !== lng || clampedLat !== lat;
  return { lng: clampedLng, lat: clampedLat, clamped };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BusinessMapEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: business, isLoading } = useBusiness(id);

  // Posición actual del pin — usa coordenadas del negocio o el centro por defecto
  const [pinPosition, setPinPosition] = useState<{ lng: number; lat: number }>(() => ({
    lng: business?.longitude ?? MAP_CENTER[0],
    lat: business?.latitude  ?? MAP_CENTER[1],
  }));

  const [isSaving, setIsSaving] = useState(false);

  // Centro inicial del mapa — donde enfocar al abrir
  const mapCenter: [number, number] = [
    business?.longitude ?? MAP_CENTER[0],
    business?.latitude  ?? MAP_CENTER[1],
  ];

  const handleDragEnd = useCallback(
    ({ lng, lat }: { lng: number; lat: number }) => {
      const { lng: clampedLng, lat: clampedLat, clamped } = clampToBounds(lng, lat);
      if (clamped) {
        appToast.error("Ubicación fuera del área de cobertura.", {
          description: "El marcador fue revertido al límite permitido (150 km alrededor de Pisaflores).",
        });
      }
      setPinPosition({ lng: clampedLng, lat: clampedLat });
    },
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBusinessCoordinates(id, pinPosition.lat, pinPosition.lng);
      appToast.success("Ubicación guardada.", {
        description: `Tu negocio ahora aparece en el mapa de Pisaflores.`,
      });
      router.push(`/dashboard/businesses/${id}`);
    } catch (e) {
      appToast.error(
        e instanceof Error ? e.message : "No se pudo guardar la ubicación."
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
          <Link href={`/dashboard/businesses/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Ubicar en el mapa
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Cargando..."
              : `Arrastra el pin para posicionar "${business?.name ?? "tu negocio"}" en el mapa.`}
          </p>
        </div>
      </div>

      {/* Instrucción */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground flex items-start gap-2">
        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          Arrastra el <strong>marcador verde</strong> hasta la ubicación exacta de tu negocio.
          Los cambios no se guardan hasta que presiones <strong>Guardar Ubicación</strong>.
        </span>
      </div>

      {/* Mapa */}
      <div className="h-[480px] rounded-2xl overflow-hidden border border-border shadow-sm">
        <Map
          center={mapCenter}
          zoom={MAP_EDITOR_ZOOM}
          maxBounds={[BOUNDS_SW, BOUNDS_NE]}
        >
          <MapControls showZoom showLocate position="bottom-right" />
          <MapMarker
            longitude={pinPosition.lng}
            latitude={pinPosition.lat}
            draggable
            onDragEnd={handleDragEnd}
          >
            <MarkerContent>
              {/* Pin estilizado con el color primario del tema */}
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                </div>
                {/* Cola del pin */}
                <div className="w-0.5 h-3 bg-primary/60" />
              </div>
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>

      {/* Coordenadas actuales */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg px-4 py-2 border border-border">
        <span>Lat: <strong className="text-foreground">{pinPosition.lat.toFixed(6)}</strong></span>
        <span>Lng: <strong className="text-foreground">{pinPosition.lng.toFixed(6)}</strong></span>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild disabled={isSaving}>
          <Link href={`/dashboard/businesses/${id}`}>Cancelar</Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="px-8 shadow-md gap-2"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-4 h-4" /> Guardar Ubicación</>
          )}
        </Button>
      </div>
    </div>
  );
}
