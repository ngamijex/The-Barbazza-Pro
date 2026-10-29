import { Pool, QueryResultRow } from "pg";

/** Tuned for Neon serverless + many short API requests */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  min: 1,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 8_000,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error:", err.message);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function isoDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/** Tiny in-memory TTL cache for hot read endpoints */
type CacheEntry = { expires: number; value: unknown };
const cacheStore = new Map<string, CacheEntry>();

export function cacheGet<T>(key: string): T | null {
  const hit = cacheStore.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cacheStore.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs = 15_000) {
  cacheStore.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheDel(prefix?: string) {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) cacheStore.delete(key);
  }
}
