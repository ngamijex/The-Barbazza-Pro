import type { MetadataRoute } from "next";

const SITE = "https://www.thebarbazza.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/home",
          "/api/",
          "/staff",
          "/people",
          "/settings",
          "/expenses",
          "/credits",
          "/credit",
          "/contracts",
          "/daily-report",
          "/daily-records",
          "/monthly-closing",
          "/reports",
          "/audit",
          "/performance",
          "/profile",
          "/floor",
          "/chair",
          "/calendar",
          "/history",
          "/me",
          "/barbers",
          "/services",
          "/expense-categories",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
