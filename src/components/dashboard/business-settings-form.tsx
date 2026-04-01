"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft, Clock, Save, Loader2, Store, Phone, MapPin,
   Settings, ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
   SchedulesSchema, type SchedulesFormValues,
   BusinessRegistrationSchema, type BusinessRegistrationFormValues
} from "@/lib/validations";
import { updateBusinessAction, updateSchedulesAction } from "@/actions/mutations";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appToast } from "@/lib/toast";
import { Business, Category } from "@/types";

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface BusinessSettingsFormProps {
   business: Business;
   categories: Category[];
   id: string;
}

export function BusinessSettingsForm({ business, categories, id }: BusinessSettingsFormProps) {
   const router = useRouter();
   const queryClient = useQueryClient();
   const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
   const [isSubmittingSchedules, setIsSubmittingSchedules] = useState(false);

   // Form 1: General Info
   const infoForm = useForm<BusinessRegistrationFormValues>({
      resolver: zodResolver(BusinessRegistrationSchema),
      defaultValues: {
         name: business.name || "",
         description: business.description || "",
         category_id: business.category_id || "",
         phone: business.phone || "",
         address: business.address || "",
         google_maps_url: business.maps_url || ""
      }
   });

   // Form 2: Schedules - Ensure no nulls are passed to the form
   const initialSchedules = (business.schedules && business.schedules.length > 0)
      ? business.schedules.map(s => ({
         day_of_week: s.day_of_week,
         opens_at: s.opens_at || "09:00",
         closes_at: s.closes_at || "18:00",
         is_closed: !!s.is_closed,
      }))
      : DAYS_ES.map((_, index) => ({
         day_of_week: index,
         opens_at: "09:00",
         closes_at: "18:00",
         is_closed: index === 0,
      }));

   const scheduleForm = useForm<SchedulesFormValues>({
      resolver: zodResolver(SchedulesSchema),
      defaultValues: { schedules: initialSchedules }
   });

   const { fields } = useFieldArray({
      control: scheduleForm.control,
      name: "schedules"
   });

   const onInfoSubmit = async (data: BusinessRegistrationFormValues) => {
      setIsSubmittingInfo(true);
      const result = await updateBusinessAction(id, data);
      if (result?.error) {
         appToast.error(result.error);
      } else {
         appToast.businessUpdated();
         queryClient.invalidateQueries({ queryKey: ["business", id] });
      }
      setIsSubmittingInfo(false);
   };

   const onSchedulesSubmit = async (data: SchedulesFormValues) => {
      setIsSubmittingSchedules(true);
      const result = await updateSchedulesAction(id, data);
      if (result?.error) {
         appToast.error(result.error);
      } else {
         appToast.scheduleSaved();
         queryClient.invalidateQueries({ queryKey: ["business", id] });
      }
      setIsSubmittingSchedules(false);
   };

   return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20 px-4">

         {/* Premium Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
               <div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                     <Settings className="w-8 h-8 text-primary" />
                     Configuración
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-1">
                     Administra tu negocio <ChevronRight className="w-4 h-4" /> <span className="text-primary">{infoForm.getValues("name")}</span>
                  </p>
               </div>
            </div>
         </div>

         {/* 1. INFORMACIÓN GENERAL SECTION */}
         <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1.5 h-6 bg-primary rounded-full" />
               <h2 className="text-xl font-bold tracking-tight">Información General</h2>
            </div>

            <Card className="border-border/60 shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-sm overflow-hidden">
               <form onSubmit={infoForm.handleSubmit(onInfoSubmit)}>
                  <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Store className="w-5 h-5 text-primary" /> Detalles del Perfil
                           </CardTitle>
                           <CardDescription>Actualiza el nombre, descripción y categoría de tu comercio.</CardDescription>
                        </div>
                        <Button type="submit" disabled={isSubmittingInfo} className="hidden md:flex shadow-md h-10 px-6">
                           {isSubmittingInfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                           Guardar Cambios
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="name" className="font-bold">Nombre del Negocio</Label>
                           <Input
                              id="name"
                              {...infoForm.register("name")}
                              className="bg-background/50 border-border/80 focus:ring-primary/20"
                           />
                           {infoForm.formState.errors.name && <p className="text-xs text-red-500 font-medium">{infoForm.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="category_id" className="font-bold">Categoría</Label>
                           <select
                              id="category_id"
                              {...infoForm.register("category_id")}
                              className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                           >
                              <option value="" disabled>Selecciona una categoría</option>
                              {categories.map(cat => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           {infoForm.formState.errors.category_id && <p className="text-xs text-red-500 font-medium">{infoForm.formState.errors.category_id.message}</p>}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold">Descripción</Label>
                        <Textarea
                           id="description"
                           {...infoForm.register("description")}
                           rows={3}
                           className="bg-background/50 border-border/80 focus:ring-primary/20 resize-none"
                           placeholder="Describe lo que ofreces a tus clientes..."
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                        <div className="space-y-2">
                           <Label htmlFor="phone" className="font-bold flex items-center gap-2">
                              <Phone className="w-4 h-4 text-primary" /> Teléfono / WhatsApp
                           </Label>
                           <Input
                              id="phone"
                              {...infoForm.register("phone")}
                              className="bg-background/50 border-border/80"
                              placeholder="10 dígitos"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="address" className="font-bold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> Dirección
                           </Label>
                           <Input
                              id="address"
                              {...infoForm.register("address")}
                              className="bg-background/50 border-border/80"
                              placeholder="Ej. Calle S/N, Centro"
                           />
                        </div>
                     </div>

                     <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <Label htmlFor="google_maps_url" className="font-bold text-primary">Google Maps URL</Label>
                        <Input
                           id="google_maps_url"
                           {...infoForm.register("google_maps_url")}
                           className="bg-background border-primary/20"
                           placeholder="https://maps.app.goo.gl/..."
                        />
                        <p className="text-[10px] text-muted-foreground">Pega el link de compartir para que los clientes lleguen fácilmente.</p>
                     </div>

                     <div className="md:hidden pt-4">
                        <Button type="submit" disabled={isSubmittingInfo} className="w-full h-12 text-base font-bold shadow-lg">
                           {isSubmittingInfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                           Guardar Cambios
                        </Button>
                     </div>
                  </CardContent>
               </form>
            </Card>
         </section>

         {/* 2. HORARIOS DE ATENCIÓN SECTION */}
         <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1.5 h-6 bg-accent rounded-full" />
               <h2 className="text-xl font-bold tracking-tight">Horario de Atención</h2>
            </div>

            <form onSubmit={scheduleForm.handleSubmit(onSchedulesSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {fields.map((field, index) => {
                     const isClosed = scheduleForm.watch(`schedules.${index}.is_closed`);
                     return (
                        <div
                           key={field.id}
                           className={`
                              group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300
                              ${isClosed
                                 ? 'bg-muted/40 border-border/40 opacity-70 grayscale-[0.5]'
                                 : 'bg-card border-border hover:border-accent shadow-sm hover:shadow-md'
                              }
                           `}
                        >
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                 <input
                                    type="checkbox"
                                    id={`is_closed_${index}`}
                                    {...scheduleForm.register(`schedules.${index}.is_closed` as const)}
                                    className="peer sr-only"
                                 />
                                 <Label
                                    htmlFor={`is_closed_${index}`}
                                    className="block w-12 h-6 bg-muted rounded-full cursor-pointer transition-colors peer-checked:bg-red-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"
                                 />
                              </div>
                              <Label
                                 htmlFor={`is_closed_${index}`}
                                 className={`text-lg font-black tracking-tight cursor-pointer ${isClosed ? 'text-muted-foreground' : 'text-foreground'}`}
                              >
                                 {DAYS_ES[index]}
                              </Label>
                              {isClosed && (
                                 <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                                    Cerrado
                                 </span>
                              )}
                           </div>

                           <input type="hidden" {...scheduleForm.register(`schedules.${index}.day_of_week` as const, { valueAsNumber: true })} value={String(index)} />

                           <div className={`flex items-center gap-3 transition-all duration-300 ${isClosed ? 'opacity-30 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Apertura</span>
                                 <Input
                                    type="time"
                                    step={60}
                                    {...scheduleForm.register(`schedules.${index}.opens_at` as const)}
                                    className="h-10 w-32 md:w-36 font-mono text-base border-border/60 bg-background/30 rounded-xl"
                                 />
                              </div>
                              <div className="h-0.5 w-3 bg-muted mt-5" />
                              <div className="flex flex-col gap-1">
                                 <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Cierre</span>
                                 <Input
                                    type="time"
                                    step={60}
                                    {...scheduleForm.register(`schedules.${index}.closes_at` as const)}
                                    className="h-10 w-32 md:w-36 font-mono text-base border-border/60 bg-background/30 rounded-xl"
                                 />
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <div className="bg-muted/50 p-6 rounded-2xl border border-dashed border-border/80 flex gap-4">
                  <div className="p-2 h-fit bg-accent/10 rounded-full text-accent shrink-0">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm font-bold">Nota sobre horarios</p>
                     <p className="text-xs text-muted-foreground leading-relaxed">
                        Si marcas un día como <strong>Cerrado</strong>, los clientes no podrán ver horarios para ese día y tu negocio aparecerá como no disponible en el directorio. La configuración se guarda instantáneamente al presionar el botón inferior.
                     </p>
                  </div>
               </div>

               <Button
                  type="submit"
                  disabled={isSubmittingSchedules}
                  size="lg"
                  className="w-full md:w-auto h-14 md:h-12 px-10 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/20 font-black text-lg md:text-base tracking-tight"
               >
                  {isSubmittingSchedules ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  Guardar Horarios
               </Button>
            </form>
         </section>
      </div>
   );
}
