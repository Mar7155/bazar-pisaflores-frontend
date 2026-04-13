import { Store } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getBusinesses, getCategories } from "@/lib/api";
import { BusinessCard } from "@/components/business-card";
import { getQueryClient } from "@/lib/get-query-client";
import { PaginationBar } from "@/components/pagination-bar";
import { CategoryFilter, SearchBar } from "@/components/search-filters";

const ITEMS_PER_PAGE = 12;

export const metadata = {
  title: "Directorio de Negocios | Bazar Pisaflores",
  description: "Explora todos los negocios locales en Pisaflores.",
};

function buildPageUrl(currentCategory: string, query: string, page: number): string {
  const params = new URLSearchParams();
  if (currentCategory !== "all") params.set("category", currentCategory);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/businesses${qs ? `?${qs}` : ""}`;
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const currentCategory = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const currentPage = typeof resolvedParams.page === 'string' ? Math.max(1, parseInt(resolvedParams.page, 10) || 1) : 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: getCategories }),
    queryClient.prefetchQuery({
      queryKey: ["businesses", currentCategory, query, currentPage],
      queryFn: () => getBusinesses({ category_id: currentCategory, query, limit: ITEMS_PER_PAGE, offset })
    }),
  ]);

  const [categories, businessesResponse] = await Promise.all([
    getCategories(),
    getBusinesses({ category_id: currentCategory, query, limit: ITEMS_PER_PAGE, offset })
  ]);

  const businesses = businessesResponse.data;
  const totalPages = Math.max(1, Math.ceil(businessesResponse.total / ITEMS_PER_PAGE));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8 flex-1 animate-slide-up opacity-0">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-primary" />
                Todos los Negocios
              </h1>
              <p className="text-muted-foreground text-lg">
                Descubre y apoya el comercio local de Pisaflores.
              </p>
            </div>

            <SearchBar
              action="/businesses"
              defaultValue={query}
              placeholder="Buscar negocio..."
              hiddenFields={currentCategory !== "all" ? { category: currentCategory } : undefined}
            />
          </div>

          <CategoryFilter
            categories={categories}
            currentCategory={currentCategory}
            basePath="/businesses"
            query={query}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No hay negocios en esta categoría por el momento.
          </div>
        )}

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          buildUrl={(page) => buildPageUrl(currentCategory, query, page)}
        />
      </div>
    </HydrationBoundary>
  );
}
