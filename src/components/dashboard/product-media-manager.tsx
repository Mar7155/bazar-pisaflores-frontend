"use client";

import { ImagePlus, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ProductImage } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { setCoverImageAction } from "@/actions/mutations";
import { DeleteImageButton } from "./delete-image-button";
import { ProductImageUploader } from "./product-image-uploader";

interface ProductMediaManagerProps {
  businessId: string;
  productId: string;
  currentImages: ProductImage[];
}

export function ProductMediaManager({ businessId, productId, currentImages }: ProductMediaManagerProps) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["business", businessId] });
  };

  const handleSetCover = async (imageId: string) => {
    try {
      const result = await setCoverImageAction(businessId, productId, imageId, 'product');
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Portada actualizada.");
        invalidate();
      }
    } catch (error) {
      toast.error("Error al establecer la portada.");
    }
  };

  return (
    <Card className="border-border shadow-sm rounded-2xl">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ImagePlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Galería Multimedia</CardTitle>
              <CardDescription>Gestiona las fotos y la portada del producto.</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-background font-bold px-3 py-1">
            {currentImages.length}/5 Fotos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">

        {/* Existing Images */}
        {currentImages.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Imágenes Actuales
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {currentImages.map((img) => (
                <div key={img.id} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${img.is_cover ? 'border-primary shadow-lg shadow-primary/10' : 'border-border/50 opacity-80'}`}>
                  <img
                    src={getImageUrl(img.s3_key, 'md')}
                    alt="Producto"
                    className="w-full h-full object-cover"
                  />

                  {/* Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end items-start">
                      <DeleteImageButton
                        businessId={businessId}
                        productId={productId}
                        imageId={img.id}
                        entityType="product"
                        onSuccess={invalidate}
                      />
                    </div>

                    {!img.is_cover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full h-8 text-[10px] font-black uppercase tracking-wider rounded-lg gap-2 bg-white/90"
                        onClick={() => handleSetCover(img.id)}
                      >
                        <Star className="w-3 h-3" /> Usar como Portada
                      </Button>
                    )}
                  </div>

                  {img.is_cover && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" /> PORTADA
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Section */}
        <ProductImageUploader 
          businessId={businessId}
          productId={productId}
          currentCount={currentImages.length}
          onSuccess={invalidate}
        />
      </CardContent>
    </Card>
  );
}
