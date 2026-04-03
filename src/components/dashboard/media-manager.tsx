"use client";

import { ImagePlus, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Image as ImageType } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { setCoverImageAction } from "@/actions/mutations";
import { DeleteImageButton } from "./delete-image-button";
import { ImageUploader } from "./image-uploader";

interface MediaManagerProps {
  entityType: 'business' | 'product';
  entityId: string;
  businessId: string;
  currentImages: ImageType[];
  title?: string;
  description?: string;
  maxImages?: number;
}

export function MediaManager({
  entityType,
  entityId,
  businessId,
  currentImages,
  title = "Galería Multimedia",
  description = "Gestiona las fotos y define la imagen de portada.",
  maxImages = 5
}: MediaManagerProps) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["business", businessId] });
  };

  const handleSetCover = async (imageId: string) => {
    try {
      const productId = entityType === 'product' ? entityId : undefined;
      const result = await setCoverImageAction(businessId, productId, imageId, entityType);
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
    <Card className="border-border shadow-xl shadow-primary/5 rounded-3xl overflow-hidden bg-background/60 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl shadow-inner">
              <ImagePlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">{title}</CardTitle>
              <CardDescription className="text-sm font-medium">{description}</CardDescription>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className=" bg-background font-black px-4 py-1.5 rounded-full border-primary/20 text-primary">
            {currentImages.length}/{maxImages} Fotos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-10">

        {/* Existing Images */}
        {currentImages.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <CheckCircle className="w-4 h-4 text-green-500" /> Imágenes en la Nube
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {currentImages.map((img) => (
                <div key={img.id} className={`group relative aspect-square rounded-3xl overflow-hidden border-2 transition-all duration-500 ${img.is_cover ? 'border-yellow-500 shadow-xl shadow-yellow-500/10 scale-95' : 'border-border/60 hover:border-primary/40'}`}>
                  <img
                    src={getImageUrl(img.s3_key, 'md')}
                    alt="Gallery"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Actions Overlay - Now always visible for better UX */}
                  <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-end pointer-events-auto">
                      <DeleteImageButton
                        businessId={businessId}
                        productId={entityType === 'product' ? entityId : undefined}
                        imageId={img.id}
                        entityType={entityType}
                        onSuccess={invalidate}
                      />
                    </div>

                    {!img.is_cover && (
                      <div className="pointer-events-auto">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full h-8 text-[9px] font-black uppercase tracking-widest rounded-lg gap-2  shadow-md border border-border/50 text-foreground"
                          onClick={() => handleSetCover(img.id)}
                        >
                          Portada
                        </Button>
                      </div>
                    )}
                  </div>

                  {img.is_cover && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-lg border border-yellow-400">
                      <Star className="w-3 h-3 fill-current" /> PORTADA
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-60" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Section */}
        <div className="pt-4">
          <ImageUploader
            entityType={entityType}
            entityId={entityId}
            businessId={businessId}
            currentCount={currentImages.length}
            maxImages={maxImages}
            onSuccess={invalidate}
          />
        </div>
      </CardContent>
    </Card>
  );
}
