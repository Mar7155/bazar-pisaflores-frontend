import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, ArrowLeft, Plus, Flame, Clock, Trash2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinessById, getBusinessOffers } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DeleteOfferButton } from "@/components/delete-offer-button";
import { FlashOfferCard } from "@/components/dashboard/flash-offer-card";

export default async function DashboardBusinessOffersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessById(id);

  if (!business) {
    notFound();
  }

  const offersResponse = await getBusinessOffers(id);
  const offers = offersResponse.data;
  const activeOffersCount = offers.filter(o => o.is_active && new Date() < new Date(o.expires_at)).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/dashboard/businesses/${business.id}`}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <span className="text-muted-foreground font-semibold text-sm">Regresar al negocio</span>
          <span className="font-bold flex items-center gap-1"><Store className="w-4 h-4" /> {business.name}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Flame className="w-8 h-8 text-accent" />
            Ofertas Relámpago
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra tus promociones temporales. Cuando expiran, dejan de estar visibles.
          </p>
        </div>
        {activeOffersCount >= 10 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  <Button disabled size="lg" className="bg-accent/50 text-accent-foreground shrink-0 shadow-md pointer-events-none opacity-50">
                    <Plus className="w-5 h-5 mr-1" /> Crear Nueva Oferta
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Límite de 10 ofertas activas alcanzado. Espera a que expiren o elimina alguna.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 shadow-md">
            <Link href={`/dashboard/businesses/${business.id}/offers/new`}>
              <Plus className="w-5 h-5 mr-1" /> Crear Nueva Oferta
            </Link>
          </Button>
        )}
      </div>

      {offers.length === 0 ? (
        <div className="border border-dashed border-border p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-muted/10">
          <div className="bg-accent/10 p-4 rounded-full">
            <Flame className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-xl font-bold">Sin ofertas activas</h2>
          <p className="text-muted-foreground max-w-sm">No tienes promociones corriendo. Crea una Oferta Relámpago para atraer a más vecinos hoy.</p>
          {activeOffersCount >= 10 ? (
            <Button disabled variant="outline" className="mt-2 border-accent/50 text-accent/50 pointer-events-none">
              Límite de 10 Ofertas Alcanzado
            </Button>
          ) : (
            <Button asChild variant="outline" className="mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Link href={`/dashboard/businesses/${business.id}/offers/new`}>Lanzar Oferta</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <FlashOfferCard key={offer.id} offer={offer} isDashboard={true}>
              <DeleteOfferButton businessId={id} offerId={offer.id} />
            </FlashOfferCard>
          ))}
        </div>
      )}
    </div>
  );
}
