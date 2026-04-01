import { Store } from "lucide-react";
import { getCategories } from "@/lib/api";
import { NewBusinessForm } from "@/components/dashboard/new-business-form";

export default async function NewBusinessPage() {
  // Fetch data on the server to avoid CORS issues
  const categories = await getCategories();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-3 bg-primary/10 rounded-full">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Crea tu Negocio</h1>
          <p className="text-muted-foreground font-medium">Completa el perfil para aparecer en el directorio de Pisaflores.</p>
        </div>
      </div>

      <NewBusinessForm categories={categories} />
    </div>
  );
}
