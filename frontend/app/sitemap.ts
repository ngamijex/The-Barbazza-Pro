import type { MetadataRoute } from "next";

const SITE = "https://www.thebarbazza.com";

/** Public pages Google should index (staff/admin routes stay out). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicPaths = ["", "/book", "/team"];

  return publicPaths.map((path) => ({
    url: `${SITE}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.9,
  }));
}
