"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/get-query-client";

/**
 * QueryProvider — Configura el cliente de TanStack Query para toda la aplicación.
 * En el cliente, mantiene un singleton. En el servidor, crea uno por usuario.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // getQueryClient ya maneja el singleton en el cliente
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
