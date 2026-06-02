"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, ShoppingBag, Store } from "lucide-react";

import { getGlobalProducts, getCategories, type GlobalProduct } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { appToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilter, SearchBar } from "@/components/search-filters";
import { PaginationBar } from "@/components/pagination-bar";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const LIMIT = 20;

/** Short random string that identifies the current shuffle session */
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
      {/* Imagen cuadrada */}
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

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-0.5">
        {/* Precio */}
        <span className="text-base font-black text-foreground leading-tight">
          ${product.price}
        </span>
        {/* Nombre */}
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {product.name}
        </p>
        {/* Negocio */}
        <span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
          <Store className="w-3 h-3 shrink-0" />
          {product.business_name}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsMarketplacePage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [inputValue,       setInputValue]       = useState("");
  const [search,           setSearch]           = useState("");      // debounced
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [catalogSeed,      setCatalogSeed]      = useState<string>(() => newSeed());

  // Debounce: actualiza `search` 300ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue);
      setCurrentPage(1); // reset al buscar
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // ── Categorías ────────────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn:  getCategories,
    staleTime: Infinity,
  });

  // ── Productos globales ────────────────────────────────────────────────────
  const offset = (currentPage - 1) * LIMIT;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products-global", search, selectedCategory, currentPage, catalogSeed],
    queryFn:  () => getGlobalProducts({
      q:          search     || undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      seed:       catalogSeed,
      limit:      LIMIT,
      offset,
    }),
    staleTime: 2 * 60 * 1000,   // 2 min — los datos no cambian tan seguido
    placeholderData: (prev) => prev, // mantiene datos anteriores mientras carga la nueva página
  });

  // Notificar errores sin lanzar excepciones al render
  useEffect(() => {
    if (isError) {
      appToast.error("No se pudo cargar el catálogo.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, [isError, error]);

  const products    = data?.data    ?? [];
  const total       = data?.total   ?? 0;
  const totalPages  = Math.max(1, Math.ceil(total / LIMIT));

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleShuffle = useCallback(() => {
    setCatalogSeed(newSeed());
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  }, []);

  // buildUrl para PaginationBar — mantiene todos los estados actuales
  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (search)                  params.set("q",        search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (page > 1)                params.set("page",     String(page));
      params.set("seed", catalogSeed);
      const qs = params.toString();
      return `/products${qs ? `?${qs}` : ""}`;
    },
    [search, selectedCategory, catalogSeed]
  );

  // Categorías con formato que espera CategoryFilter (id + nombre)
  const categoryItems = useMemo(() => categories, [categories]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl flex flex-col gap-5 animate-fade-in">

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-primary" />
          Catálogo Global
        </h1>
        <p className="text-sm text-muted-foreground">
          Todos los productos de los negocios de Pisaflores en un solo lugar.
        </p>
      </div>

      {/* ── Barra de búsqueda + botón mezclar ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* SearchBar controlado (no usa form GET, sino estado React) */}
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
            fill="none" stroke="currentColor" strokeWidth={2}
            viewBox="0 0 24 24"
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

      {/* ── Filtro de categorías ──────────────────────────────────────────── */}
      {/* CategoryFilter usa <Link> — interceptamos el click para actualizar estado en lugar de navegar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Pill "Todos" */}
        <button
          onClick={() => handleCategoryChange("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Todos
        </button>
        {categoryItems.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Contador de resultados ────────────────────────────────────────── */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground -mt-1">
          {total > 0
            ? `${total} producto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
            : "Sin resultados para esta búsqueda"}
        </p>
      )}

      {/* ── Grilla ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <ProductSkeletonGrid />
      ) : products.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center border border-dashed border-border rounded-2xl bg-muted/10">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
          <div>
            <p className="font-bold text-lg">Sin productos</p>
            <p className="text-muted-foreground text-sm">
              {search
                ? `No encontramos resultados para "${search}"`
                : "No hay productos disponibles en esta categoría."}
            </p>
          </div>
          {(search || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setInputValue(""); setSelectedCategory("all"); setCurrentPage(1); }}
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

      {/* ── Paginación ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          buildUrl={buildUrl}
        />
      )}
    </div>
  );
}
