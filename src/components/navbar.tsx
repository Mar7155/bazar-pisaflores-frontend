"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Store, Moon, Sun, Search, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { appToast } from "@/lib/toast";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Re-read auth state whenever the route changes (covers login/logout redirects)
  // NOTE: auth_token is httpOnly (not readable by JS). user_role is readable and
  // is set/deleted together with auth_token by server actions.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-read auth state whenever the route changes (covers login/logout redirects)
  useEffect(() => {
    const role = getCookieValue("user_role");
    const loggedIn = role !== null;
    setIsAuth(loggedIn);
    setIsOwner(loggedIn && (role === "owner" || role === "admin"));
  }, [pathname]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    appToast.logout();
    await logoutAction();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-primary font-bold text-xl drop-shadow-sm transition-transform hover:scale-105 z-50">
          <Store className="w-6 h-6 text-accent" />
          <span>Bazar<span className="text-foreground">Pisaflores</span></span>
        </Link>

        {/* Desktop Links & Actions */}
        <div className="hidden md:flex items-center gap-6">
          <form action="/search" className="relative group">
            <input
              type="text"
              name="q"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-64 rounded-full bg-muted/50 border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-sm"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link href="/businesses" className="text-sm font-medium hover:text-primary transition-colors">
            Negocios
          </Link>
          <Link href="/flash-offers" className="text-sm font-medium hover:text-primary transition-colors">
            Ofertas
          </Link>
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            {mounted && isAuth ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    {isOwner
                      ? <><LayoutDashboard className="w-4 h-4 mr-2" /> Panel</>
                      : <><User className="w-4 h-4 mr-2" /> Mi Cuenta</>}
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Salir
                </Button>
              </>
            ) : mounted && !isAuth ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login"><User className="w-4 h-4 mr-2" /> Iniciar Sesión</Link>
                </Button>
                <Button size="sm" asChild className="shadow-sm">
                  <Link href="/auth/register">Regístrate</Link>
                </Button>
              </>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className="rounded-full"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-secondary-foreground" />
            ) : (
              <span className="w-5 h-5" /> // Placeholder to avoid layout shift
            )}
          </Button>

        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className="rounded-full"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-secondary-foreground" />
            ) : (
              <span className="w-5 h-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Abrir menú" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2 p-4 flex flex-col gap-4 animate-slide-up">
          <form action="/search" className="relative w-full" onSubmit={() => setIsMenuOpen(false)}>
            <input
              type="text"
              name="q"
              placeholder="Buscar comercios..."
              className="pl-10 pr-4 py-3 w-full rounded-full bg-muted/50 border border-border focus:border-primary outline-none transition-all text-base"
            />
            <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          </form>
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-semibold text-lg">
              Inicio
            </Link>
            <Link href="/businesses" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-semibold text-lg">
              Negocios locales
            </Link>
            <Link href="/flash-offers" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-semibold text-lg text-accent">
              Ofertas Relámpago
            </Link>
            <div className="flex flex-col gap-2 mt-2 border-t border-border pt-4">
              {mounted && (isAuth ? (
                <>
                  <Button onClick={() => setIsMenuOpen(false)} size="lg" className="w-full justify-start font-bold" asChild>
                    <Link href="/dashboard">
                      {isOwner
                        ? <><LayoutDashboard className="mr-2" /> Panel de Control</>
                        : <><User className="mr-2" /> Mi Cuenta</>}
                    </Link>
                  </Button>
                  <Button onClick={handleLogout} variant="destructive" size="lg" className="w-full justify-start font-bold">
                    <LogOut className="mr-2" /> Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsMenuOpen(false)} variant="outline" size="lg" className="w-full justify-start font-bold" asChild>
                    <Link href="/auth/login"><User className="mr-2" /> Iniciar Sesión</Link>
                  </Button>
                  <Button onClick={() => setIsMenuOpen(false)} size="lg" className="w-full justify-start font-bold" asChild>
                    <Link href="/auth/register">Regístrate gratis</Link>
                  </Button>
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

