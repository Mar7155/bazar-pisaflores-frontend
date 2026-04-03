"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Loader2, ArrowRight, ShieldCheck, TrendingUp, Megaphone } from "lucide-react";
import { upgradeRoleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function BecomeOwnerCTA() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpgrade = async () => {
    setIsSubmitting(true);
    await upgradeRoleAction();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in relative">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="bg-primary/20 text-primary p-4 rounded-3xl mb-8">
        <Store className="w-16 h-16 md:w-20 md:h-20" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
        Bienvenido a tu Panel
      </h1>

      <p className="text-xl text-muted-foreground max-w-2xl mb-12">
        Actualmente tienes una cuenta de visitante. Para registrar tu negocio y convertirte en locatario, haz clic en el botón de abajo, es gratuito.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mb-16">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
          <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">Más Ventas</h3>
          <p className="text-muted-foreground text-sm">Alcanza a cientos de vecinos buscando exactamente lo que tú ofreces.</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
          <Megaphone className="w-8 h-8 text-yellow-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">Ofertas Relámpago</h3>
          <p className="text-muted-foreground text-sm">Envía promociones en tiempo real para liquidar inventario o atraer gente nueva.</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
          <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">100% Gratuito</h3>
          <p className="text-muted-foreground text-sm">Gestiona tu presencia digital sin comisiones por nuestra parte.</p>
        </div>
      </div>

      <Button onClick={handleUpgrade} disabled={isSubmitting} size="lg" className="h-16 px-10 rounded-full text-lg shadow-xl hover:scale-105 transition-transform">
        {isSubmitting ? (
          <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Configurando tu cuenta...</>
        ) : (
          <>Habilitar Mi Cuenta de Locatario <ArrowRight className="w-6 h-6 ml-3" /></>
        )}
      </Button>
      <p className="text-sm text-muted-foreground mt-6 max-w-md">
        Al hacer clic, nuestro sistema te otorgará permisos de Administrador de local.
      </p>
    </div>
  );
}
