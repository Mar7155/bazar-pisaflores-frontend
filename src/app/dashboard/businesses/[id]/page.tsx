import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, Plus, PackageOpen, Eye, MapPin, Tag, ArrowLeft, Zap, ChevronRight } from "lucide-react";
import { getBusinessById, getBusinessProductById, getProductsByBusinessId } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { deleteBusinessAction } from "@/actions/mutations";
import PauseBusinessButton from "@/components/dashboard/pause-business-button";
import DeleteBusinessButton from "@/components/dashboard/delete-business-button";

export default async function DashboardBusinessPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
   const business = await getBusinessById(id);
   const productsBasic = await getProductsByBusinessId(id);
   const products = await Promise.all(
      productsBasic.map(p => getBusinessProductById(id, p.id).then(full => full ?? p))
   );

   if (!business) {
      notFound();
   }

   return (
      <div className="flex flex-col gap-8 animate-fade-in">
         {/* Navigation Header */}
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
               <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
               </Link>
            </Button>
            <span className="text-muted-foreground font-semibold">Mis Negocios</span>
         </div>

         {/* Header Info */}
         <div className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
               <div className="bg-primary/20 p-4 rounded-2xl shrink-0">
                  <Store className="w-10 h-10 text-primary" />
               </div>
               <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-black">{business.name}</h1>
                  <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                     {business.category && <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {business.category.name}</span>}
                     {business.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {business.address}</span>}
                  </div>
               </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
               <Button variant="secondary" asChild className="group">
                  <Link href={`/businesses/${business.id}`} target="_blank">
                     <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Ver en Directorio
                  </Link>
               </Button>
               <Button variant="outline" asChild className="group">
                  <Link href={`/dashboard/businesses/${business.id}/settings`}>
                     <Zap className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform" /> Configuración
                  </Link>
               </Button>
            </div>
         </div>

         {/* Inventory Section */}
         <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b border-border pb-4">
               <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                     <PackageOpen className="w-6 h-6 text-accent" /> Inventario y Catálogo
                  </h2>
                  <div className="flex justify-between items-start gap-2 pt-4 w-full">
                     <p className="text-muted-foreground mt-1">Administra los productos que ofreces a tus clientes.</p>
                     <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 font-bold" asChild>
                           <Link href={`/dashboard/businesses/${business.id}/offers/new`}><Zap className="w-4 h-4 mr-1 fill-current" /> Crear Oferta</Link>
                        </Button>
                        {products.length >= 30 ? (
                           <TooltipProvider>
                              <Tooltip>
                                 <TooltipTrigger asChild>
                                    <span tabIndex={0} className="inline-block">
                                       <Button disabled size="sm" className="pointer-events-none opacity-50">
                                          <Plus className="w-4 h-4 mr-1" /> Añadir Producto
                                       </Button>
                                    </span>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                    <p>Has alcanzado el límite de 30 productos en este local.</p>
                                 </TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        ) : (
                           <Button size="sm" asChild>
                              <Link href={`/dashboard/products/new?businessId=${business.id}`}><Plus className="w-4 h-4 mr-1" /> Añadir Producto</Link>
                           </Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {products.length === 0 ? (
               <div className="py-16 text-center text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                  No tienes productos registrados en este negocio.
               </div>
            ) : (
               <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {products.slice(0, 5).map((prod) => (
                        <Link key={prod.id} href={`/dashboard/businesses/${business.id}/products/${prod.id}`}>
                           <div className="border border-border bg-card hover:border-primary/50 p-4 flex gap-4 items-center rounded-xl cursor-pointer transition-colors group shadow-sm">
                              <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden relative border border-border/50">
                                 <Image
                                    src={getImageUrl(prod.images?.find(img => img.is_cover)?.s3_key || prod.images?.[0]?.s3_key, 'md')}
                                    alt={prod.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                 />
                                 {!prod.is_available && (
                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                       <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">Agotado</span>
                                    </div>
                                 )}
                              </div>
                              <div className="flex flex-col overflow-hidden w-full">
                                 <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{prod.name}</h3>
                                 <span className="text-xl font-black mt-1">${prod.price}</span>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>

                  {products.length > 5 && (
                     <div className="flex justify-center">
                        <Button variant="ghost" className="rounded-xl font-bold gap-2 text-primary hover:text-primary hover:bg-primary/5" asChild>
                           <Link href={`/dashboard/businesses/${business.id}/products`}>
                              Ver Inventario Completo ({products.length} productos) <ChevronRight className="w-4 h-4" />
                           </Link>
                        </Button>
                     </div>
                  )}
               </div>
            )}

            <section className="flex flex-col md:flex-row justify-center items-center py-6 border-t border-border mt-4 gap-4">
               <Button size="lg" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 font-bold h-14 px-8 rounded-2xl w-full md:w-auto" asChild>
                  <Link href={`/dashboard/businesses/${business.id}/offers`}>Gestionar Ofertas</Link>
               </Button>
               {business.is_active ? (
                  <PauseBusinessButton businessId={business.id} />
               ) : (
                  <DeleteBusinessButton businessId={business.id} />
               )
               }
            </section>
         </div>
      </div>
   );
}
