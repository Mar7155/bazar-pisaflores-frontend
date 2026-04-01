"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { UserRegistrationSchema, type UserRegistrationFormValues } from "@/lib/validations";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<UserRegistrationFormValues>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" }
  });

  const onSubmit = async (data: UserRegistrationFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await registerAction(data.email, data.password);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    // On success, redirect to confirm page with email pre-filled
    setRegisteredEmail(data.email);
    router.push(`/auth/confirm?email=${encodeURIComponent(data.email)}`);
  };

  if (registeredEmail) {
    return (
      <section className="container flex h-screen w-screen flex-col items-center justify-center animate-fade-in px-2">
        <Card className="w-full max-w-md shadow-xl border-primary/20 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 text-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-base mt-2">
              Hemos enviado un código de verificación a <strong>{registeredEmail}</strong>. Revisa tu bandeja de entrada.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full mt-4" asChild>
              <Link href={`/auth/confirm?email=${encodeURIComponent(registeredEmail)}`}>
                Ingresar código <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    );
  }

  return (
    <section className="container flex h-screen w-screen flex-col items-center justify-center px-2">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
        <Store className="w-6 h-6 text-primary" />
        Bazar<span className="text-muted-foreground">Pisaflores</span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] animate-slide-up opacity-0">
        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-black">Crear una cuenta</CardTitle>
            <CardDescription className="text-md">
              Únete para publicar tu negocio en Bazar Pisaflores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium mb-4">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-6 shadow-md" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
                ) : (
                  <>Registrarse <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground pt-0 border-t border-border/50 py-4">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="hover:text-primary underline ml-1 font-semibold text-foreground">
              Inicia sesión aquí
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
