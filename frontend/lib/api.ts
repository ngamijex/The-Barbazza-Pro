export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Role = "admin" | "manager" | "supervisor" | "barber";

export type SessionUser = {
  userId: number;
  username: string;
  fullName: string;
  role: Role;
  barberId: number | null;
};

export function money(value: number) {
  return `RWF ${Math.round(value || 0).toLocaleString()}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("barbazza_token") : "";
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}
