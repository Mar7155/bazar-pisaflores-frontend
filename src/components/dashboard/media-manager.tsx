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

                  {/* Glassmorphism Controls Overlay */}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3">
                    <div className="flex justify-end items-start translate-y-[-10px] group-hover:translate-y-0 transition-transform">
                      <DeleteImageButton
                        businessId={businessId}
                        productId={entityType === 'product' ? entityId : undefined}
                        imageId={img.id}
                        entityType={entityType}
                        onSuccess={invalidate}
                      />
                    </div>

                    {!img.is_cover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full h-10 text-[10px] font-black uppercase tracking-widest rounded-xl gap-2 bg-white/90 shadow-lg hover:bg-white translate-y-[10px] group-hover:translate-y-0 transition-transform"
                        onClick={() => handleSetCover(img.id)}
                      >
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> Usar como Portada
                      </Button>
                    )}
                  </div>

                  {img.is_cover && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-fade-in border border-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" /> PORTADA
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
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
