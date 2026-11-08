import type { Metadata, Viewport } from "next";
import { ThemeGate } from "@/components/ThemeGate";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thebarbazza.com"),
  title: {
    default: "Best Barbershop in Kigali | Barbazza — Haircuts, Fades & Beard",
    template: "%s | Barbazza",
  },
  description:
    "The Barbazza barbershop in Kigali — sharp men's cuts, fades, lining, kids cuts, women's styling, braids and nail care. Book your barber online.",
  applicationName: "Barbazza",
  keywords: [
    "best barbershop in Kigali",
    "best barber Kigali",
    "barbershop Kigali",
    "Barbazza",
    "haircut Kigali",
    "fade Kigali",
    "beard grooming Kigali",
    "book a barber Kigali",
    "THE BARBAZZA BARBERSHOP",
  ],
  authors: [{ name: "THE BARBAZZA BARBERSHOP" }],
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: "https://www.thebarbazza.com",
    siteName: "THE BARBAZZA BARBERSHOP",
    title: "Best Barbershop in Kigali | Barbazza",
    description:
      "The Barbazza barbershop in Kigali — sharp men's cuts, fades, lining, kids cuts, women's styling, braids and nail care. Book your barber online.",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: "The Barbazza barbershop in Kigali" }],
  },
  twitter: {
    card: "summary",
    title: "Best Barbershop in Kigali | Barbazza",
    description:
      "The Barbazza barbershop in Kigali — sharp men's cuts, fades, lining, kids cuts, women's styling, braids and nail care. Book your barber online.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Barbazza",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png?v=3", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png?v=3",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
        {/* Server-rendered so staff/login CSS is present on first paint (no FOUC). */}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.png?v=3" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" sizes="180x180" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Barbazza" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BarberShop",
              name: "THE BARBAZZA BARBERSHOP",
              url: "https://www.thebarbazza.com",
              image: "https://www.thebarbazza.com/og-image.png",
              telephone: "+250791345455",
              address: {
                "@type": "PostalAddress",
                streetAddress: "186 KK 31 Ave, Ubutare",
                addressLocality: "Kigali",
                addressCountry: "RW",
              },
              description:
                "The Barbazza barbershop in Kigali — haircuts, fades, lining, kids cuts, women's styling, braids and nail care.",
              areaServed: "Kigali",
              slogan: "The Barbazza barbershop in Kigali",
              makesOffer: [
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Classic Men's Cut" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Enhanced Cut" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ultimate Fresh Cut" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hair Lining" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kids Cut" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Women's Style Cut" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Men's Braids" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hand & Foot Nails" } },
              ],
            }),
          }}
        />
      </head>
      <body>
        <ThemeGate>{children}</ThemeGate>
      </body>
    </html>
  );
}
