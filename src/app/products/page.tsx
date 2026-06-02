"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Shuffle, ShoppingBag, Store } from "lucide-react";

import { getGlobalProducts, getCategories, type GlobalProduct } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { appToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/pagination-bar";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const LIMIT = 20;

function newSeed(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON GRID
// ─────────────────────────────────────────────────────────────────────────────
function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlobalProductCard({ product }: { product: GlobalProduct }) {
  const imgSrc = product.cover_image
    ? getImageUrl(product.cover_image, "md")
    : "/placeholder.jpg";

  return (
    <Link
      href={`/businesses/${product.business_id}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200"
    >
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {!product.is_available && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded rotate-[-8deg] shadow">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-0.5">
        <span className="text-base font-black text-foreground leading-tight">
          ${product.price}
        </span>
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {product.name}
        </p>
        <span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
          <Store className="w-3 h-3 shrink-0" />
          {product.business_name}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER PAGE — usa useSearchParams, envuelto en Suspense
// ─────────────────────────────────────────────────────────────────────────────
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer estado inicial desde la URL
  const pageFromUrl     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const searchFromUrl   = searchParams.get("q") ?? "";
  const categoryFromUrl = searchParams.get("category") ?? "all";
  // La seed viene de la URL para que la paginación sea consistente en la misma sesión
  const seedFromUrl     = searchParams.get("seed") ?? newSeed();

  const [inputValue, setInputValue] = useState(searchFromUrl);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);

  // Cargar categorías una vez
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Debounce del buscador — navega a ?q=... reseteando a page=1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue === searchFromUrl) return; // sin cambio
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", inputValue);
      params.delete("page"); // reset página
      if (!inputValue) params.delete("q");
      router.push(`/products?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── buildUrl para PaginationBar — cambia solo el page, preserva todo lo demás
  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) params.set("page", String(page));
      else          params.delete("page");
      return `/products?${params.toString()}`;
    },
    [searchParams]
  );

  // ── Cambiar categoría — navega reseteando página
  const handleCategoryChange = useCallback(
    (catId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (catId !== "all") params.set("category", catId);
      else                 params.delete("category");
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  // ── Mezclar — nueva seed, reset página
  const handleShuffle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", newSeed());
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  // ── Fetch
  const offset = (pageFromUrl - 1) * LIMIT;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products-global", searchFromUrl, categoryFromUrl, pageFromUrl, seedFromUrl],
    queryFn: () => getGlobalProducts({
      q:          searchFromUrl  || undefined,
      categoryId: categoryFromUrl !== "all" ? categoryFromUrl : undefined,
      seed:       seedFromUrl,
      limit:      LIMIT,
      offset,
    }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (isError) {
      appToast.error("No se pudo cargar el catálogo.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, [isError, error]);

  const products   = data?.data   ?? [];
  const total      = data?.total  ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Render
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl flex flex-col gap-5 animate-fade-in">

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-primary" />
          Catálogo Global
        </h1>
        <p className="text-sm text-muted-foreground">
          Todos los productos de los negocios de Pisaflores en un solo lugar.
        </p>
      </div>

      {/* Buscador + mezclar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
          <svg
            className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <Button
          variant="outline"
          onClick={handleShuffle}
          className="shrink-0 gap-2 font-bold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
        >
          <Shuffle className="w-4 h-4" />
          Mezclar catálogo
        </Button>
      </div>

      {/* Filtro categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            categoryFromUrl === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              categoryFromUrl === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Contador */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground -mt-1">
          {total > 0
            ? `${total} producto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
            : "Sin resultados para esta búsqueda"}
        </p>
      )}

      {/* Grilla */}
      {isLoading ? (
        <ProductSkeletonGrid />
      ) : products.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center border border-dashed border-border rounded-2xl bg-muted/10">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
          <div>
            <p className="font-bold text-lg">Sin productos</p>
            <p className="text-muted-foreground text-sm">
              {searchFromUrl
                ? `No encontramos resultados para "${searchFromUrl}"`
                : "No hay productos disponibles en esta categoría."}
            </p>
          </div>
          {(searchFromUrl || categoryFromUrl !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/products")}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(prod => (
            <GlobalProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={pageFromUrl}
          totalPages={totalPages}
          buildUrl={buildUrl}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT — envuelve en Suspense por useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsMarketplacePage() {
  return (
    <Suspense fallback={<ProductSkeletonGrid />}>
      <ProductsPageContent />
    </Suspense>
  );
}