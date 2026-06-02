"use client";

/**
 * NavSearchInput — Buscador del Navbar
 *
 * useSearchParams() requiere Suspense para que Next.js pueda prerenderizar
 * estáticamente el shell sin ejecutarlo en build time.
 *
 * Patrón: componente interno (SearchInputContent) contiene el hook,
 * componente exportado (NavSearchInput) lo envuelve en Suspense con un
 * fallback visualmente idéntico para evitar layout shift.
 */

import { Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSearchInputProps {
  className?: string;
  placeholder?: string;
  size?: "sm" | "md";
  onSubmit?: () => void;
}

// ── Componente interno — contiene useSearchParams ─────────────────────────────

function SearchInputContent({
  className,
  placeholder = "Buscar...",
  size = "sm",
  onSubmit,
}: NavSearchInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-rellenar con el valor actual de ?q= cuando la URL cambia
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
          size === "sm" ? "pl-10 pr-4 py-2 w-64" : "pl-10 pr-4 py-3 w-full text-base"
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

// ── Fallback estático — visualmente idéntico, sin comportamiento ──────────────

function SearchInputFallback({ className, placeholder = "Buscar...", size = "sm" }: NavSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        placeholder={placeholder}
        disabled
        className={cn(
          "rounded-full bg-muted/50 border border-transparent",
          "outline-none text-sm",
          size === "sm" ? "pl-10 pr-4 py-2 w-64" : "pl-10 pr-4 py-3 w-full text-base"
        )}
      />
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
    </div>
  );
}

// ── Componente exportado — envuelve en Suspense ───────────────────────────────

export function NavSearchInput(props: NavSearchInputProps) {
  return (
    <Suspense fallback={<SearchInputFallback {...props} />}>
      <SearchInputContent {...props} />
    </Suspense>
  );
}
