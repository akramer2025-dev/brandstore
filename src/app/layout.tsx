import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { BottomNavBar } from "@/components/BottomNavBar";
import InstallPWA from "@/components/InstallPWA";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import VisitorTracker from "@/components/VisitorTracker";
import MobileNotifications from "@/components/MobileNotifications";
import FacebookPixel from "@/components/FacebookPixel";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { PageTransition } from "@/components/PageTransition";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.remostore.net'),
  title: {
    default: 'Remostore - متجر ريموستور | تسوق أونلاين في مصر',
    template: '%s | Remostore'
  },
  description: 'ريموستور - متجر إلكتروني موثوق في مصر. منتجات أصلية 100%، شحن سريع لجميع المحافظات، دفع آمن عند الاستلام، سياسة استرجاع مرنة. تسوق الآن!',
  keywords: [
    'تسوق أونلاين مصر',
    'ريموستور',
    'متجر إلكتروني موثوق',
    'ملابس أصلية',
    'شحن سريع',
    'دفع عند الاستلام',
    'COD مصر',
    'تسوق آمن',
    'Remostore',
    'Egyptian online store'
  ],
  authors: [{ name: 'Remostore', url: 'https://www.remostore.net' }],
  creator: 'Remostore',
  publisher: 'Remostore',
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
    locale: 'ar_EG',
    url: 'https://www.remostore.net',
    siteName: 'Remostore',
    title: 'Remostore - متجر ريموستور | تسوق أونلاين في مصر',
    description: 'متجر إلكتروني موثوق - منتجات أصلية، شحن سريع، دفع آمن عند الاستلام',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Remostore Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remostore - متجر ريموستور',
    description: 'متجر إلكتروني موثوق في مصر - منتجات أصلية وشحن سريع',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // سيتم إضافة Google Search Console Verification هنا لاحقاً
    // google: 'your-google-verification-code',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png'
  },
  category: 'E-commerce',
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
      <body className={`${cairo.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <PageTransition />
          <FacebookPixel />
          <ServiceWorkerRegistration />
          <VisitorTracker />
          <MobileNotifications />
          <Header />
          {children}
          <BottomNavBar />
          <InstallPWA />
        </Providers>
      </body>
    </html>
  );
}
