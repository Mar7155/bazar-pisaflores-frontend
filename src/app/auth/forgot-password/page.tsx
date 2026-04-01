"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, Loader2, KeyRound, MailCheck, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { ForgotPasswordSchema, ResetPasswordSchema, type ForgotPasswordFormValues, type ResetPasswordFormValues } from "@/lib/validations";
import { forgotPasswordAction, resetPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const reqForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: "", code: "", newPassword: "" }
  });

  const onRequestSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await forgotPasswordAction(data.email);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    setSavedEmail(data.email);
    resetForm.setValue("email", data.email);
    setStep("reset");
    setIsSubmitting(false);
  };

  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await resetPasswordAction(data.email, data.code, data.newPassword);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    setStep("success");
    setIsSubmitting(false);
    setTimeout(() => { router.push("/auth/login"); }, 3000);
  };

  if (step === "success") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center px-2 animate-fade-in">
        <Card className="w-full max-w-sm shadow-xl border-primary/20 bg-card p-6 flex flex-col items-center text-center">
          <KeyRound className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-2xl mb-2">¡Contraseña Actualizada!</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Tu contraseña ha sido restablecida con éxito.</CardDescription>
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mt-6" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-2">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
        <Store className="w-6 h-6 text-primary" />
        Bazar<span className="text-muted-foreground">Pisaflores</span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] animate-slide-up opacity-0 relative z-10 block">
        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-black">{step === "request" ? "Recuperar Contraseña" : "Crea tu Nueva Contraseña"}</CardTitle>
            <CardDescription className="text-md">
              {step === "request" 
                ? "Ingresa tu correo y te enviaremos instrucciones para restaurar tu acceso." 
                : "Captura el código que enviamos a tu bandeja y elige una nueva contraseña."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === "request" && (
                <form onSubmit={reqForm.handleSubmit(onRequestSubmit)} className="space-y-4 animate-fade-in">
                {serverError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium">
                    {serverError}
                  </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="req-email">Correo electrónico</Label>
                    <Input 
                        id="req-email" 
                        type="email" 
                        placeholder="tu@correo.com" 
                        {...reqForm.register("email")}
                        className={reqForm.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {reqForm.formState.errors.email && <p className="text-sm text-red-500 font-medium">{reqForm.formState.errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full mt-6 shadow-md" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                    ) : (
                    <><MailCheck className="mr-2 h-4 w-4" /> Enviar Código</>
                    )}
                </Button>
                </form>
            )}

            {step === "reset" && (
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6 animate-fade-in">
                {serverError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium">
                    {serverError}
                  </div>
                )}
                <div className="space-y-2 flex flex-col items-center">
                    <Label htmlFor="code" className="self-start">Código de Recuperación (Cognito)</Label>
                    <Controller
                    control={resetForm.control}
                    name="code"
                    render={({ field }) => (
                        <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        </InputOTP>
                    )}
                    />
                    {resetForm.formState.errors.code && <p className="text-sm text-red-500 font-medium self-start">{resetForm.formState.errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    {...resetForm.register("newPassword")}
                    className={resetForm.formState.errors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {resetForm.formState.errors.newPassword && <p className="text-sm text-red-500 font-medium">{resetForm.formState.errors.newPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full shadow-md" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                    "Guardar y Entrar"
                    )}
                </Button>
                </form>
            )}
          </CardContent>

          {step === "request" && (
            <CardFooter className="flex justify-center text-sm text-muted-foreground pt-0 border-t border-border/50 py-4">
                <Link href="/auth/login" className="hover:text-primary font-semibold text-foreground flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Login
                </Link>
            </CardFooter>
          )}

          {step === "reset" && (
            <CardFooter className="flex justify-center text-sm text-muted-foreground pt-0 border-t border-border/50 py-4 gap-2 text-center flex-col">
                <p>Enviamos el código a <strong>{savedEmail}</strong></p>
                <button type="button" onClick={() => setStep("request")} className="text-primary font-bold hover:underline">
                    Cambiar correo
                </button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
