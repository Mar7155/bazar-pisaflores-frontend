import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PackageOpen,
  Plus,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { getBusinessById, getProductsByBusinessId } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/dashboard/back-button";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";

export default async function BusinessProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: businessId } = await params;
  const business = await getBusinessById(businessId);
  const products = await getProductsByBusinessId(businessId);

  if (!business) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* breadcrumb-ish Header */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <BackButton businessId={businessId} />
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Inventario Completo
          </h1>
          <p className="text-muted-foreground font-medium">Gestiona todos los productos de <span className="text-foreground">{business.name}</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{products.length} Productos Registrados</h2>
          <Button asChild size="sm" className="gap-2 font-bold shadow-md">
            <Link href={`/dashboard/products/new?businessId=${business.id}`}><Plus className="w-4 h-4" /> Nuevo Producto</Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center bg-card border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-4">
            <div className="bg-muted p-6 rounded-full">
              <PackageOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-xl font-bold">No hay productos aún</p>
              <p className="text-muted-foreground">Comienza agregando tu primer artículo al catálogo.</p>
            </div>
            <Button asChild className="mt-2 font-bold">
              <Link href={`/dashboard/products/new?businessId=${business.id}`}>Añadir mi primer producto</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="group relative bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">

                {/* Product Info */}
                <div className="flex items-center gap-6 w-full">
                  <div className="w-24 h-24 bg-muted rounded-xl shrink-0 overflow-hidden border border-border relative flex items-center justify-center">
                    <img
                      src={getImageUrl(prod.images?.[0]?.s3_key, 'sm')}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    {!prod.is_available && (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center">
                        <Badge variant="destructive" className="text-[10px] h-5">AGOTADO</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black truncate">{prod.name}</h3>
                      {prod.is_available ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green text-[10px]">Disponible</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{prod.description || "Sin descripción."}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-2xl font-black text-foreground flex items-center">
                        <DollarSign className="w-5 h-5 text-primary" /> {prod.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  <Button variant="ghost" className="rounded-xl font-bold flex-1 md:flex-none" asChild>
                    <Link href={`/dashboard/businesses/${businessId}/products/${prod.id}`}>
                      Editar Detalle <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>

                  <DeleteProductButton
                    businessId={businessId}
                    productId={prod.id}
                    productName={prod.name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
