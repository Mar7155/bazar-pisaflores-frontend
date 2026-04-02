export type Role = 'admin' | 'owner' | 'visitor';
export type ImageSize = 'sm' | 'md' | 'lg';

export interface User {
  id: string; // UUID
  cognito_sub?: string; // Optional for backward compatibility or when not present in basic user object
  email: string;
  emailVerified: boolean;
  role: Role;
  createdAt: string; // ISO date string
}

export interface Category {
  id: string; // UUID
  name: string;
  created_by?: string | null;
  created_at: string;
}

export interface Business {
  id: string; // UUID
  owner_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  maps_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Custom frontend relationships (useful for nesting)
  category?: Category | null;
  images?: BusinessImage[];
  schedules?: Schedule[];
  products?: Product[];
  flash_offers?: FlashOffer[];
}

export interface Image {
  id: string;
  s3_key: string;
  size: ImageSize;
  is_cover: boolean;
  created_at: string;
}

export interface BusinessImage extends Image {
  business_id: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;

  images?: ProductImage[];
}

export interface ProductImage extends Image {
  product_id: string;
}

export interface Schedule {
  id: string;
  business_id: string;
  day_of_week: number; // 0-6 (0=Dom, 6=Sab)
  opens_at: string; // Time string like "09:00:00"
  closes_at: string;
  is_closed: boolean;
}

export interface FlashOffer {
  id: string;
  business_id: string;
  title: string;
  description?: string | null;
  discount_pct?: number | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;

  business?: Business;
}
