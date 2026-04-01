"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, PackageOpen, DollarSign } from "lucide-react";
import { ProductRegistrationSchema, type ProductRegistrationFormValues } from "@/lib/validations";
import { updateProductAction } from "@/actions/mutations";
import { toast } from "sonner";
import { Product } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProductEditFormProps {
  businessId: string;
  product: Product;
}

export function ProductEditForm({ businessId, product }: ProductEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductRegistrationFormValues>({
    resolver: zodResolver(ProductRegistrationSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      is_available: product.is_available,
    }
  });

  const isAvailable = watch("is_available");

  const onSubmit = async (data: ProductRegistrationFormValues) => {
    try {
      setIsSubmitting(true);
      const result = await updateProductAction(businessId, product.id, data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Producto actualizado correctamente.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error inesperado al guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <PackageOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Información del Producto</CardTitle>
              <CardDescription>Edita los detalles básicos y la disponibilidad.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej. Tacos de Pastor (Orden)"
                {...register("name")}
                className={`h-11 rounded-xl shadow-sm ${errors.name ? "border-red-500 ring-red-500/20" : ""}`}
              />
              {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-bold flex items-center gap-2">
                Precio al Público ($) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price"
                  type="text"
                  placeholder="0.00"
                  {...register("price")}
                  className={`h-11 pl-9 rounded-xl shadow-sm font-bold text-lg ${errors.price ? "border-red-500 ring-red-500/20" : ""}`}
                />
              </div>
              {errors.price && <p className="text-xs font-bold text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe los ingredientes, tamaño o cualquier detalle importante..."
              {...register("description")}
              className="min-h-[120px] rounded-xl shadow-sm resize-none"
            />
            {errors.description && <p className="text-xs font-bold text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">Disponibilidad</Label>
              <p className="text-sm text-muted-foreground">
                Define si el producto está visible y se puede ordenar actualmente.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'En Existencia' : 'Agotado'}
              </span>
              <Switch
                checked={isAvailable}
                onCheckedChange={(checked: boolean) => setValue("is_available", checked)}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 overflow-hidden group"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
          ) : (
            <>
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
