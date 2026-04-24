import Link from "next/link";
import { Store, UserCircle, LogOut, Settings, PackageOpen } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-background border-r border-border shrink-0 flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col gap-6 p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
            <Store className="w-6 h-6 text-primary" />
            Bazar<span className="text-muted-foreground">Pisaflores</span>
          </Link>

          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="px-4 py-3 rounded-lg hover:bg-muted text-sm font-semibold flex items-center gap-3 transition-colors">
              <Store className="w-5 h-5" /> Mi Negocio
            </Link>
            <Link href="/dashboard/products/new" className="px-4 py-3 rounded-lg hover:bg-muted text-sm font-semibold flex items-center gap-3 transition-colors">
              <PackageOpen className="w-5 h-5" /> Agregar Producto
            </Link>
            <Link href="#" className="px-4 py-3 rounded-lg hover:bg-muted text-sm font-semibold flex items-center gap-3 transition-colors">
              <Settings className="w-5 h-5" /> Configuración
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-border flex items-center gap-3 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors">
          <UserCircle className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold cursor-pointer">Dueño</span>
            <span className="text-xs text-muted-foreground">Salir <LogOut className="w-3 h-3 inline ml-1" /></span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {/* Mobile Header Sub-nav */}

        <div className="p-6 md:p-10 container max-w-5xl mx-auto h-full overflow-y-auto animate-fade-in relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
