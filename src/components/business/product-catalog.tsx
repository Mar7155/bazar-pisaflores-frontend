"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MessageCircle, ShoppingBag } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { getImageUrl, getWhatsAppLink } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCatalogProps {
  products: Product[];
  businessPhone: string | null | undefined;
  businessName: string;
}

export function ProductCatalog({ products, businessPhone, businessName }: ProductCatalogProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <>
      {/* Catalog header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Catálogo
        </h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en el menú..."
            className="pl-9 pr-4 py-2 rounded-full bg-card border border-border focus:border-primary outline-none transition-all text-sm w-full"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
          {query ? `Sin resultados para "${query}"` : "Aún no hay productos disponibles."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((prod) => (
            <Dialog key={prod.id}>
              <DialogTrigger asChild>
                <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-transform hover:-translate-y-1 duration-200 cursor-pointer group">
                  <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
                    <Image
                      src={getImageUrl(
                        prod.images?.find(img => img.is_cover)?.s3_key ?? prod.images?.[0]?.s3_key,
                        "md"
                      )}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {!prod.is_available && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                        <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-sm rotate-[-10deg] shadow-lg">
                          Agotado
                        </span>
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
                      <span className="text-primary bg-primary/10 px-3 py-1 rounded-md font-bold text-sm">
                        Ver detalles
                      </span>
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              {/* Product detail modal */}
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{prod.name}</DialogTitle>
                  <DialogDescription>{prod.description}</DialogDescription>
                </DialogHeader>

                <div className="w-full mt-4 flex justify-center px-10">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {!prod.images || prod.images.length === 0 ? (
                        <CarouselItem>
                          <div className="w-full h-48 sm:h-64 rounded-xl relative border border-border/50 overflow-hidden bg-muted">
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
                            <div className="w-full h-48 sm:h-64 rounded-xl relative border border-border/50 overflow-hidden bg-muted">
                              <Image
                                src={getImageUrl(img.s3_key, "md")}
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
                    {prod.images && prod.images.length > 1 && (
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

                {getWhatsAppLink(businessPhone, businessName, prod.name, prod.price) && (
                  <a
                    href={getWhatsAppLink(businessPhone, businessName, prod.name, prod.price)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full mt-6 bg-[#25D366] text-white hover:bg-[#1ebe5d] p-3 rounded-md font-bold text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Pedir por WhatsApp
                  </a>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </>
  );
}
