import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, getBusinesses, getFlashOffers, getBusinessById, getOwnerBusinesses } from "@/lib/api";
import { Business } from "@/types";

/**
 * useCategories — Hook para obtener categorías con caché persistente.
 * Las categorías raramente cambian, por lo que las mantenemos en memoria indefinidamente.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: Infinity, // Nunca expira automáticamente
    refetchOnWindowFocus: false, // No refrescar al cambiar de pestaña
  });
}

/**
 * useBusinesses — Hook para obtener negocios con filtros y caché de 5 minutos.
 */
export function useBusinesses(filters?: { category_id?: string; query?: string }) {
  return useQuery({
    queryKey: ["businesses", filters?.category_id, filters?.query],
    queryFn: () => getBusinesses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos de validez
  });
}

/**
 * useMyBusinesses — Hook para obtener negocios del usuario autenticado.
 */
export function useMyBusinesses() {
  return useQuery({
    queryKey: ["my-business-list"],
    queryFn: () => getOwnerBusinesses(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useBusiness — Hook para obtener un negocio específico por ID.
 * Optimizado para usar datos iniciales de la lista de negocios del usuario si existen.
 */
export function useBusiness(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id,
    initialData: () => {
      // Intentar encontrar el negocio en la lista global del usuario
      const myBusinesses = queryClient.getQueryData<Business[]>(["my-business-list"]);
      return myBusinesses?.find((b) => b.id === id);
    },
    initialDataUpdatedAt: () => {
       // Si se encontró en la lista, usamos el timestamp de esa lista
       return queryClient.getQueryState(["my-business-list"])?.dataUpdatedAt;
    }
  });
}

/**
 * useFlashOffers — Hook para obtener ofertas relámpago con caché de 1 minuto.
 * Alta vivacidad para asegurar que el usuario vea ofertas actuales.
 */
export function useFlashOffers(categoryId?: string) {
  return useQuery({
    queryKey: ["flash-offers", categoryId],
    queryFn: () => getFlashOffers(categoryId),
    staleTime: 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true, // Siempre refrescar si vuelve a la pestaña
  });
}
