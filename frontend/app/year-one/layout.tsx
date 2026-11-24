import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Year One Production Document — More Than a Cut",
  description:
    "Barbazza Year One production document: full documentary script, interview guide, shot list, numbers table, and embedded reference films.",
  alternates: {
    canonical: "https://www.thebarbazza.com/year-one",
  },
  openGraph: {
    title: "Barbazza — Year One production document",
    description:
      "Full shooting script and production brief for Barbazza’s first-anniversary documentary.",
    url: "https://www.thebarbazza.com/year-one",
    images: [{ url: "/public-art/hero-shop.jpg", width: 1200, height: 800, alt: "Barbazza Year One" }],
  },
  robots: { index: true, follow: true },
};

export default function YearOneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
