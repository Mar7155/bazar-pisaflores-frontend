import { notFound } from "next/navigation";
import { getBusinessById, getCategories } from "@/lib/api";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

export default async function BusinessSettingsPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;

   // Fetch data on the server - no CORS issues here
   const business = await getBusinessById(id);
   const categories = await getCategories();

   if (!business) {
      notFound();
   }

   return <BusinessSettingsForm business={business} categories={categories} id={id} />;
}
