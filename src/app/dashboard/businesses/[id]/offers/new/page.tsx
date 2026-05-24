"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Zap, Loader2, Percent } from "lucide-react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FlashOfferRegistrationSchema, type FlashOfferRegistrationFormValues } from "@/lib/validations";
import { createFlashOfferAction } from "@/actions/mutations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/date-time-picker";
import BackButton from "@/components/dashboard/back-button";

export default function NewFlashOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: businessId } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<FlashOfferRegistrationFormValues>({
      resolver: zodResolver(FlashOfferRegistrationSchema),
      defaultValues: {
        title: "",
        description: "",
        discount_pct: "10",
        starts_at: undefined,
        expires_at: undefined,
      },
    });

  // Controladores para los campos de fecha (DateTimePicker devuelve Date)
  const { field: startsAtField } = useController({ name: "starts_at", control });
  const { field: expiresAtField } = useController({ name: "expires_at", control });

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
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-3 bg-secondary/20 rounded-full text-foreground">
          <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Oferta Relámpago</h1>
          <p className="text-muted-foreground font-medium">Atrae clientes rápidamente con descuentos por tiempo limitado.</p>
        </div>
        <BackButton businessId={businessId} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Detalles ─────────────────────────────────────────────────────── */}
        <Card className="border-border shadow-sm border-t-4 border-t-yellow-500">
          <CardHeader>
            <CardTitle>Detalles de la Oferta</CardTitle>
            <CardDescription>Hazla atractiva y clara para tus compradores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título de la promoción <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej. Pizza Familiar a Mitad de Precio"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción / Términos <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Añade las condiciones, ¿cómo aplica?, el ¿por qué?, etc."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_pct">
                Porcentaje de Descuento (%)
              </Label>
              <div className="relative w-1/2">
                <Input
                  id="discount_pct"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  {...register("discount_pct")}
                  className={`pl-9 text-lg font-bold ${errors.discount_pct ? "border-destructive" : ""}`}
                />
                <Percent className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.discount_pct && (
                <p className="text-sm text-destructive">{errors.discount_pct.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Duración ─────────────────────────────────────────────────────── */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Duración</CardTitle>
            <CardDescription>Define la urgencia exacta de la promoción.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            {/* Fecha de inicio */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="starts_at">
                Inicia el <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                id="starts_at"
                value={startsAtField.value}
                onChange={startsAtField.onChange}
                placeholder="Fecha y hora de inicio"
                className={errors.starts_at ? "border-destructive" : ""}
              />
              {errors.starts_at && (
                <p className="text-sm text-destructive">{errors.starts_at.message}</p>
              )}
            </div>

            {/* Fecha de fin */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="expires_at">
                Termina el <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                id="expires_at"
                value={expiresAtField.value}
                onChange={expiresAtField.onChange}
                placeholder="Fecha y hora de fin"
                className={errors.expires_at ? "border-destructive" : ""}
              />
              {errors.expires_at && (
                <p className="text-sm text-destructive">{errors.expires_at.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Acciones ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-12">
          {serverError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-sm font-medium">
              {serverError}
            </div>
          )}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/businesses/${businessId}/offers`}>Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="px-8 shadow-md bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold"
            >
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
