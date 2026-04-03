"use client";

import { Store, MapPin, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Business } from "@/types";

interface BusinessDashboardCardProps {
  business: Business;
}

export function BusinessDashboardCard({ business }: BusinessDashboardCardProps) {
  return (
    <div key={business.id} className="border border-border p-6 rounded-2xl flex flex-col gap-4 bg-card shadow-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
      <div className="flex items-start justify-between">
        <div className="bg-primary/20 p-3 rounded-xl text-primary font-bold">
          <Store className="w-6 h-6" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {business.is_active ? 'Publicado' : 'Pausado'}
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{business.name}</h2>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4" /> {business.address || "Sin dirección"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
        {/* Placeholder for future stats like product count or views */}
      </div>

      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" className="flex-1 font-bold h-10 rounded-xl" asChild>
          <Link href={`/dashboard/businesses/${business.id}`}>
            <Edit className="w-4 h-4 mr-2" /> Administrar
          </Link>
        </Button>
        <Button variant="secondary" size="sm" className="h-10 w-10 p-0 rounded-xl" asChild title="Ver perfil público">
          <Link href={`/businesses/${business.id}`} target="_blank">
            <Eye className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
