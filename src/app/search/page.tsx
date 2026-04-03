import Link from "next/link";
import { Search, Store, Frown, MapPin, Star, ArrowRight } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinesses } from "@/lib/api";
import { getQueryClient } from "@/lib/get-query-client";

export const metadata = {
  title: "Búsqueda | Bazar Pisaflores",
  description: "Busca productos y negocios en Pisaflores.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : '';
  
  const queryClient = getQueryClient();

  // Prefetch search results
  await queryClient.prefetchQuery({
    queryKey: ["businesses", category || "all", q],
    queryFn: () => getBusinesses({ query: q, category_id: category })
  });

  const resultsResponse = await getBusinesses({ query: q, category_id: category });
  const results = resultsResponse.data;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1 animate-slide-up opacity-0 text-balance">
        
        {/* Search Header Form */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <form className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <input 
                type="text" 
                name="q"
                defaultValue={q}
                placeholder="Buscar negocios..." 
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-full bg-background border border-border shadow-inner focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base md:text-lg font-medium text-card-foreground"
              />
              <Search className="w-6 h-6 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <Button type="submit" size="lg" className="rounded-full px-8 h-auto py-3 md:py-4 text-base font-bold shrink-0 shadow-md">
              Buscar
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Resultados para: 
              <span className="text-primary italic">
                {q ? `"${q}"` : category ? `Categoría: ${category}` : "Todas las búsquedas"}
              </span>
            </h1>
            <p className="text-muted-foreground">{resultsResponse.total} resultados encontrados</p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {results.map((biz) => (
                <Card key={biz.id} className="overflow-hidden hover:border-primary/50 transition-colors group text-card-foreground relative">
                  <CardContent className="p-0 flex flex-col md:flex-row h-auto md:h-40">
                    <div className="w-full md:w-40 h-40 bg-muted shrink-0 relative">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r" />
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-center">
                      <Link href={`/businesses/${biz.id}`} className="hover:underline">
                        <h3 className="font-bold text-lg mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {biz.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{biz.address || "Pisaflores"}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-secondary rounded text-secondary-foreground">
                          <Store className="w-3 h-3" /> Negocio
                        </div>
                        <Link href={`/businesses/${biz.id}`} className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center">
                          Visitar <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed border-border rounded-3xl bg-muted/10">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Frown className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">No encontramos nada</h2>
              <p className="text-muted-foreground max-w-md">
                Intenta buscar con otros términos, verifica la ortografía o explora las categorías disponibles.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/businesses">Explorar directorio <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </HydrationBoundary>
  );
}
