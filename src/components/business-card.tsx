"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Business } from "@/types";
import { getBusinessImageUrl } from "@/lib/utils";

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const today = new Date().getDay();
  const todaySchedule = business.schedules?.find(s => s.day_of_week === today);
  const isOpen = todaySchedule && !todaySchedule.is_closed;

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors group text-card-foreground flex flex-col h-full shadow-sm">
      <div className="h-40 md:h-48 bg-muted relative">
        {business.coverImage ? (
          <Image
            src={getBusinessImageUrl(business.coverImage, 'md')}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
            <span className="text-muted-foreground/30 font-black text-4xl tracking-tighter">Bazar</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 flex gap-2">
          {business.category && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
              {business.category.name}
            </span>
          )}
          <span className={`text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm ${isOpen ? "bg-green-700" : "bg-red-500"}`}>
            <Clock className="w-3 h-3" /> {isOpen ? "Abierto" : "Cerrado"}
          </span>
        </div>
      </div>

      <CardContent className="p-4 md:p-5 flex flex-col h-[180px]">
        <Link href={`/businesses/${business.id}`} className="hover:underline">
          <h3 className="font-bold text-xl mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight pt-1">
            {business.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3" title={business.address || "Sin dirección"}>
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{business.address || "Pisaflores, Hgo."}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <Button variant="ghost" size="sm" className="text-primary font-bold hover:text-primary hover:bg-primary/10" asChild>
            <Link href={`/businesses/${business.id}`}>Ver perfil <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
