import { Clock, MapPin, Search, MessageCircle, Star, ShoppingBag, Store, Flame, ImageIcon } from "lucide-react";
import Link from "next/link";
import { getBusinessById, getProductsByBusinessId, getBusinessProductById } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { FlashOfferCard } from "@/components/dashboard/flash-offer-card";

export default async function BusinessProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessById(id);
  console.log(business);
  // Cargar productos con sus imagenes en paralelo usando el endpoint que incluye images[]
  const productsBasic = await getProductsByBusinessId(id);
  const products = await Promise.all(
    productsBasic.map(p => getBusinessProductById(id, p.id).then(full => full ?? p))
  );

  if (!business) {
    notFound();
  }

  // Calculate if currently open based on today's schedule
  const today = new Date().getDay();
  const todaySchedule = business.schedules?.find(s => s.day_of_week === today);
  const isOpen = todaySchedule && !todaySchedule.is_closed;
  const coverImage = business.images?.find(img => img.is_cover);

  return (
    <section className="w-full bg-muted/10 min-h-screen">
      {/* Cover Image & Header - Using min-h and flex to prevent overlap with sticky navbar */}
      <div className="relative w-full min-h-[320px] md:min-h-[400px] bg-zinc-200 dark:bg-zinc-800 flex flex-col justify-end overflow-hidden">
        {coverImage ? (
          <Image
            src={getImageUrl(coverImage.s3_key, 'lg')}
            alt={business.name}
            fill
            className="object-cover transition-opacity duration-700 hover:scale-105 blur-xs"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        )}

        {/* Header Content Wrapper */}
        <div className="relative z-20 w-full px-4 pb-8 md:pb-12 pt-24">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-primary">
                {business.category && (
                  <span className="bg-primary/10 px-3 py-1 rounded-full">{business.category.name}</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground drop-shadow-md leading-tight">
                {business.name}
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-xl">
                {business.description || "Sin descripción disponible."}
              </p>
            </div>

            <Link
              href={`https://wa.me/52${business.phone}?text=Buenos%20dias,%20me%20interesa%20su%20negocio`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto min-w-[200px] bg-[#25D366] text-white hover:bg-[#1ebe5d] p-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" /> Mandar mensaje
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Info & Schedules */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Información
            </h3>

            <div className="flex flex-col gap-4 text-sm font-medium">
              <div className="flex gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0 text-accent" />
                <span>{business.address || "Dirección no registrada"}</span>
              </div>
              <div className="flex gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 shrink-0 text-accent" />
                <div className="flex flex-col w-full">
                  <div className="flex justify-between w-full mb-1">
                    <span className={`font-bold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
                    </span>
                    {isOpen && todaySchedule && <span>Cierra a las {todaySchedule.closes_at.slice(0, 5)}</span>}
                  </div>
                  {business.schedules && business.schedules.length > 0 && (
                    <details className="cursor-pointer py-2 border-t border-border mt-2">
                      <summary className="font-semibold text-foreground select-none">Ver todos los horarios</summary>
                      <ul className="mt-2 flex flex-col gap-2 text-muted-foreground relative pl-2">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const sch = business.schedules!.find(s => s.day_of_week === ((i + 1) % 7)); // start from monday
                          const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                          return (
                            <li key={i} className={`flex justify-between ${today === ((i + 1) % 7) ? 'font-bold text-foreground' : ''}`}>
                              <span>{dayNames[i]}</span>
                              <span>{sch ? (sch.is_closed ? "Cerrado" : `${sch.opens_at.slice(0, 5)} - ${sch.closes_at.slice(0, 5)}`) : "No info"}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Gallery Carousel */}
          {business.images && business.images.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" /> Galería
                </h3>
              </div>
              <div className="p-4">
                <Carousel className="w-full">
                  <CarouselContent>
                    {business.images.map((img, idx) => (
                      <CarouselItem key={img.id}>
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative bg-muted">
                          <Image
                            src={getImageUrl(img.s3_key, 'md')}
                            alt={`${business.name} - Foto ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {business.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 border-white/50 bg-white/80 hover:bg-white shadow-md" />
                      <CarouselNext className="right-2 border-white/50 bg-white/80 hover:bg-white shadow-md" />
                    </>
                  )}
                </Carousel>
                <p className="text-xs text-muted-foreground text-center mt-3 font-medium">
                  {business.images.length} {business.images.length === 1 ? 'foto' : 'fotos'}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {/* Aun no está implementado en el backend se implementara despues
           <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
             <div className="flex flex-wrap gap-2">
               <span className="bg-muted px-3 py-1 text-xs font-semibold rounded-full text-foreground">Envío a domicilio</span>
               <span className="bg-muted px-3 py-1 text-xs font-semibold rounded-full text-foreground">Acepta tarjeta</span>
             </div>
           </div>
          */}
        </div>

        {/* Right Column: Catalog */}
        <div className="lg:col-span-2">

          {(() => {
            const activeOffers = (business.flash_offers || []).filter(o => o.is_active && new Date(o.expires_at) > new Date());
            if (activeOffers.length === 0) return null;
            return (
              <div className="mb-12">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 mb-6">
                  <div className="bg-accent/10 p-2 rounded-full"><Flame className="w-6 h-6 text-accent" /></div>
                  Súper Ofertas Especiales
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeOffers.map(offer => (
                    <FlashOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" /> Catálogo
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en el menú..."
                className="pl-9 pr-4 py-2 rounded-full bg-card border border-border focus:border-primary outline-none transition-all text-sm w-full md:w-64"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {!products || products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
              Aún no hay productos disponibles.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((prod) => (
                <Dialog key={prod.id}>
                  <DialogTrigger asChild>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-transform hover:-translate-y-1 duration-200 cursor-pointer group">
                      <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
                        <Image
                          src={getImageUrl(prod.images?.find(img => img.is_cover)?.s3_key || prod.images?.[0]?.s3_key, 'md')}
                          alt={prod.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {!prod.is_available && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                            <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-sm rotate-[-10deg] shadow-lg">Agotado</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-lg mb-1">{prod.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {prod.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-xl font-black text-foreground">${prod.price}</span>
                          <span className="text-primary bg-primary/10 px-3 py-1 rounded-md font-bold text-sm transition-colors cursor-pointer">
                            Ver detalles
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  {/* Product Modal Details */}
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{prod.name}</DialogTitle>
                      <DialogDescription>
                        {prod.description}
                      </DialogDescription>
                    </DialogHeader>
                    {/* Product Carousel */}
                    <div className="w-full mt-4 flex justify-center px-10">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {(!prod.images || prod.images.length === 0) ? (
                            <CarouselItem>
                              <div className="w-full h-48 sm:h-64 rounded-xl shadow-sm flex items-center justify-center relative border border-border/50 overflow-hidden bg-muted">
                                <Image
                                  src="/placeholder.jpg"
                                  alt="Sin imagen"
                                  fill
                                  className="object-cover opacity-50 grayscale"
                                />
                              </div>
                            </CarouselItem>
                          ) : (
                            prod.images.map((img, idx) => (
                              <CarouselItem key={img.id}>
                                <div className="w-full h-48 sm:h-64 rounded-xl shadow-sm flex items-center justify-center relative border border-border/50 overflow-hidden bg-muted">
                                  <Image
                                    src={getImageUrl(img.s3_key, 'md')}
                                    alt={`Vista ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="400px"
                                  />
                                </div>
                              </CarouselItem>
                            ))
                          )}
                        </CarouselContent>
                        {(prod.images && prod.images.length > 1) && (
                          <>
                            <CarouselPrevious className="left-[-2rem] border-muted-foreground/30 hover:bg-muted" />
                            <CarouselNext className="right-[-2rem] border-muted-foreground/30 hover:bg-muted" />
                          </>
                        )}
                      </Carousel>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Precio:</span>
                        <span className="text-3xl font-black text-foreground">${prod.price}</span>
                      </div>
                    </div>

                    <a href={`https://wa.me/52${business.phone}?text=Me%20interesa%20el%20producto:%20${prod.name}`} target="_blank" rel="noreferrer" className="w-full mt-6 bg-[#25D366] text-white hover:bg-[#1ebe5d] p-3 rounded-md font-bold text-center flex items-center justify-center gap-2 transition-colors">
                      <MessageCircle className="w-5 h-5" /> Mandar mensaje
                    </a>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

