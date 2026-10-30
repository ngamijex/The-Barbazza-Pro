import { API } from "@/lib/api";

export async function publicApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}/api/public${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }
  return data as T;
}

export function money(value: number) {
  return `RWF ${Math.round(value || 0).toLocaleString()}`;
}

export type PublicBarber = {
  id: number;
  code: string;
  name: string;
  slogan: string;
  bio: string;
  specialty: string;
  actions: string[];
  avatarUrl: string;
  coverUrl: string;
  clients90d: number;
  rating: number | null;
  reviews: number;
};

export type BarberProfile = {
  id: number;
  code: string;
  name: string;
  phone: string;
  whatsappUrl: string;
  slogan: string;
  bio: string;
  actions: string[];
  avatarUrl: string;
  coverUrl: string;
  clients90d: number;
  daysActive: number;
  rating: number | null;
  reviews: number;
  ratings: { id: number; name: string; score: number; comment: string; date: string }[];
  services: { id: number; name: string; price: number }[];
  activity: { date: string; cuts: number }[];
  portfolio: { id: number; imageUrl: string; caption: string }[];
};

export function mediaSrc(url: string) {
  if (!url) return "/public-art/hero-shop.jpg";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return url;
}
