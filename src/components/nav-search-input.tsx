"use client";

/**
 * NavSearchInput — Buscador del Navbar
 *
 * - Lee el query param `?q=` actual con useSearchParams para pre-rellenar el valor
 *   cuando el usuario ya está en /search (o cualquier página con ?q=).
 * - Navega a /search?q=... al hacer submit.
 * - Acepta un callback onSubmit para que el navbar pueda cerrar el menú mobile.
 */

import { useSearchParams, useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSearchInputProps {
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Placeholder del input */
  placeholder?: string;
  /** Tamaño visual: "sm" para desktop, "md" para mobile */
  size?: "sm" | "md";
  /** Callback que se ejecuta justo antes de navegar (ej. cerrar menú mobile) */
  onSubmit?: () => void;
}

export function NavSearchInput({
  className,
  placeholder = "Buscar...",
  size = "sm",
  onSubmit,
}: NavSearchInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-rellenar con el valor actual de ?q= cuando el componente monta o la URL cambia
  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (inputRef.current) {
      inputRef.current.value = currentQ;
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    onSubmit?.();
    // Navegar a /search preservando el query (vacío = ver todos)
    router.push(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative group", className)}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        className={cn(
          "rounded-full bg-muted/50 border border-transparent",
          "focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20",
          "outline-none transition-all text-sm",
          size === "sm"
            ? "pl-10 pr-4 py-2 w-64"
            : "pl-10 pr-4 py-3 w-full text-base"
        )}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
      >
        <Search className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
      </button>
    </form>
  );
}
