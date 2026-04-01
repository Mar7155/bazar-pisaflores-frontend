import { getOwnerBusinesses } from "@/lib/api";
import { getAuthSession } from "@/actions/auth";
import { BecomeOwnerCTA } from "@/components/become-owner-cta";
import { getQueryClient } from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DashboardClientContent } from "@/components/dashboard-client-content";

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : null;
  const { role } = await getAuthSession();
  
  if (role === 'visitor') {
    return <BecomeOwnerCTA />;
  }

  const queryClient = getQueryClient();

  // Prefetch to populate the cache on the server
  await queryClient.prefetchQuery({
    queryKey: ["my-business-list"],
    queryFn: getOwnerBusinesses,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClientContent status={status} />
    </HydrationBoundary>
  );
}
