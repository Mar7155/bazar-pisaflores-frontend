"use client";

import { Store, Plus, MapPin, Eye, Edit, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMyBusinesses } from "@/hooks/use-data.hook";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardClientContent({ status }: { status: string | null }) {
  const { data: myBusinesses = [], isLoading } = useMyBusinesses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {status === 'created' && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-slide-up">
          <span className="font-semibold">¡Negocio creado con éxito! Tu portal ya está activo.</span>
        </div>
      )}

      {status === 'offer_created' && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-slide-up">
          <span className="font-semibold">¡Oferta publicada! Ya está activa en tu vitrina.</span>
        </div>
      )}

      {status === 'product_added' && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-slide-up">
          <span className="font-semibold">¡Producto publicado! Ya está visible en tu catálogo.</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 mb-2">
            <Store className="w-8 h-8 text-primary" />
            Panel de Control
          </h1>
          <p className="text-muted-foreground">
            Administra tus tiendas, catálogo de productos e información de contacto.
          </p>
        </div>
        {myBusinesses.length >= 3 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  <Button disabled size="lg" className="shadow-md pointer-events-none opacity-50">
                    <Plus className="w-5 h-5 mr-1" /> Crear Negocio
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Límite de 3 negocios activos por cuenta alcanzado.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button asChild size="lg" className="shadow-md">
            <Link href="/dashboard/businesses/new"><Plus className="w-5 h-5 mr-1" /> Crear Negocio</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {myBusinesses.map((biz) => (
          <div key={biz.id} className="border border-border p-6 rounded-2xl flex flex-col gap-4 bg-card shadow-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="flex items-start justify-between">
              <div className="bg-primary/20 p-3 rounded-xl text-primary font-bold">
                <Store className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${biz.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {biz.is_active ? 'Publicado' : 'Pausado'}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{biz.name}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" /> {biz.address || "Sin dirección"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Productos</span>
                <span className="font-bold">{biz.products ? biz.products.length : 0} activos</span>
              </div>
              {/* <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground">Impacto</span>
                 <span className="font-bold">4.8 <Star className="w-3 h-3 text-yellow-500 inline fill-current"/></span>
               </div> */}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/businesses/${biz.id}`}><Edit className="w-4 h-4 mr-1" /> Administrar</Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/businesses/${biz.id}`} target="_blank"><Eye className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        ))}

        {/* Create new business card placeholder */}
        {myBusinesses.length < 3 && (
          <div className="border border-dashed border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-muted/10 min-h-64 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="bg-muted p-4 rounded-full group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Registrar nueva sucursal</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/businesses/new">Comenzar</Link>
            </Button>
          </div>
        )}

        {myBusinesses.length >= 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div tabIndex={0} className="border border-dashed border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-muted/10 min-h-64 opacity-50 cursor-not-allowed">
                  <div className="bg-muted p-4 rounded-full">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Límite de registros alcanzado</p>
                  <Button disabled variant="outline" className="pointer-events-none">Comenzar</Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Has alcanzado el límite máximo de 3 negocios por propietario permitido.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
