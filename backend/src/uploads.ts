import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/** Accept data URL or raw base64; return public path `/uploads/...`. */
export function saveImageDataUrl(dataUrl: string, prefix = "img"): string {
  ensureUploadDir();
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
  if (!match) {
    throw new Error("Image must be a PNG, JPG, or WebP data URL");
  }
  const ext = match[2].toLowerCase() === "jpeg" ? "jpg" : match[2].toLowerCase();
  const buffer = Buffer.from(match[3], "base64");
  if (buffer.length > 4.5 * 1024 * 1024) {
    throw new Error("Image must be under 4.5MB");
  }
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

export function mediaUrl(reqHost: string, stored: string | null | undefined, fallback: string) {
  if (!stored) return fallback;
  if (stored.startsWith("http://") || stored.startsWith("https://")) return stored;
  if (stored.startsWith("/public-art/") || stored.startsWith("/logo")) return stored;
  if (stored.startsWith("/uploads/")) {
    const base = process.env.PUBLIC_API_URL || `http://${reqHost}`;
    return `${base.replace(/\/$/, "")}${stored}`;
  }
  return stored;
}

export { UPLOAD_DIR };
