"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Store, Loader2, CheckCircle2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ConfirmCodeSchema, type ConfirmCodeFormValues } from "@/lib/validations";
import { confirmEmailAction, resendCodeAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfirmCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, getValues } = useForm<ConfirmCodeFormValues>({
    resolver: zodResolver(ConfirmCodeSchema),
    defaultValues: { email: prefillEmail, code: "" }
  });

  const onSubmit = async (data: ConfirmCodeFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = await confirmEmailAction(data.email, data.code);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => { router.push("/auth/login"); }, 3000);
  };

  const handleResend = async () => {
    const email = getValues("email");
    if (!email) return;
    await resendCodeAction(email);
    setResendSent(true);
    setTimeout(() => setResendSent(false), 5000);
  };

  if (success) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center animate-fade-in px-2">
        <Card className="w-full max-w-sm shadow-xl border-primary/20 bg-card p-6 flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl mb-2">Cuenta Verificada</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Serás redirigido al inicio de sesión en unos segundos.</CardDescription>
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

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] animate-slide-up opacity-0">
        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-black">Verifica tu correo</CardTitle>
            <CardDescription className="text-md">
              Ingresa el código de 6 dígitos que te enviamos via <span className="text-primary font-bold">Amazon Cognito</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium mb-4">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="El correo que registraste"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <Label htmlFor="code" className="self-start">Código de Verificación</Label>
                <Controller
                  control={control}
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
                {errors.code && <p className="text-sm text-red-500 font-medium self-start">{errors.code.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-6 shadow-md" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                ) : (
                  "Verificar Cuenta"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center text-sm text-muted-foreground pt-0 border-t border-border/50 py-4 gap-2 text-center">
            <p>¿No lo recibiste?</p>
            <button
              type="button"
              className="text-primary font-bold hover:underline"
              onClick={handleResend}
            >
              {resendSent ? "¡Código reenviado!" : "Reenviar código"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
