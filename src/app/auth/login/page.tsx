"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema, type LoginFormValues } from "@/lib/validations";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    const result = await loginAction(data.email, data.password);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // On success loginAction redirects automatically
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-2">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
        <Store className="w-6 h-6 text-primary" />
        Bazar<span className="text-muted-foreground">Pisaflores</span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] animate-slide-up opacity-0 relative z-10">
        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-black">Bienvenido de vuelta</CardTitle>
            <CardDescription className="text-md">
              Ingresa tus credenciales para administrar tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium mb-4 animate-fade-in">
                {error}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-6 shadow-md" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>Iniciar Sesión <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground pt-0 border-t border-border/50 py-4">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="hover:text-primary underline ml-1 font-semibold text-foreground">
              Regístrate gratis
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
