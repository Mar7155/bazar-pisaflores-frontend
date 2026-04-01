import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen, ArrowLeft, LayoutDashboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBusinessProductById, getBusinessById } from "@/lib/api";
import { ProductEditForm } from "@/components/dashboard/product-edit-form";
import { ProductMediaManager } from "@/components/dashboard/product-media-manager";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";

export default async function DashboardProductPage({
   params,
}: {
   params: Promise<{ id: string; productId: string }>;
}) {

   const { id: businessId, productId } = await params;
   
   // Parallel fetch for business and product data
   const [product, business] = await Promise.all([
      getBusinessProductById(businessId, productId),
      getBusinessById(businessId)
   ]);

   if (!product || !business) {
      notFound();
   }

   return (
      <div className="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto pb-20">
         {/* Navigation & Actions Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" asChild className="rounded-full border border-border shadow-sm">
                  <Link href={`/dashboard/businesses/${businessId}/products`}>
                     <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </Link>
               </Button>
               <div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                     <PackageOpen className="w-8 h-8 text-primary" /> Editar Producto
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                     En <span className="text-foreground font-bold">{business.name}</span>
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <DeleteProductButton 
                  businessId={businessId} 
                  productId={productId} 
                  productName={product.name} 
               />
               <Button variant="secondary" asChild className="font-bold gap-2 rounded-xl h-11 px-6 shadow-sm">
                  <Link href={`/dashboard/businesses/${businessId}`}>
                     <LayoutDashboard className="w-4 h-4" /> Ir al Panel
                  </Link>
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section (Left/Main) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
               <ProductEditForm businessId={businessId} product={product} />
               
               <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 p-6 rounded-3xl flex gap-4 shadow-inner">
                  <div className="bg-blue-500/10 p-3 rounded-full shrink-0 h-fit">
                     <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                     <h4 className="font-bold text-blue-900 dark:text-blue-100">Vista Previa del Catálogo</h4>
                     <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                        Los cambios realizados aquí se reflejarán instantáneamente en tu catálogo digital público de Bazar Pisaflores. Asegúrate de que las fotos sean atractivas y los precios sean correctos.
                     </p>
                  </div>
               </div>
            </div>

            {/* Media Manager (Right/Side) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
               <ProductMediaManager 
                  businessId={businessId} 
                  productId={productId} 
                  currentImages={product.images || []} 
               />
               
               <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl text-sm italic text-muted-foreground text-center">
                  "Una buena foto puede aumentar tus ventas hasta un 40%. Intenta usar luz natural para tus productos."
               </div>
            </div>
         </div>
      </div>
   );
}
