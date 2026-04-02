# Subida de Imágenes

Flujo completo para subir, mostrar, eliminar y cambiar la cover image desde el frontend Next.js.

---

## Arquitectura del flujo

```
Browser                    Backend (Lambda)              S3 / CloudFront
   │                              │                             │
   │  POST /upload/presigned-url  │                             │
   │─────────────────────────────>│                             │
   │  { url, key }                │                             │
   │<─────────────────────────────│                             │
   │                              │                             │
   │  PUT {url} + binario         │                             │
   │─────────────────────────────────────────────────────────>  │
   │  200 OK                      │                             │
   │<─────────────────────────────────────────────────────────  │
   │                              │    S3 Event Trigger         │
   │                              │<────────────────────────────│
   │                              │  Lambda image-processor     │
   │                              │  genera sm/md/lg WebP       │
   │                              │─────────────────────────── >│
   │                              │                             │
   │  POST /upload/confirm        │                             │
   │─────────────────────────────>│                             │
   │  { id, s3Key, isCover }      │                             │
   │<─────────────────────────────│                             │
```

---


---

## Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/upload/presigned-url` | Genera URL firmada para subir a S3 |
| PUT | `{presigned-url}` | Sube el binario directo a S3 (sin Authorization) |
| POST | `/upload/confirm` | Registra la imagen en DB |
| DELETE | `/upload/images/:imageId?entityType=` | Elimina imagen de DB y S3 |
| PATCH | `/upload/images/:imageId/cover?entityType=` | Establece imagen como cover |

`entityType` acepta `"business"` o `"product"` en todos los endpoints.

---

## Funciones en `lib/api.ts`

```typescript
export async function uploadImage(
  entityType: "business" | "product",
  entityId: string,
  file: File,
  isCover: boolean = false
): Promise<{ id: string; s3Key: string; size: string; isCover: boolean }> {

  // Paso 1 — obtener presigned URL
  const { url, key } = await apiFetch<{ url: string; key: string }>(
    "/upload/presigned-url",
    {
      method: "POST",
      body: JSON.stringify({ entityType, entityId, mimeType: file.type }),
    }
  );

  // Paso 2 — subir binario directo a S3 (sin Authorization header)
  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) {
    throw new Error("Error al subir la imagen a S3");
  }

  // Paso 3 — confirmar en DB
  return apiFetch("/upload/confirm", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId, s3Key: key, isCover }),
  });
}

export async function deleteImage(
  imageId: string,
  entityType: "business" | "product"
): Promise<void> {
  await apiFetch(`/upload/images/${imageId}?entityType=${entityType}`, {
    method: "DELETE",
  });
}

export async function setCoverImage(
  imageId: string,
  entityType: "business" | "product"
): Promise<{ id: string; s3Key: string; isCover: boolean }> {
  return apiFetch(`/upload/images/${imageId}/cover?entityType=${entityType}`, {
    method: "PATCH",
  });
}
```

---

## Utilidad para construir URLs de imagen

Agrega en `lib/utils.ts`:

```typescript
const CDN = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? "";

export function getImageUrl(s3Key: string, size: "sm" | "md" | "lg" = "md"): string {
  if (!s3Key) return "/placeholder.jpg";
  // s3Key viene como processed/md/... — reemplazar tamaño si se necesita otro
  const key = s3Key.replace("processed/md/", `processed/${size}/`);
  return `${CDN}/${key}`;
}
```

Uso en componentes:

```tsx
// Thumbnail en listados
<img src={getImageUrl(image.s3Key, "sm")} className="w-16 h-16 object-cover" />

// Card mediana
<img src={getImageUrl(image.s3Key, "md")} className="w-full aspect-video object-cover" />

// Vista detalle
<img src={getImageUrl(image.s3Key, "lg")} className="w-full" />
```

---

## Componente ImageUploader

```tsx
// components/ui/image-uploader.tsx
"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/api";
import { appToast } from "@/lib/toast";

interface Props {
  entityType: "business" | "product";
  entityId: string;
  onSuccess: (image: { id: string; s3Key: string }) => void;
  isCover?: boolean;
}

export function ImageUploader({ entityType, entityId, onSuccess, isCover = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño (máx 10MB)
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      appToast.error("Solo se permiten imágenes JPG, PNG o WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      appToast.error("La imagen no puede superar 10MB");
      return;
    }

    // Preview local inmediato mientras sube
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const image = await uploadImage(entityType, entityId, file, isCover);
      onSuccess(image);
      appToast.success("Imagen subida correctamente");
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Error al subir imagen");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg border"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
      >
        {uploading ? "Subiendo..." : "Seleccionar imagen"}
      </button>
    </div>
  );
}
```

---

## Componente ImageGallery con delete y set-cover

```tsx
// components/ui/image-gallery.tsx
"use client";

import { useState } from "react";
import { deleteImage, setCoverImage } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { appToast } from "@/lib/toast";

interface Image {
  id: string;
  s3Key: string;
  isCover: boolean;
}

interface Props {
  images: Image[];
  entityType: "business" | "product";
  onUpdate: () => void; // invalidar query después de cambios
}

export function ImageGallery({ images, entityType, onUpdate }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (imageId: string) => {
    setLoadingId(imageId);
    try {
      await deleteImage(imageId, entityType);
      appToast.success("Imagen eliminada");
      onUpdate();
    } catch {
      appToast.error("Error al eliminar la imagen");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSetCover = async (imageId: string) => {
    setLoadingId(imageId);
    try {
      await setCoverImage(imageId, entityType);
      appToast.success("Cover actualizada");
      onUpdate();
    } catch {
      appToast.error("Error al actualizar la cover");
    } finally {
      setLoadingId(null);
    }
  };

  if (images.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay imágenes. Sube la primera usando el botón de arriba.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((img) => (
        <div key={img.id} className="relative group rounded-xl overflow-hidden border aspect-square">
          <img
            src={getImageUrl(img.s3Key, "md")}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Badge cover */}
          {img.isCover && (
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              Cover
            </span>
          )}

          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
            {!img.isCover && (
              <button
                onClick={() => handleSetCover(img.id)}
                disabled={loadingId === img.id}
                className="w-full text-xs bg-white text-black font-bold py-1.5 rounded-lg disabled:opacity-50"
              >
                Hacer cover
              </button>
            )}
            <button
              onClick={() => handleDelete(img.id)}
              disabled={loadingId === img.id}
              className="w-full text-xs bg-red-500 text-white font-bold py-1.5 rounded-lg disabled:opacity-50"
            >
              {loadingId === img.id ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Uso en una página de dashboard

```tsx
// app/dashboard/businesses/[id]/page.tsx (fragmento)
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useBusiness } from "@/hooks/use-data.hook";

export default function BusinessPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: business } = useBusiness(id);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["business", id] });
  };

  return (
    <div className="space-y-6">
      <ImageUploader
        entityType="business"
        entityId={id}
        isCover={!business?.images?.length} // primera imagen es cover automáticamente
        onSuccess={invalidate}
      />

      <ImageGallery
        images={business?.images ?? []}
        entityType="business"
        onUpdate={invalidate}
      />
    </div>
  );
}
```

---

## Reglas de negocio aplicadas en el backend

| Regla | Error |
|---|---|
| Máx 10 imágenes por producto | `422 Límite alcanzado` |
| Solo el dueño puede subir/eliminar/cambiar cover | `403 Sin permisos` |
| Imagen no encontrada | `404 Imagen no encontrada` |

---

## Notas importantes

- El `PUT` a la presigned URL **no debe llevar el header `Authorization`** — la URL ya está firmada con las credenciales de AWS
- La presigned URL expira en **15 minutos** — si el usuario tarda más, el upload fallará con 403
- El `image-processor` Lambda genera los 3 tamaños WebP de forma asíncrona — puede haber un delay de 1-3 segundos entre el confirm y que las imágenes estén disponibles en CloudFront
- El `s3Key` que devuelve `/upload/confirm` apunta al tamaño `md` — usa `getImageUrl(key, "sm"|"md"|"lg")` para obtener los otros tamaños
