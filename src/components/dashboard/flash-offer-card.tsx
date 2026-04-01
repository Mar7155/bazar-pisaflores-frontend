"use client";

import { Flame, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FlashOffer } from "@/types";
import Link from "next/link";
import { Button } from "../ui/button";

interface FlashOfferCardProps {
  offer: FlashOffer;
  isDashboard?: boolean;
  children?: React.ReactNode; // For dashboard-only actions (e.g., delete button)
}

export function FlashOfferCard({ offer, isDashboard = false, children }: FlashOfferCardProps) {
  const isExpired = new Date() > new Date(offer.expires_at);
  const statusColor = offer.is_active && !isExpired
    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50"
    : "bg-muted text-muted-foreground border-border";

  if (isDashboard) {
    return (
      <Card className="overflow-hidden flex flex-col shadow-sm border-border group relative">
        {(!offer.is_active || isExpired) && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="bg-background border border-border px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl">
              {isExpired ? "Expirada" : "Pausada"}
            </span>
          </div>
        )}

        <CardContent className="p-0 flex flex-col h-full">
          <div className="p-5 border-b border-border bg-card/50">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded border ${statusColor}`}>
                {offer.is_active && !isExpired ? "ACTIVA" : "INACTIVA"}
              </span>
              {offer.discount_pct && (
                <span className="font-black text-destructive">-{offer.discount_pct}%</span>
              )}
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2">{offer.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {offer.description || "Sin descripción adicional."}
            </p>
          </div>

          <div className="p-5 bg-muted/30 flex flex-col gap-3 mt-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Clock className="w-4 h-4" />
              Expira: {new Date(offer.expires_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>

          {children && (
            <div className="grid grid-cols-1 divide-x divide-border border-t border-border mt-auto">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Public Mode
  return (
    <div className="relative overflow-hidden bg-accent/5 border-2 border-accent/20 rounded-2xl p-5 md:p-6 shadow-sm group hover:border-accent/60 transition-colors">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/30 transition-colors"></div>
      <div className="flex justify-between items-start mb-3">
        <span className="font-bold text-accent bg-accent/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm flex items-center gap-1">
          <Flame className="w-3 h-3" /> Tiempo Limitado
        </span>
        {offer.discount_pct && (
          <span className="font-black text-2xl text-destructive drop-shadow-sm">-{offer.discount_pct}%</span>
        )}
      </div>
      <h3 className="font-bold text-xl leading-tight mb-2 line-clamp-2">{offer.title}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 font-medium">{offer.description}</p>
      <div className="flex items-center gap-2 mt-auto text-xs font-bold text-muted-foreground bg-background rounded-lg p-2 border border-border">
        <Clock className="w-4 h-4 text-accent" />
        Expira: {new Date(offer.expires_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
      </div>
      <Button asChild className="w-full mt-4 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        <Link href={`/businesses/${offer.business_id}`}>
          Ver en tienda <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
