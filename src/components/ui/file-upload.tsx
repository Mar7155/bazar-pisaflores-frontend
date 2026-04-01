"use client";

import { useState, useRef } from "react";
import { X, ImagePlus, UploadCloud, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/api";

interface FileUploadProps {
  entityType: "business" | "product";
  entityId: string;
  maxFiles?: number;
  maxSizeMB?: number;
  onSuccess?: (images: { id: string; s3Key: string }[]) => void;
}

export function FileUpload({
  entityType,
  entityId,
  maxFiles = 10,
  maxSizeMB = 10,
  onSuccess,
}: FileUploadProps) {
  const [files, setFiles]       = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} archivos.`);
      return;
    }

    const validFiles: File[]   = [];
    const newPreviews: string[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Solo se permiten archivos JPG, PNG o WEBP.");
        return;
      }
      if (file.size > maxSizeBytes) {
        setError(`"${file.name}" supera el límite de ${maxSizeMB} MB.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError(null);

    try {
      // Subir todas las imágenes en paralelo
      // La primera imagen se marca como cover automáticamente
      const results = await Promise.all(
        files.map((file, index) =>
          uploadImage(entityType, entityId, file, index === 0)
        )
      );

      setIsSuccess(true);
      onSuccess?.(results);

      setTimeout(() => {
        setIsSuccess(false);
        setFiles([]);
        setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir las imágenes.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-card border border-border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" /> Galería del Producto
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sube hasta {maxFiles} fotos. Límite de {maxSizeMB}MB por foto.
          </p>
        </div>
        <span className="text-sm font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground">
          {files.length}/{maxFiles} Fotos
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg flex items-center justify-center gap-2 font-bold">
          <CheckCircle className="w-5 h-5" /> ¡Imágenes subidas y procesadas con éxito!
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
        {previews.map((src, index) => (
          <div key={index} className="relative aspect-square rounded-xl border border-border overflow-hidden group bg-muted/30">
            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                aria-label="Eliminar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                Principal
              </span>
            )}
          </div>
        ))}

        {files.length < maxFiles && !isUploading && !isSuccess && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-primary/50 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary transition-colors text-muted-foreground hover:text-primary gap-2">
            <UploadCloud className="w-8 h-8" />
            <span className="text-xs font-semibold">Seleccionar</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {files.length > 0 && !isSuccess && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleUpload} disabled={isUploading} className="shadow-md">
            {isUploading ? "Subiendo archivos..." : "Guardar Imágenes"}
          </Button>
        </div>
      )}
    </div>
  );
}
