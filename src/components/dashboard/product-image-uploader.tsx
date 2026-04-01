"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPresignedUrlAction, confirmUploadAction } from "@/actions/mutations";
import { uploadFileToS3 } from "@/lib/api";

interface ProductImageUploaderProps {
  businessId: string;
  productId: string;
  currentCount: number;
  onSuccess: () => void;
}

export function ProductImageUploader({ businessId, productId, currentCount, onSuccess }: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (currentCount + uploadFiles.length + selectedFiles.length > 5) {
      toast.error("Un producto puede tener máximo 5 imágenes.");
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    selectedFiles.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} no es una imagen válida (JPG, PNG, WEBP).`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} excede los 10MB.`);
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (coverIndex === index) setCoverIndex(null);
    else if (coverIndex !== null && coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const handleSaveImages = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setIsUploading(true);

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const isThisCover = coverIndex === i || (currentCount === 0 && i === 0);

        // 1. Get Presigned URL (Server Action)
        const presigned = await getPresignedUrlAction('product', productId, file.type);
        if (presigned.error || !presigned.url || !presigned.key) {
          throw new Error(presigned.error || "No se pudo obtener la URL de subida.");
        }

        // 2. Upload to S3 (Client Side Fetch)
        await uploadFileToS3(presigned.url, file);

        // 3. Confirm in DB (Server Action)
        const confirmation = await confirmUploadAction(businessId, productId, 'product', presigned.key, isThisCover);
        if (confirmation.error) {
          throw new Error(confirmation.error);
        }
      }

      toast.success("¡Imágenes guardadas con éxito!");
      setUploadFiles([]);
      setPreviews([]);
      setCoverIndex(null);
      
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Hubo un error al subir alguna imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          {currentCount > 0 ? "Añadir más fotos" : "Subir primera foto"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previews.map((src, index) => (
            <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${coverIndex === index ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-border'}`}>
              <img src={src} alt="Pre-upload" className="w-full h-full object-cover" />
              <button
                onClick={() => removeUploadFile(index)}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCoverIndex(index)}
                className={`absolute bottom-2 left-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter shadow-md transition-all ${coverIndex === index ? 'bg-yellow-500 text-white translate-y-0' : 'bg-black/60 text-white hover:bg-black/80'}`}
              >
                {coverIndex === index ? "★ PORTADA ELEGIDA" : "HACER PORTADA"}
              </button>
            </div>
          ))}

          {(currentCount + uploadFiles.length < 5) && !isUploading && (
            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary transition-all text-muted-foreground hover:text-primary gap-2 group">
              <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase tracking-tighter">Seleccionar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      {uploadFiles.length > 0 && (
        <div className="flex justify-end pt-6 border-t border-border">
          <Button
            onClick={handleSaveImages}
            disabled={isUploading}
            className="px-8 h-12 rounded-xl font-black text-lg gap-3 shadow-xl shadow-primary/20"
          >
            {isUploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Guardar Galería</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
