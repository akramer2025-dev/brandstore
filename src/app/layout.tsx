import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import StarryBackground from "@/components/StarryBackground";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Brand Store - متجر براند ستور",
  description: "Brand Store - متجر إلكتروني احترافي للملابس مع نظام إدارة متقدم",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <StarryBackground />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
