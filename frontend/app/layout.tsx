import type { Metadata, Viewport } from "next";
import { ThemeGate } from "@/components/ThemeGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbazza — Barbershop Management System",
  description: "Barbazza barbershop operations, performance, and payroll.",
  applicationName: "Barbazza",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Barbazza",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.png", apple: "/logo.png" },
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
