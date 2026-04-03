import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CDN = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? "";

export function getImageUrl(s3Key: string | undefined | null, size: "sm" | "md" | "lg" = "md"): string {
  if (!s3Key) return "/placeholder.jpg";
  const key = s3Key.replace("processed/md/", `processed/${size}/`);
  if (!CDN) return `/placeholder.jpg`; // fallback si CDN no esta configurado
  const baseUrl = CDN.startsWith("http") ? CDN : `https://${CDN}`;
  return `${baseUrl}/${key}`;
}

export function getBusinessImageUrl(url: string, size: "sm" | "md" | "lg" = "md"): string {
  console.log(url);
  if (!url) return "/placeholder.jpg";
  const key = url.replace("processed/md/", `processed/${size}/`);
  if (!CDN) return `/placeholder.jpg`; // fallback si CDN no esta configurado
  const baseUrl = CDN.startsWith("http") ? CDN : `https://${CDN}`;
  return `${baseUrl}/${key}`;
}

