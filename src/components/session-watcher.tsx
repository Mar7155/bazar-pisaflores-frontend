"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

function SessionWatcherContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const expired = searchParams.get("expired");
    if (expired === "1") {
      toast.error("Tu sesión ha expirado", {
        description: "Inicia sesión nuevamente para continuar gestionando tu negocio.",
        duration: 10000,
      });

      // Clear the query param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("expired");
      const newUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(newUrl);
    }
  }, [searchParams, router, pathname]);

  return null;
}

/**
 * Global component that watches for session-related URL parameters
 * and displays feedback to the user.
 */
export function SessionWatcher() {
  return (
    <Suspense fallback={null}>
      <SessionWatcherContent />
    </Suspense>
  );
}
