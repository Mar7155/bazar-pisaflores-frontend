"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Zap, Loader2, ArrowLeft, Percent } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FlashOfferRegistrationSchema, type FlashOfferRegistrationFormValues } from "@/lib/validations";
import { createFlashOfferAction } from "@/actions/mutations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/dashboard/back-button";

export default function NewFlashOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: businessId } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FlashOfferRegistrationFormValues>({
    resolver: zodResolver(FlashOfferRegistrationSchema),
    defaultValues: {
      title: "",
      description: "",
      discount_pct: "10",
      starts_at: "",
      expires_at: ""
    }
  });

  const onSubmit = async (data: FlashOfferRegistrationFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await createFlashOfferAction(businessId, data);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
    // On success, the server action redirects automatically
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <BackButton />

        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Nueva Oferta Relámpago
          </h1>
          <p className="text-muted-foreground font-medium">Atrae clientes rápidamente con descuentos por tiempo limitado.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-sm border-t-4 border-t-yellow-500">
          <CardHeader>
            <CardTitle>Detalles de la Oferta</CardTitle>
            <CardDescription>Hazla atractiva y clara para tus compradores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la promoción <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Ej. Pizza Familiar a Mitad de Precio"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción / Términos</Label>
              <Textarea
                id="description"
                placeholder="Válido solo mostrando este cupón en mostrador..."
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_pct">Porcentaje de Descuento (%) <span className="text-red-500">*</span></Label>
              <div className="relative w-1/2">
                <Input
                  id="discount_pct"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  {...register("discount_pct")}
                  className={`pl-9 text-lg font-bold ${errors.discount_pct ? "border-red-500" : ""}`}
                />
                <Percent className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.discount_pct && <p className="text-sm text-red-500">{errors.discount_pct.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Duración</CardTitle>
            <CardDescription>Define la urgencia exacta de la promoción.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="starts_at">Inicia el <span className="text-red-500">*</span></Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register("starts_at")}
                className={errors.starts_at ? "border-red-500" : ""}
              />
              {errors.starts_at && <p className="text-sm text-red-500">{errors.starts_at.message}</p>}
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="expires_at">Termina el <span className="text-red-500">*</span></Label>
              <Input
                id="expires_at"
                type="datetime-local"
                {...register("expires_at")}
                className={errors.expires_at ? "border-red-500" : ""}
              />
              {errors.expires_at && <p className="text-sm text-red-500">{errors.expires_at.message}</p>}
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
              <Link href={`/dashboard/businesses/${businessId}/offers`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg" className="px-8 shadow-md bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
              ) : (
                "Lanzar Oferta"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
