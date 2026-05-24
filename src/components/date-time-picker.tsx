"use client";

/**
 * DateTimePicker — Selector de fecha y hora unificado
 *
 * Uso con React Hook Form:
 *   const { field } = useController({ name: "starts_at", control });
 *   <DateTimePicker value={field.value} onChange={field.onChange} />
 *
 * Uso standalone:
 *   const [date, setDate] = useState<Date | undefined>();
 *   <DateTimePicker value={date} onChange={setDate} />
 *
 * El componente:
 * - Deshabilita días anteriores a hoy en el calendario
 * - Si el día seleccionado es hoy, bloquea horas pasadas en tiempo real
 * - Devuelve un objeto Date con fecha y hora unificadas
 * - Compatible con React Hook Form / Zod (acepta Date | undefined)
 */

import * as React from "react";
import { format, isToday, isBefore, startOfMinute } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Devuelve la hora actual en formato HH:MM */
function getCurrentTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Extrae HH:MM de un objeto Date */
function getTimeFromDate(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Combina una fecha (solo día) con una cadena de hora "HH:MM" en un nuevo Date */
function combineDateAndTime(date: Date, time: string): Date {
  const [hh, mm] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hh, mm, 0, 0);
  return result;
}

/** Verifica si una hora "HH:MM" en el día de hoy ya pasó */
function isTimePastForToday(time: string): boolean {
  const [hh, mm] = time.split(":").map(Number);
  const candidate = new Date();
  candidate.setHours(hh, mm, 0, 0);
  return isBefore(startOfMinute(candidate), startOfMinute(new Date()));
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

export interface DateTimePickerProps {
  /** Valor actual — objeto Date o undefined */
  value?: Date;
  /** Callback que devuelve el Date combinado (fecha + hora) o undefined al limpiar */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder del botón cuando no hay fecha seleccionada */
  placeholder?: string;
  /** Deshabilita el componente completo */
  disabled?: boolean;
  /** Clases adicionales para el botón trigger */
  className?: string;
  /** ID para asociar con un <Label htmlFor="..."> */
  id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecciona fecha y hora",
  disabled = false,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Estado interno de hora como string "HH:MM"
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? getTimeFromDate(value) : ""
  );
  // Error de hora pasada (solo aplica cuando el día seleccionado es hoy)
  const [timeError, setTimeError] = React.useState<string | null>(null);

  // Sincronizar timeValue cuando el value externo cambia
  React.useEffect(() => {
    if (value) {
      setTimeValue(getTimeFromDate(value));
    } else {
      setTimeValue("");
    }
  }, [value]);

  // ── Selección de día en el calendario ──────────────────────────────────────
  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      onChange?.(undefined);
      setTimeValue("");
      setTimeError(null);
      return;
    }

    // Si ya había una hora seleccionada, combinar con el nuevo día
    if (timeValue) {
      // Si el nuevo día es hoy y la hora ya pasó, limpiar la hora
      if (isToday(day) && isTimePastForToday(timeValue)) {
        setTimeValue("");
        setTimeError("La hora seleccionada ya pasó. Elige una hora futura.");
        onChange?.(day); // guardamos el día sin hora válida
        return;
      }
      setTimeError(null);
      onChange?.(combineDateAndTime(day, timeValue));
    } else {
      // Sin hora aún: guardar solo el día (sin hora definida)
      onChange?.(day);
    }
  };

  // ── Cambio de hora ─────────────────────────────────────────────────────────
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (!newTime) {
      setTimeError(null);
      return;
    }

    // Validar hora pasada si el día seleccionado es hoy
    if (value && isToday(value) && isTimePastForToday(newTime)) {
      setTimeError("La hora seleccionada ya pasó. Elige una hora futura.");
      setTimeValue(""); // limpiar el input
      // Notificar al padre con solo la fecha (sin hora válida)
      const dayOnly = new Date(value);
      dayOnly.setHours(0, 0, 0, 0);
      onChange?.(dayOnly);
      return;
    }

    setTimeError(null);

    // Combinar con el día actual si existe
    if (value) {
      onChange?.(combineDateAndTime(value, newTime));
    }
  };

  // ── Etiqueta del botón trigger ─────────────────────────────────────────────
  const triggerLabel = React.useMemo(() => {
    if (!value) return placeholder;
    const hasTime = timeValue && !timeError;
    if (hasTime) {
      return format(combineDateAndTime(value, timeValue), "d 'de' MMMM yyyy, HH:mm", { locale: es });
    }
    return format(value, "d 'de' MMMM yyyy", { locale: es });
  }, [value, timeValue, timeError, placeholder]);

  // Día de hoy al inicio del día (para deshabilitar días pasados)
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        // Evitar que el popover se cierre al interactuar con el input de hora
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-slot=popover-content]")) return;
          setOpen(false);
        }}
      >
        {/* Calendario */}
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          disabled={{ before: today }}
          initialFocus
          locale={es}
        />

        {/* Separador */}
        <div className="border-t border-border mx-2" />

        {/* Selector de hora */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Hora</span>
            {value && isToday(value) && (
              <span className="ml-auto text-xs text-muted-foreground">
                Mín: {getCurrentTime()}
              </span>
            )}
          </div>

          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={!value} // deshabilitar hasta que haya un día seleccionado
            className={cn(
              // Base — mismos estilos que los <Input> del proyecto
              "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs",
              "transition-colors placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Ocultar el picker nativo del navegador
              "appearance-none [&::-webkit-calendar-picker-indicator]:hidden",
              // Estado de error
              timeError
                ? "border-destructive ring-destructive/20"
                : "border-input"
            )}
          />

          {/* Mensaje de error de hora pasada */}
          {timeError && (
            <div className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{timeError}</span>
            </div>
          )}

          {/* Botón de confirmar — cierra el popover */}
          {value && timeValue && !timeError && (
            <Button
              size="sm"
              className="w-full mt-1"
              onClick={() => setOpen(false)}
            >
              Confirmar
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
