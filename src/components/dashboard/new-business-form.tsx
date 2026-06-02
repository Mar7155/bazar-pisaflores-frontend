"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, Loader2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BusinessRegistrationSchema, type BusinessRegistrationFormValues } from "@/lib/validations";
import { createBusinessAction } from "@/actions/mutations";
import { Category } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NewBusinessFormProps {
  categories: Category[];
}

export function NewBusinessForm({ categories }: NewBusinessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessRegistrationFormValues>({
    resolver: zodResolver(BusinessRegistrationSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      phone: "",
      address: "",
      google_maps_url: "",
    }
  });

  const onSubmit = async (data: BusinessRegistrationFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await createBusinessAction(data);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Lo básico para que los clientes te reconozcan instantáneamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de tu Comercio <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Ej. Pizzería Don Juan"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Categoría <span className="text-red-500">*</span></Label>
            <select
              id="category_id"
              {...register("category_id")}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.category_id ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>Selecciona un rubro...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción breve</Label>
            <Textarea
              id="description"
              placeholder="¿Qué hace especial a tu negocio? ¿Qué ofreces?"
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Contacto y Ubicación</CardTitle>
          <CardDescription>Facilita que tus clientes en Pisaflores te encuentren y contacten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="52 123 456 7890"
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            { errors.phone ? (
              <p className="text-red-500">{errors.phone.message}</p>
            ) : (
              <p className="text-muted-foreground">Ingresa tu numero con el codigo de país (ej. 1 o 52 sin "+")</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección Local (ej. calle francia #30, centro)</Label>
            <div className="relative">
              <Input
                id="address"
                placeholder="Tu dirección aquí..."
                maxLength={100}
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              {errors.address ? (
                <p className="text-red-500">{errors.address.message}</p>
              ) : (
                <p className="text-muted-foreground">Máximo 100 caracteres.</p>
              )}
            </div>
          </div>

          <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
            <Label htmlFor="google_maps_url" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Link de Google Maps (Recomendado)
            </Label>
            <p className="text-xs text-muted-foreground mb-3">Pega el link de Google Maps de la ubicación de tu negocio para que los clientes puedan llegar fácilmente.</p>
            <Input
              id="google_maps_url"
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              {...register("google_maps_url")}
              className={errors.google_maps_url ? "border-red-500" : ""}
            />
            {errors.google_maps_url && <p className="text-sm text-red-500">{errors.google_maps_url.message}</p>}
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
            <Link href="/dashboard">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg" className="px-8 shadow-md">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              "Registrar Negocio"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
