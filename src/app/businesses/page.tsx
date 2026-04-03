import Link from "next/link";
import { Store, Star, MapPin, Clock, Filter, ArrowRight, Search } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinesses, getCategories } from "@/lib/api";
import { BusinessCard } from "@/components/business-card";
import { getQueryClient } from "@/lib/get-query-client";

export const metadata = {
  title: "Directorio de Negocios | Bazar Pisaflores",
  description: "Explora todos los negocios locales en Pisaflores.",
};

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const currentCategory = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';

  const queryClient = getQueryClient();

  // Prefetch data on the server to hydrate the client-side cache
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: getCategories }),
    queryClient.prefetchQuery({
      queryKey: ["businesses", currentCategory, query],
      queryFn: () => getBusinesses({ category_id: currentCategory, query })
    }),
  ]);

  const [categories, businesses] = await Promise.all([
    getCategories(),
    getBusinesses({ category_id: currentCategory, query })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1 animate-slide-up opacity-0">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-primary" />
                Todos los Negocios
              </h1>
              <p className="text-muted-foreground text-lg">
                Descubre y apoya el comercio local de Pisaflores.
              </p>
            </div>

            <form action="/businesses" className="relative w-full md:w-80 shrink-0 text-card-foreground">
              {currentCategory !== 'all' && <input type="hidden" name="category" value={currentCategory} />}
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Buscar negocio..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
            <Button variant="outline" size="sm" className="shrink-0 gap-2 pointer-events-none">
              <Filter className="w-4 h-4" /> Filtros
            </Button>
            <Button
              variant={currentCategory === "all" ? "default" : "secondary"}
              size="sm"
              className="shrink-0 rounded-full"
              asChild
            >
              <Link href="/businesses?category=all">Todos</Link>
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={currentCategory === cat.id ? "default" : "secondary"}
                size="sm"
                className="shrink-0 rounded-full"
                asChild
              >
                <Link href={`/businesses?category=${cat.id}`}>{cat.name}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No hay negocios en esta categoría por el momento.
          </div>
        )}

        {/* Pagination Mock */}
        {businesses.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="w-full sm:w-auto">Cargar más negocios</Button>
          </div>
        )}
      </div>
    </HydrationBoundary>
  );
}
