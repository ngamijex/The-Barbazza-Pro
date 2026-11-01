export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Role = "admin" | "manager" | "supervisor" | "barber" | "cleaner";

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

type CacheEntry = { expires: number; data: unknown };
const getCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function cacheKey(path: string, token: string) {
  return `${token}:${path}`;
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.includes(prefix)) getCache.delete(key);
  }
}

/** Fast GET with short cache + request dedupe; mutations clear related cache */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const token = typeof window !== "undefined" ? localStorage.getItem("barbazza_token") || "" : "";
  const key = cacheKey(path, token);

  if (method === "GET") {
    const hit = getCache.get(key);
    if (hit && Date.now() < hit.expires) {
      return hit.data as T;
    }
    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutMs = method === "GET" ? 20_000 : 25_000;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  const request = (async () => {
    try {
      const response = await fetch(`${API}${path}`, {
        ...init,
        signal: init.signal || controller?.signal,
        cache: method === "GET" ? "no-store" : init.cache,
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers || {}),
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { error?: string }).error || "Request failed");
      }

      if (method === "GET") {
        // Cache reads a bit longer so tab switches / revisits feel instant
        getCache.set(key, { data, expires: Date.now() + 25_000 });
      } else {
        clearApiCache();
      }
      return data as T;
    } finally {
      if (timer) clearTimeout(timer);
    }
  })();

  if (method === "GET") {
    inflight.set(key, request);
    try {
      return (await request) as T;
    } finally {
      inflight.delete(key);
    }
  }

  return request;
}

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barbazza_user");
    const token = localStorage.getItem("barbazza_token");
    if (!raw || !token) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
