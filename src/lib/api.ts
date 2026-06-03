/**
 * API Facade — Bazar Pisaflores
 *
 * Toggle: NEXT_PUBLIC_USE_MOCK=true  → datos en memoria (desarrollo sin backend)
 *         NEXT_PUBLIC_USE_MOCK=false → API real en AWS Lambda / API Gateway
 *
 * La API backend devuelve una mezcla de camelCase (campos de relaciones) y snake_case
 * (columnas de DB directamente). Los normalizers de esta capa convierten todo
 * al formato snake_case que usan los tipos del frontend.
 */

import { Business, Category, Product, FlashOffer, Schedule, BusinessImage, ProductImage } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED RESPONSE TYPE
// ─────────────────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Tipo extendido que devuelve GET /products/all (incluye contexto del negocio)
export interface GlobalProduct extends Product {
  business_id: string;
  business_name: string;
  cover_image: string | null;
}
import {
  ProductRegistrationFormValues,
  BusinessRegistrationFormValues,
  FlashOfferRegistrationFormValues,
} from "./validations";

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
// API_URL includes the stage path: /prod
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS (Portable - works in Browser and Node)
// ─────────────────────────────────────────────────────────────────────────────

/** Decodes JWT payload using atob (portable) */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    // atob is available in Edge, Node 16+, and modern browsers
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/** Checks if a JWT is expired (or close to it) */
export function isTokenExpired(token: string | undefined): boolean {
  if (!token || token === "mock-jwt-token") return false;
  const payload = decodeJwtPayload(token);
  if (!payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= (payload.exp as number) - 10; // 10s buffer
}

/** Clears auth cookies on the client side */
export function clearAuthSession() {
  if (typeof document !== "undefined") {
    // Setting max-age=0 deletes the cookie
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "user_data=; path=/; max-age=0; SameSite=Lax";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK STATE — In-Memory Database
// ─────────────────────────────────────────────────────────────────────────────
let categoriesMock: Category[] = [
  { id: "cat-1", name: "Comida Rápida", created_at: new Date().toISOString() },
  { id: "cat-2", name: "Abarrotes", created_at: new Date().toISOString() },
  { id: "cat-3", name: "Farmacias", created_at: new Date().toISOString() },
  { id: "cat-4", name: "Servicios", created_at: new Date().toISOString() },
  { id: "cat-5", name: "Ropa y Calzado", created_at: new Date().toISOString() },
  { id: "cat-other", name: "Otro", created_at: new Date().toISOString() },
];

let schedulesMock: Schedule[] = [
  { id: "sch-1", business_id: "biz-1", day_of_week: 1, opens_at: "08:00", closes_at: "22:00", is_closed: false },
  { id: "sch-2", business_id: "biz-1", day_of_week: 2, opens_at: "08:00", closes_at: "22:00", is_closed: false },
  { id: "sch-3", business_id: "biz-1", day_of_week: 3, opens_at: "08:00", closes_at: "22:00", is_closed: false },
  { id: "sch-4", business_id: "biz-1", day_of_week: 4, opens_at: "08:00", closes_at: "22:00", is_closed: false },
  { id: "sch-5", business_id: "biz-1", day_of_week: 5, opens_at: "08:00", closes_at: "18:00", is_closed: false },
  { id: "sch-6", business_id: "biz-1", day_of_week: 6, opens_at: "09:00", closes_at: "14:00", is_closed: false },
  { id: "sch-7", business_id: "biz-1", day_of_week: 0, opens_at: "00:00", closes_at: "00:00", is_closed: true },
];

let productsMock: Product[] = [
  { id: "prod-1", business_id: "biz-1", name: "Pizza Hawaiana GDE", description: "Base artesanal, queso doble, jamón y piña.", price: 180, is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-2", business_id: "biz-1", name: "Pizza Pepperoni Extra", description: "La clásica con el doble de pepperoni.", price: 195, is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-3", business_id: "biz-1", name: "Pizza Margarita", description: "Tomate fresco, albahaca y queso mozzarella.", price: 155, is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-4", business_id: "biz-2", name: "Paracetamol 500mg", description: "Caja de 20 tabletas.", price: 28, is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let flashOffersMock: FlashOffer[] = [
  { id: "offer-1", business_id: "biz-1", title: "Pizza Familiar 2x1", description: "Dos pizzas grandes al precio de una. ¡Solo hoy!", discount_pct: 50, starts_at: new Date().toISOString(), expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), is_active: true, created_at: new Date().toISOString(), business: { id: "biz-1", name: "Pizzería Don Juan", owner_id: "user-1", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
  { id: "offer-2", business_id: "biz-2", title: "Consulta médica gratis", description: "Primera consulta sin costo con medicamento.", discount_pct: 100, starts_at: new Date().toISOString(), expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), is_active: true, created_at: new Date().toISOString(), business: { id: "biz-2", name: "Farmacia Similares", owner_id: "user-2", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
];

let businessesMock: Business[] = [
  { id: "biz-1", owner_id: "user-1", category_id: "cat-1", name: "Pizzería Don Juan", description: "Las mejores pizzas a la leña de Pisaflores. Ingredientes frescos y entrega a domicilio.", phone: "5512345678", address: "Calle Hidalgo #12, Centro", latitude: 21.2033, longitude: -98.989, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: categoriesMock[0], schedules: schedulesMock.filter(s => s.business_id === "biz-1"), products: productsMock.filter(p => p.business_id === "biz-1"), flash_offers: flashOffersMock.filter(o => o.business_id === "biz-1") },
  { id: "biz-2", owner_id: "user-2", category_id: "cat-3", name: "Farmacia Similares Pisaflores", description: "Lo mismo pero más barato. Consultorio médico anexo.", phone: "5598765432", address: "Plaza Principal S/N", latitude: 21.204, longitude: -98.988, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: categoriesMock[2], products: productsMock.filter(p => p.business_id === "biz-2"), flash_offers: [] },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZERS — Convert API responses (mixed camelCase) → Frontend types (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSchedule(raw: any): Schedule {
  return {
    id: raw.id,
    business_id: raw.businessId ?? raw.business_id,
    day_of_week: raw.dayOfWeek ?? raw.day_of_week,
    opens_at: raw.opensAt ?? raw.opens_at,
    closes_at: raw.closesAt ?? raw.closes_at,
    is_closed: raw.isClosed ?? raw.is_closed ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    created_by: raw.createdBy ?? raw.created_by ?? null,
    created_at: raw.createdAt ?? raw.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBusinessImage(raw: any): BusinessImage {
  return {
    id: raw.id,
    business_id: raw.businessId ?? raw.business_id,
    s3_key: raw.s3Key ?? raw.s3_key,
    size: raw.size,
    is_cover: raw.isCover ?? raw.is_cover ?? false,
    created_at: raw.createdAt ?? raw.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProductImage(raw: any): ProductImage {
  return {
    id: raw.id,
    product_id: raw.productId ?? raw.product_id,
    s3_key: raw.s3Key ?? raw.s3_key,
    size: raw.size,
    is_cover: raw.isCover ?? raw.is_cover ?? false,
    created_at: raw.createdAt ?? raw.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(raw: any): Product {
  return {
    id: raw.id,
    business_id: raw.businessId ?? raw.business_id,
    name: raw.name,
    description: raw.description ?? null,
    price: raw.price,
    is_available: raw.isAvailable ?? raw.is_available ?? true,
    created_at: raw.createdAt ?? raw.created_at,
    updated_at: raw.updatedAt ?? raw.updated_at,
    images: Array.isArray(raw.images) ? raw.images.map(normalizeProductImage) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlashOffer(raw: any): FlashOffer {
  return {
    id: raw.id,
    business_id: raw.businessId ?? raw.business_id,
    title: raw.title,
    description: raw.description ?? null,
    discount_pct: raw.discountPct ?? raw.discount_pct ?? null,
    starts_at: raw.startsAt ?? raw.starts_at,
    expires_at: raw.expiresAt ?? raw.expires_at,
    is_active: raw.isActive ?? raw.is_active ?? true,
    created_at: raw.createdAt ?? raw.created_at,
    business: raw.business ? normalizeBusiness(raw.business) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBusiness(raw: any): Business {
  return {
    id: raw.id,
    owner_id: raw.ownerId ?? raw.owner_id,
    category_id: raw.categoryId ?? raw.category_id ?? null,
    name: raw.name,
    description: raw.description ?? null,
    phone: raw.phone ?? null,
    address: raw.address ?? null,
    maps_url: raw.mapsUrl ?? raw.maps_url ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    is_active: raw.isActive ?? raw.is_active ?? true,
    created_at: raw.createdAt ?? raw.created_at,
    updated_at: raw.updatedAt ?? raw.updated_at,
    coverImage: raw.coverImage ?? raw.cover_image ?? null,
    // Relationships
    category: raw.category
      ? normalizeCategory(raw.category)
      : raw.categoryName
        ? { id: raw.categoryId ?? raw.category_id ?? "", name: raw.categoryName, created_at: "" }
        : null,
    images: Array.isArray(raw.images) ? raw.images.map(normalizeBusinessImage) : undefined,
    schedules: Array.isArray(raw.schedules) ? raw.schedules.map(normalizeSchedule) : undefined,
    products: Array.isArray(raw.products) ? raw.products.map(normalizeProduct) : undefined,
    flash_offers: Array.isArray(raw.flashOffers)
      ? raw.flashOffers.map(normalizeFlashOffer)
      : Array.isArray(raw.flash_offers)
        ? raw.flash_offers.map(normalizeFlashOffer)
        : undefined,
  };
}

/** Extracts an array whether the backend wraps it in { data: [] } or returns it plain */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractArray<T>(raw: any, key?: string): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    if (key && Array.isArray(raw[key])) return raw[key] as T[];
    if (Array.isArray(raw.data)) return raw.data as T[];
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH ABSTRACTION (server-only when in production mode)
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token: string | undefined;

  try {
    // Server context: next/headers disponible en Server Components y Server Actions
    const { cookies } = await import("next/headers");
    const store = await cookies();
    token = store.get("auth_token")?.value;
  } catch {
    // Client context: leer el cookie auth_token_client (no httpOnly, visible para JS)
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)auth_token_client=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : undefined;
    }
  }

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    if (isTokenExpired(token)) {
      clearAuthSession();
      throw new Error("Su sesión ha expirado. Por favor, vuelva a ingresar.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearAuthSession();
    // Use a custom event or redirect if possible, but throwing is a good start
    throw new Error("401");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status} en ${endpoint}`);
  }
  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC READ FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>("/categories");
      return extractArray<unknown>(raw).map(normalizeCategory);
    } catch { return []; }
  }
  await sleep(80);
  return categoriesMock;
}

export async function getBusinesses(opts?: { category_id?: string; query?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Business>> {
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  if (!USE_MOCK) {
    try {
      const params = new URLSearchParams();
      if (opts?.category_id && opts.category_id !== "all") params.append("categoryId", opts.category_id);
      if (opts?.query) params.append("q", opts.query);
      params.append("limit", String(limit));
      params.append("offset", String(offset));
      const raw = await apiFetch<any>(`/businesses?${params.toString()}`);
      const data = extractArray<unknown>(raw).map(normalizeBusiness);
      const total = typeof raw?.total === "number" ? raw.total : data.length;
      return { data, total, limit, offset };
    } catch { return { data: [], total: 0, limit, offset }; }
  }
  await sleep(100);
  let res = [...businessesMock];
  if (opts?.category_id && opts.category_id !== "all") res = res.filter(b => b.category_id === opts.category_id);
  if (opts?.query) {
    const q = opts.query.toLowerCase();
    res = res.filter(b => b.name.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
  }
  const total = res.length;
  const paginated = res.slice(offset, offset + limit);
  return { data: paginated, total, limit, offset };
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>(`/businesses/${id}`);
      return normalizeBusiness(raw);
    } catch { return null; }
  }
  await sleep(80);
  const b = businessesMock.find(b => b.id === id);
  if (!b) return null;
  return { ...b, products: productsMock.filter(p => p.business_id === id), flash_offers: flashOffersMock.filter(o => o.business_id === id) };
}

export async function getProductsByBusinessId(
  id: string,
  opts?: { limit?: number; offset?: number; q?: string }
): Promise<PaginatedResponse<Product>> {
  const limit  = opts?.limit  ?? 5;
  const offset = opts?.offset ?? 0;

  if (!USE_MOCK) {
    try {
      const params = new URLSearchParams();
      params.append("limit",  String(limit));
      params.append("offset", String(offset));
      if (opts?.q) params.append("q", opts.q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await apiFetch<any>(`/businesses/${id}/products?${params.toString()}`);
      const data  = extractArray<unknown>(raw).map(normalizeProduct);
      const total = typeof raw?.total === "number" ? raw.total : data.length;
      return { data, total, limit, offset };
    } catch { return { data: [], total: 0, limit, offset }; }
  }
  await sleep(80);
  let res = productsMock.filter(p => p.business_id === id);
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    res = res.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  const total = res.length;
  return { data: res.slice(offset, offset + limit), total, limit, offset };
}

export async function getOwnerBusinesses(): Promise<Business[]> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>("/auth/me/businesses");
      return extractArray<unknown>(raw, "data").map(normalizeBusiness);
    } catch { return []; }
  }
  await sleep(80);
  return businessesMock.filter(b => b.owner_id === "user-1");
}

export async function getOwnerBusinessesById(id: string): Promise<Business | null> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>(`/auth/me/businesses/${id}`);
      return normalizeBusiness(raw);
    } catch { return null; }
  }
  await sleep(80);
  return businessesMock.find(b => b.id === id) || null;
}

export async function getBusinessOffers(businessId: string): Promise<FlashOffer[]> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>(`/businesses/${businessId}/flash-offers`);
      return extractArray<unknown>(raw).map(normalizeFlashOffer);
    } catch { return []; }
  }
  await sleep(80);
  return flashOffersMock.filter(o => o.business_id === businessId);
}

export async function getFlashOffers(opts?: { categoryId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<FlashOffer>> {
  const categoryId = opts?.categoryId;
  const limit = opts?.limit ?? 12;
  const offset = opts?.offset ?? 0;

  if (!USE_MOCK) {
    try {
      const params = new URLSearchParams();
      params.append("limit", String(limit));
      params.append("offset", String(offset));
      const raw = await apiFetch<any>(`/flash-offers/active?${params.toString()}`);
      let offers = extractArray<unknown>(raw).map(normalizeFlashOffer);
      // Filter by category client-side if needed (backend doesn't support this param)
      if (categoryId && categoryId !== "all") {
        offers = offers.filter(o => {
          const biz = o.business;
          return biz?.category_id === categoryId;
        });
      }
      const total = typeof raw?.total === "number" ? raw.total : offers.length;
      return { data: offers, total, limit, offset };
    } catch { return { data: [], total: 0, limit, offset }; }
  }
  await sleep(80);
  let res = flashOffersMock.filter(o => o.is_active && new Date(o.expires_at) > new Date());
  if (categoryId && categoryId !== "all") {
    res = res.filter(o => businessesMock.find(b => b.id === o.business_id)?.category_id === categoryId);
  }
  const total = res.length;
  const paginated = res.slice(offset, offset + limit);
  return { data: paginated, total, limit, offset };
}

export async function getProducts(query: string): Promise<Product[]> {
  if (!USE_MOCK) {
    try {
      if (!query || query.length < 2) return [];
      const raw = await apiFetch<{ businesses?: unknown[]; products?: unknown[]; categories?: unknown[] }>(
        `/search?q=${encodeURIComponent(query)}`
      );
      return (raw.products ?? []).map(normalizeProduct);
    } catch { return []; }
  }
  await sleep(80);
  if (!query) return [];
  const q = query.toLowerCase();
  return productsMock.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeGlobalProduct(raw: any): GlobalProduct {
  return {
    ...normalizeProduct(raw),
    business_id:   raw.businessId  ?? raw.business_id,
    business_name: raw.businessName ?? raw.business_name ?? "",
    cover_image:   raw.coverImage   ?? raw.cover_image   ?? null,
  };
}

export async function getGlobalProducts(opts?: {
  q?:          string;
  categoryId?: string;
  seed?:       string;
  limit?:      number;
  offset?:     number;
}): Promise<PaginatedResponse<GlobalProduct>> {
  const limit  = opts?.limit  ?? 20;
  const offset = opts?.offset ?? 0;

  if (!USE_MOCK) {
    try {
      const params = new URLSearchParams();
      if (opts?.q)          params.append("q",          opts.q);
      if (opts?.categoryId && opts.categoryId !== "all")
                            params.append("categoryId", opts.categoryId);
      if (opts?.seed)       params.append("seed",       opts.seed);
      params.append("limit",  String(limit));
      params.append("offset", String(offset));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await apiFetch<any>(`/products/all?${params.toString()}`);
      const data  = extractArray<unknown>(raw).map(normalizeGlobalProduct);
      const total = typeof raw?.total === "number" ? raw.total : data.length;
      return { data, total, limit, offset };
    } catch { return { data: [], total: 0, limit, offset }; }
  }

  // Mock: enriquecer productsMock con businessName
  await sleep(100);
  let res = productsMock.map(p => ({
    ...p,
    business_id:   p.business_id,
    business_name: businessesMock.find(b => b.id === p.business_id)?.name ?? "Negocio",
    cover_image:   null,
  })) as GlobalProduct[];
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    res = res.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  const total = res.length;
  return { data: res.slice(offset, offset + limit), total, limit, offset };
}

export async function uploadImage(
  entityType: "business" | "product",
  entityId: string,
  file: File,
  isCover: boolean = false
): Promise<{ id: string; s3Key: string; size: string; isCover: boolean }> {
  const { url, key } = await getPresignedUrl(entityType, entityId, file.type);
  await uploadFileToS3(url, file);
  return apiFetch("/upload/confirm", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId, s3Key: key, isCover }),
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  // Este endpoint no existe en el backend — usar getBusinessProductById en su lugar
  if (!USE_MOCK) return null;
  await sleep(80);
  return productsMock.find(p => p.id === id) || null;
}

export async function getBusinessProducts(businessId: string): Promise<Product[]> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>(`/businesses/${businessId}/products`);
      return extractArray<unknown>(raw).map(normalizeProduct);
    } catch { return []; }
  }
  await sleep(80);
  return productsMock.filter(p => p.business_id === businessId);
}

export async function getBusinessProductById(businessId: string, productId: string): Promise<Product | null> {
  if (!USE_MOCK) {
    try {
      const raw = await apiFetch<unknown>(`/businesses/${businessId}/products/${productId}`);
      return normalizeProduct(raw);
    } catch { return null; }
  }
  await sleep(80);
  return productsMock.find(p => p.id === productId) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGES & UPLOADS
// ─────────────────────────────────────────────────────────────────────────────

export async function getPresignedUrl(entityType: 'business' | 'product', entityId: string, mimeType: string): Promise<{ url: string; key: string }> {
  if (USE_MOCK) return { url: "https://mock-s3-url.com", key: `mock-${entityId}-${Date.now()}.jpg` };

  return apiFetch<{ url: string; key: string }>("/upload/presigned-url", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId, mimeType }),
  });
}

export async function uploadFileToS3(url: string, file: File): Promise<void> {
  if (USE_MOCK) {
    console.log("Mock upload to S3:", url, file.name);
    await sleep(800);
    return;
  }

  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) throw new Error("Error al subir el archivo a S3.");
}

export async function confirmUpload(entityType: 'business' | 'product', entityId: string, s3Key: string, isCover: boolean = false): Promise<void> {
  if (USE_MOCK) return;

  await apiFetch("/upload/confirm", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId, s3Key, isCover }),
  });
}

export async function deleteImage(imageId: string, entityType: 'business' | 'product'): Promise<void> {
  if (USE_MOCK) return;

  await apiFetch(`/upload/images/${imageId}?entityType=${entityType}`, {
    method: "DELETE",
  });
}

export async function setCoverImage(imageId: string, entityType: 'business' | 'product'): Promise<void> {
  if (USE_MOCK) return;

  await apiFetch(`/upload/images/${imageId}/cover?entityType=${entityType}`, {
    method: "PATCH",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createBusiness(data: BusinessRegistrationFormValues): Promise<Business> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>("/businesses", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        phone: data.phone,
        address: data.address,
        mapsUrl: data.google_maps_url || undefined,
        categoryId: data.category_id || undefined,
      }),
    });
    return normalizeBusiness(raw);
  }
  await sleep(400);
  const baseCategory = categoriesMock.find(c => c.id === data.category_id) ?? categoriesMock[0];
  const newBiz: Business = {
    id: crypto.randomUUID(), owner_id: "user-1",
    name: data.name, description: data.description || "",
    category_id: data.category_id, phone: data.phone || "",
    address: data.address || "", latitude: 21.2, longitude: -98.98,
    is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    category: baseCategory, products: [], flash_offers: [],
  };
  businessesMock.push(newBiz);
  return newBiz;
}

export async function updateBusiness(id: string, data: BusinessRegistrationFormValues): Promise<Business> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>(`/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        phone: data.phone,
        address: data.address,
        mapsUrl: data.google_maps_url || undefined,
        categoryId: data.category_id || undefined,
      }),
    });
    return normalizeBusiness(raw);
  }
  await sleep(400);
  const index = businessesMock.findIndex(b => b.id === id);
  if (index === -1) throw new Error("Negocio no encontrado");

  const updated = {
    ...businessesMock[index],
    name: data.name,
    description: data.description || "",
    category_id: data.category_id,
    phone: data.phone || "",
    address: data.address || "",
    maps_url: data.google_maps_url || "",
    updated_at: new Date().toISOString(),
  };
  businessesMock[index] = updated;
  return updated;
}

export async function pauseBusiness(businessId: string): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}/pause`, {
      method: "PATCH",
    });
    return;
  }
  await sleep(300);
  businessesMock = businessesMock.filter(b => b.id !== businessId);
}

export async function activeBusiness(businessId: string): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}/restore`, {
      method: "PATCH",
    });
    return;
  }
  await sleep(300);
}

/**
 * Actualiza las coordenadas geográficas de un negocio.
 * Llama a PATCH /businesses/:id/coordinates
 */
export async function updateBusinessCoordinates(
  businessId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}/coordinates`, {
      method: "PATCH",
      body: JSON.stringify({ latitude, longitude }),
    });
    return;
  }
  await sleep(300);
  const idx = businessesMock.findIndex(b => b.id === businessId);
  if (idx !== -1) {
    businessesMock[idx] = { ...businessesMock[idx], latitude, longitude };
  }
}

export async function deleteBusiness(businessId: string): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}`, {
      method: "DELETE",
    });
    return;
  }
  await sleep(300);
  businessesMock = businessesMock.filter(b => b.id !== businessId);
}

export async function updateBusinessSchedules(businessId: string, schedules: Schedule[]): Promise<Schedule[]> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>(`/businesses/${businessId}/schedules`, {
      method: "PUT",
      body: JSON.stringify(
        schedules.map(s => ({
          dayOfWeek: Number(s.day_of_week),
          opensAt: (s.opens_at || "09:00").substring(0, 5),
          closesAt: (s.closes_at || "18:00").substring(0, 5),
          isClosed: !!s.is_closed,
        }))
      ),
    });
    return Array.isArray(raw)
      ? (raw as unknown[]).map(normalizeSchedule)
      : extractArray<unknown>(raw).map(normalizeSchedule);
  }
  await sleep(400);
  // Remove old ones, add new ones (in-memory mock)
  schedulesMock = schedulesMock.filter(s => s.business_id !== businessId);
  const newSchedules = schedules.map(s => ({ ...s, id: `sch-${Math.random()}`, business_id: businessId }));
  schedulesMock.push(...newSchedules);
  return newSchedules;
}

export async function createBusinessProduct(businessId: string, data: ProductRegistrationFormValues): Promise<Product> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>(`/businesses/${businessId}/products`, {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        isAvailable: !!data.is_available,
      }),
    });
    return normalizeProduct(raw);
  }
  await sleep(300);
  const newProd: Product = {
    id: crypto.randomUUID(), business_id: businessId,
    name: data.name, description: data.description || "",
    price: Number(data.price), is_available: !!data.is_available,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  productsMock.push(newProd);
  return newProd;
}

export async function createFlashOffer(businessId: string, data: FlashOfferRegistrationFormValues): Promise<FlashOffer> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>(`/businesses/${businessId}/flash-offers`, {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        description: data.description || undefined,
        discountPct: data.discount_pct ? Number(data.discount_pct) : undefined,
        startsAt: data.starts_at instanceof Date
          ? data.starts_at.toISOString()
          : data.starts_at ? new Date(data.starts_at as string).toISOString() : undefined,
        expiresAt: data.expires_at instanceof Date
          ? data.expires_at.toISOString()
          : new Date(data.expires_at as string).toISOString(),
      }),
    });
    return normalizeFlashOffer(raw);
  }
  await sleep(300);
  const newOffer: FlashOffer = {
    id: crypto.randomUUID(), business_id: businessId,
    title: data.title, description: data.description || "",
    discount_pct: Number(data.discount_pct),
    starts_at: data.starts_at instanceof Date
      ? data.starts_at.toISOString()
      : data.starts_at || new Date().toISOString(),
    expires_at: data.expires_at instanceof Date
      ? data.expires_at.toISOString()
      : (data.expires_at as string),
    is_active: true, created_at: new Date().toISOString(),
    business: businessesMock.find(b => b.id === businessId),
  };
  flashOffersMock.push(newOffer);
  return newOffer;
}

export async function updateBusinessProduct(businessId: string, productId: string, data: ProductRegistrationFormValues): Promise<Product> {
  if (!USE_MOCK) {
    const raw = await apiFetch<unknown>(`/businesses/${businessId}/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        isAvailable: !!data.is_available,
      }),
    });
    return normalizeProduct(raw);
  }
  await sleep(300);
  const index = productsMock.findIndex(p => p.id === productId);
  if (index === -1) throw new Error("Producto no encontrado.");

  const updated = {
    ...productsMock[index],
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    is_available: !!data.is_available,
    updated_at: new Date().toISOString(),
  };
  productsMock[index] = updated;
  return updated;
}

export async function deleteBusinessProduct(businessId: string, productId: string): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}/products/${productId}`, {
      method: "DELETE",
    });
    return;
  }
  await sleep(300);
  productsMock = productsMock.filter(p => p.id !== productId);
}

export async function deleteFlashOffer(businessId: string, offerId: string): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>(`/businesses/${businessId}/flash-offers/${offerId}`, {
      method: "DELETE",
    });
    return;
  }
  await sleep(300);
  flashOffersMock = flashOffersMock.filter(o => o.id !== offerId);
}
