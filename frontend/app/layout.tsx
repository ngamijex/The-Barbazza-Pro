import type { Metadata, Viewport } from "next";
import { ThemeGate } from "@/components/ThemeGate";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thebarbazza.com"),
  title: {
    default: "THE BARBAZZA BARBERSHOP | Book a Barber in Kigali",
    template: "%s | Barbazza",
  },
  description:
    "A house of quiet craft in Ubutare, Kigali. Choose your barber, book online, and leave sharper than you arrived.",
  applicationName: "Barbazza",
  keywords: [
    "Barbazza",
    "barbershop Kigali",
    "barber Ubutare",
    "book a barber",
    "THE BARBAZZA BARBERSHOP",
  ],
  authors: [{ name: "THE BARBAZZA BARBERSHOP" }],
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: "https://www.thebarbazza.com",
    siteName: "THE BARBAZZA BARBERSHOP",
    title: "THE BARBAZZA BARBERSHOP | Book a Barber in Kigali",
    description:
      "A house of quiet craft in Ubutare, Kigali. Choose your barber, book online, and leave sharper than you arrived.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Barbazza" }],
  },
  twitter: {
    card: "summary",
    title: "THE BARBAZZA BARBERSHOP | Book a Barber in Kigali",
    description:
      "A house of quiet craft in Ubutare, Kigali. Choose your barber, book online, and leave sharper than you arrived.",
    images: ["/logo.png"],
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
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Barbazza" />
      </head>
      <body>
        <ThemeGate>{children}</ThemeGate>
      </body>
    </html>
  );
}
