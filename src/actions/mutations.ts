"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBusiness,
  updateBusiness,
  updateBusinessSchedules,
  createBusinessProduct,
  updateBusinessProduct,
  deleteBusinessProduct,
  createFlashOffer,
  deleteFlashOffer,
  deleteImage,
  setCoverImage,
  getPresignedUrl,
  confirmUpload,
  deleteBusiness,
  pauseBusiness,
  activeBusiness,
} from "@/lib/api";
import {
  BusinessRegistrationFormValues,
  ProductRegistrationFormValues,
  FlashOfferRegistrationFormValues,
  SchedulesFormValues,
} from "@/lib/validations";

// -------------------------------------------------------
// UPLOAD ACTIONS
// -------------------------------------------------------
export async function getPresignedUrlAction(
  entityType: 'business' | 'product',
  entityId: string,
  mimeType: string
): Promise<{ url?: string; key?: string; error?: string }> {
  try {
    const res = await getPresignedUrl(entityType, entityId, mimeType);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al obtener URL de subida.";
    return { error: msg };
  }
}

export async function confirmUploadAction(
  businessId: string,
  productId: string | undefined,
  entityType: 'business' | 'product',
  s3Key: string,
  isCover: boolean = false
): Promise<{ error?: string }> {
  try {
    await confirmUpload(entityType, productId || businessId, s3Key, isCover);

    // Revalidar las rutas correspondientes
    if (entityType === 'product' && productId) {
      revalidatePath(`/dashboard/businesses/${businessId}/products/${productId}`);
    } else {
      revalidatePath(`/dashboard/businesses/${businessId}/settings`);
    }
    revalidatePath(`/businesses/${businessId}`);

    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al confirmar la subida.";
    return { error: msg };
  }
}

// -------------------------------------------------------
// BUSINESSES
// -------------------------------------------------------
export async function createBusinessAction(
  data: BusinessRegistrationFormValues
): Promise<{ error?: string }> {
  try {
    await createBusiness(data);
    revalidatePath("/dashboard");
    revalidatePath("/businesses");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear el negocio.";
    return { error: msg };
  }
  redirect("/dashboard?status=created");
}

export async function updateBusinessAction(
  id: string,
  data: BusinessRegistrationFormValues
): Promise<{ error?: string }> {
  try {
    await updateBusiness(id, data);
    revalidatePath(`/dashboard/businesses/${id}`);
    revalidatePath(`/businesses/${id}`);
    revalidatePath("/dashboard");
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar el negocio.";
    return { error: msg };
  }
}

export async function updateSchedulesAction(
  businessId: string,
  data: SchedulesFormValues
): Promise<{ error?: string }> {
  try {
    await updateBusinessSchedules(businessId, data.schedules as any);
    revalidatePath(`/dashboard/businesses/${businessId}/settings`);
    revalidatePath(`/businesses/${businessId}`);
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar los horarios.";
    return { error: msg };
  }
}

export async function pauseBusinessAction(
  bussinesId: string
): Promise<{ error?: string }> {
  try {
    await pauseBusiness(bussinesId);
    revalidatePath(`/dashboard/businesses/${bussinesId}`);
    revalidatePath(`/businesses/${bussinesId}`);
    revalidatePath("/dashboard");
    revalidatePath("/businesses");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al pausar el negocio.";
    return { error: msg };
  }
  redirect("/dashboard?status=paused");
}

export async function activeBusinessAction(
  bussinesId: string
): Promise<{ error?: string }> {
  try {
    await activeBusiness(bussinesId);
    revalidatePath(`/dashboard/businesses/${bussinesId}`);
    revalidatePath(`/businesses/${bussinesId}`);
    revalidatePath("/dashboard");
    revalidatePath("/businesses");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al activar el negocio.";
    return { error: msg };
  }
  redirect("/dashboard?status=active");
}

export async function deleteBusinessAction(
  bussinesId: string
): Promise<{ error?: string }> {
  try {
    await deleteBusiness(bussinesId);
    revalidatePath("/dashboard");
    revalidatePath("/businesses");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar el negocio.";
    return { error: msg };
  }
  redirect("/dashboard?status=deleted");
}

// -------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------
export async function createProductAction(
  businessId: string,
  data: ProductRegistrationFormValues
): Promise<{ error?: string }> {
  try {
    await createBusinessProduct(businessId, data);
    revalidatePath(`/dashboard/businesses/${businessId}`);
    revalidatePath(`/dashboard/businesses/${businessId}/products`);
    revalidatePath(`/businesses/${businessId}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear el producto.";
    return { error: msg };
  }
  redirect(`/dashboard/businesses/${businessId}?status=product_added`);
}

export async function updateProductAction(
  businessId: string,
  productId: string,
  data: ProductRegistrationFormValues
): Promise<{ error?: string }> {
  try {
    await updateBusinessProduct(businessId, productId, data);
    revalidatePath(`/dashboard/businesses/${businessId}/products/${productId}`);
    revalidatePath(`/dashboard/businesses/${businessId}/products`);
    revalidatePath(`/businesses/${businessId}`);
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar el producto.";
    return { error: msg };
  }
}

export async function deleteProductAction(
  businessId: string,
  productId: string
): Promise<{ error?: string }> {
  try {
    await deleteBusinessProduct(businessId, productId);
    revalidatePath(`/dashboard/businesses/${businessId}/products`);
    revalidatePath(`/dashboard/businesses/${businessId}`);
    revalidatePath(`/businesses/${businessId}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar el producto.";
    return { error: msg };
  }
  redirect(`/dashboard/businesses/${businessId}?status=product_deleted`);
}

// -------------------------------------------------------
// MEDIA / UPLOADS
// -------------------------------------------------------
export async function deleteImageAction(
  businessId: string,
  productId: string | undefined, // undefined if it's for the business itself
  imageId: string,
  entityType: 'business' | 'product'
): Promise<{ error?: string }> {
  try {
    await deleteImage(imageId, entityType);
    if (entityType === 'product' && productId) {
      revalidatePath(`/dashboard/businesses/${businessId}/products/${productId}`);
    } else {
      revalidatePath(`/dashboard/businesses/${businessId}/settings`);
    }
    revalidatePath(`/businesses/${businessId}`);
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar la imagen.";
    return { error: msg };
  }
}

export async function setCoverImageAction(
  businessId: string,
  productId: string | undefined,
  imageId: string,
  entityType: 'business' | 'product'
): Promise<{ error?: string }> {
  try {
    await setCoverImage(imageId, entityType);
    if (entityType === 'product' && productId) {
      revalidatePath(`/dashboard/businesses/${businessId}/products/${productId}`);
    } else {
      revalidatePath(`/dashboard/businesses/${businessId}/settings`);
    }
    revalidatePath(`/businesses/${businessId}`);
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al establecer la portada.";
    return { error: msg };
  }
}

// -------------------------------------------------------
// FLASH OFFERS
// -------------------------------------------------------
export async function createFlashOfferAction(
  businessId: string,
  data: FlashOfferRegistrationFormValues
): Promise<{ error?: string }> {
  try {
    await createFlashOffer(businessId, data);
    revalidatePath(`/dashboard/businesses/${businessId}/offers`);
    revalidatePath(`/businesses/${businessId}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear la oferta.";
    return { error: msg };
  }
  redirect(`/dashboard/businesses/${businessId}/offers?status=offer_created`);
}

export async function deleteFlashOfferAction(
  businessId: string,
  offerId: string
): Promise<{ error?: string }> {
  try {
    await deleteFlashOffer(businessId, offerId);
    revalidatePath(`/dashboard/businesses/${businessId}/offers`);
    revalidatePath(`/businesses/${businessId}`);
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar la oferta.";
    return { error: msg };
  }
}
