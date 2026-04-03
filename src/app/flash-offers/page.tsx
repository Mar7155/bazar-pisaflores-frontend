import Link from "next/link";
import { Clock, Store, ArrowRight, Flame, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getFlashOffers } from "@/lib/api";
import { PaginationBar } from "@/components/pagination-bar";

const ITEMS_PER_PAGE = 12;

export const metadata = {
  title: "Ofertas Relámpago | Bazar Pisaflores",
  description: "Aprovecha descuentos únicos con tiempo límite en Pisaflores.",
};

function buildPageUrl(currentCategory: string, page: number): string {
  const params = new URLSearchParams();
  if (currentCategory !== "all") params.set("category", currentCategory);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/flash-offers${qs ? `?${qs}` : ""}`;
}

export default async function FlashOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const currentCategory = typeof resolvedParams.category === 'string' ? resolvedParams.category : "all";
  const currentPage = typeof resolvedParams.page === 'string' ? Math.max(1, parseInt(resolvedParams.page, 10) || 1) : 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const [categories, offersResponse] = await Promise.all([
    getCategories(),
    getFlashOffers({ categoryId: currentCategory, limit: ITEMS_PER_PAGE, offset }),
  ]);

  const activeOffersList = offersResponse.data.filter(o => o.is_active && new Date(o.expires_at) > new Date());
  const totalPages = Math.max(1, Math.ceil(offersResponse.total / ITEMS_PER_PAGE));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1">
      <div className="flex flex-col gap-4 text-center items-center justify-center py-6 md:py-10 bg-accent/5 rounded-3xl border border-accent/20">
        <div className="p-4 bg-accent/10 rounded-full animate-pulse">
          <Flame className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground drop-shadow-sm">
          Ofertas <span className="text-accent">Relámpago</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl px-4">
          Caza las mejores promociones antes de que se agoten. Los descuentos tienen tiempo limitado.
        </p>
      </div>

      <div className="flex overflow-x-auto pb-4 no-scrollbar gap-2 mb-2 items-center">
        <span className="text-sm font-bold text-muted-foreground mr-2 shrink-0 flex items-center gap-1"><Tag className="w-4 h-4" /> Filtrar:</span>
        <Button
          asChild
          variant={currentCategory === "all" ? "default" : "outline"}
          size="sm"
          className="shrink-0 rounded-full"
        >
          <Link href="/flash-offers">Todas</Link>
        </Button>
        {categories.map((cat) => (
          <Button
            asChild
            key={cat.id}
            variant={currentCategory === cat.id ? "default" : "outline"}
            size="sm"
            className="shrink-0 rounded-full"
          >
            <Link href={`/flash-offers?category=${cat.id}`}>{cat.name}</Link>
          </Button>
        ))}
      </div>

      {activeOffersList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-muted/10 rounded-2xl border border-dashed border-border">
          <Flame className="w-12 h-12 text-muted-foreground/30" />
          <h2 className="text-xl font-bold">Sin ofertas por el momento</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            No encontramos promociones activas en esta categoría. Vuelve más tarde o explora otras categorías.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link href="/flash-offers">Ver Todas las Ofertas</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {activeOffersList.map((offer) => (
            <Card key={offer.id} className="overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md border-accent/20 flex flex-col">
              <div className="flex flex-col items-center justify-center relative">
                {offer.discount_pct && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white font-black px-3 py-1.5 rounded-full shadow-lg text-sm flex items-center gap-1">
                    <Flame className="w-4 h-4" /> -{offer.discount_pct}%
                  </div>
                )}
              </div>
              <CardContent className="p-4 md:p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                  {offer.title}
                </h3>
                {offer.business && (
                  <Link href={`/businesses/${offer.business_id}`} className="text-sm text-muted-foreground hover:text-primary font-medium hover:underline flex items-center gap-1 w-fit">
                    <Store className="w-4 h-4" /> {offer.business.name}
                  </Link>
                )}
                <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md bg-accent/10 text-accent">
                    <Clock className="w-4 h-4" />
                    Expira: {new Date(offer.expires_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
                  </div>
                </div>
                <Button asChild className="w-full mt-4 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                  <Link href={`/businesses/${offer.business_id}`}>
                    Ver en tienda <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        buildUrl={(page) => buildPageUrl(currentCategory, page)}
      />
    </div>
  );
}
