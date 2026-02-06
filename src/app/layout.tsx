import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import StarryBackground from "@/components/StarryBackground";
import InstallPWA from "@/components/InstallPWA";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Remostore - متجر ريموستور",
  description: "Remostore - متجر إلكتروني احترافي للملابس مع نظام إدارة متقدم",
  keywords: ['تسوق', 'ملابس', 'أزياء', 'موضة', 'تجارة إلكترونية'],
  authors: [{ name: 'Remostore' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Remostore',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Remostore',
    title: 'Remostore - متجر ريموستور',
    description: 'متجر إلكتروني احترافي للملابس',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png'
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Remostore" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <StarryBackground />
        <Providers>
          <ServiceWorkerRegistration />
          <Header />
          {children}
          <InstallPWA />
        </Providers>
      </body>
    </html>
  );
}
