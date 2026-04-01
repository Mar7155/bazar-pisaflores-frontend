import Link from "next/link";
import { ArrowRight, Search, Store, Tag, Clock, MapPin, Star } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinesses, getFlashOffers, getCategories } from "@/lib/api";
import { getQueryClient } from "@/lib/get-query-client";
import { FlashOfferCard } from "@/components/dashboard/flash-offer-card";

export default async function Home() {
  const queryClient = getQueryClient();

  // Prefetch data on the server to hydrate the client-side cache
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: getCategories }),
    queryClient.prefetchQuery({ queryKey: ["businesses"], queryFn: () => getBusinesses() }),
    queryClient.prefetchQuery({ queryKey: ["flash-offers"], queryFn: () => getFlashOffers() }),
  ]);

  const [businesses, flashOffers, categories] = await Promise.all([
    getBusinesses(),
    getFlashOffers(),
    getCategories()
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col w-full pb-16">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{ backgroundSize: "30px 30px", backgroundImage: "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)", opacity: 0.2 }} />

          <div className="relative z-10 w-full max-w-3xl flex flex-col gap-4 md:gap-6 items-center animate-slide-up opacity-0">
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              Todo <span className="text-primary drop-shadow-sm">Pisaflores</span> al alcance de un clic.
            </h1>
            <p className="text-base md:text-xl text-muted-foreground font-medium max-w-xl mx-auto px-2">
              Descubre los mejores comercios locales, horarios actualizados y exclusivas ofertas en tu zona.
            </p>

            <form action="/search" className="w-full max-w-xl mt-6 relative group px-2">
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando hoy?"
                className="w-full pl-5 md:pl-6 pr-14 py-4 md:py-5 rounded-full bg-card border border-border shadow-md focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-base md:text-lg font-medium"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-md">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>

        {/* Top Businesses Section */}
        <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto w-full">
          <div className="flex flex-row items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 md:w-7 md:h-7 text-yellow-500 fill-yellow-500" />
              Negocios Populares
            </h2>
            <Button variant="ghost" asChild className="hidden sm:flex text-primary">
              <Link href="/businesses">
                Ver todos <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {businesses.slice(0, 3).map((biz) => {
              const isOpen = biz.schedules && biz.schedules.length > 0 && !biz.schedules[0].is_closed;

              return (
                <Card key={biz.id} className="overflow-hidden hover:border-primary/50 transition-colors group text-card-foreground">
                  <div className="h-40 md:h-48 bg-muted relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex gap-2">
                      {biz.category && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                          {biz.category.name}
                        </span>
                      )}
                      <span className={`text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isOpen ? "bg-green-500" : "bg-red-500"}`}>
                        <Clock className="w-3 h-3" /> {isOpen ? "Abierto" : "Cerrado"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <Link href={`/businesses/${biz.id}`} className="hover:underline">
                      <h3 className="font-bold text-xl mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {biz.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{biz.address || "Pisaflores"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                      {/* <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /> 4.8 (120)
                      </div> */}
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/businesses/${biz.id}`}>Ver menú</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-6 sm:hidden flex justify-center w-full">
            <Button variant="outline" className="w-full text-primary border-primary/20" asChild>
              <Link href="/businesses">Ver todos los negocios <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>

        {/* Quick Categories */}
        <section className="py-10 bg-muted/30 border-y border-border/50">
          <div className="px-4 max-w-7xl mx-auto w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" /> Explorar por Categoría
            </h2>

            {/* Scrollable container on mobile */}
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-4 md:gap-6">
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} href={`/search?category=${encodeURIComponent(cat.name)}`} className="snap-center shrink-0 w-40 md:w-auto relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center text-card-foreground">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-sm text-foreground">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Offers */}
        <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto w-full mb-8">
          <div className="flex flex-row items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-accent">
              <Tag className="w-6 h-6 md:w-7 md:h-7" /> Ofertas Relámpago
            </h2>
            <Button variant="ghost" asChild className="hidden sm:flex text-accent hover:text-accent">
              <Link href="/flash-offers">
                Ver más <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {flashOffers.slice(0, 3).map((offer) => (
              <FlashOfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          <div className="mt-6 sm:hidden flex justify-center w-full">
            <Button variant="outline" className="w-full text-accent border-accent/20" asChild>
              <Link href="/flash-offers">Ver más ofertas <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </HydrationBoundary>
  );
}
