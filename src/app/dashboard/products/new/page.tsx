"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { PackageOpen, Loader2, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

import { ProductRegistrationSchema, type ProductRegistrationFormValues } from "@/lib/validations";
import { createProductAction } from "@/actions/mutations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/dashboard/back-button";

function NewProductForm() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("businessId") || "biz-1";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductRegistrationFormValues>({
    resolver: zodResolver(ProductRegistrationSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      is_available: true,
    }
  });

  const onSubmit = async (data: ProductRegistrationFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await createProductAction(businessId, data);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
    // On success, the server action redirects to the business dashboard
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-3 bg-secondary/20 rounded-full text-foreground">
           <PackageOpen className="w-8 h-8" />
        </div>
        <div>
           <h1 className="text-3xl font-black text-foreground tracking-tight">Nuevo Producto</h1>
           <p className="text-muted-foreground font-medium">Añade un artículo o servicio a tu inventario.</p>
        </div>
        <BackButton businessId={businessId} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-sm">
           <CardHeader>
             <CardTitle>Detalles del Producto</CardTitle>
             <CardDescription>Informa a tus clientes exactamente qué ofreces.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Pizza Hawaiana Grande" 
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
             </div>

             <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Elaborada con piña natural, jamón y mucho queso..." 
                  {...register("description")}
                />
             </div>
           </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
           <CardHeader>
             <CardTitle>Comercial</CardTitle>
             <CardDescription>Configura el costo y la disponibilidad.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="price">Precio (MXN) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input 
                    id="price" 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    {...register("price")}
                    className={`pl-9 ${errors.price ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
             </div>

             <div className="flex items-center gap-2 pt-4 border-t border-border mt-2">
               <input 
                 type="checkbox" 
                 id="is_available" 
                 {...register("is_available")} 
                 className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
               />
               <div className="flex flex-col">
                 <Label htmlFor="is_available" className="text-foreground">Disponible actualmente</Label>
                 <span className="text-xs text-muted-foreground">Desmárcalo si te quedaste sin existencias temporalmente.</span>
               </div>
             </div>
           </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pb-12">
           {serverError && (
             <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm font-medium">
               {serverError}
             </div>
           )}
           <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/businesses/${businessId}`}>Cancelar</Link>
             </Button>
             <Button type="submit" disabled={isSubmitting} size="lg" className="px-8 shadow-md">
               {isSubmitting ? (
                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
               ) : (
                 "Guardar Producto"
               )}
             </Button>
           </div>
        </div>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewProductForm />
    </Suspense>
  );
}
