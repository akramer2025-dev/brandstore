import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ريمو ستور - تسوق أونلاين | أفضل الأسعار والعروض',
  description: 'تسوق أحدث المنتجات بأفضل الأسعار في ريمو ستور. شحن سريع لجميع المحافظات، دفع آمن، ضمان جودة 100%. منتجات أصلية وعروض حصرية يومية.',
  keywords: [
    'تسوق أونلاين',
    'ريمو ستور',
    'متجر إلكتروني',
    'شراء أونلاين مصر',
    'أفضل الأسعار',
    'شحن سريع',
    'منتجات أصلية',
    'عروض وخصومات',
    'ملابس',
    'إلكترونيات',
    'اكسسوارات',
  ],
  authors: [{ name: 'Eng. Akram Elmasry' }],
  creator: 'Eng. Akram Elmasry',
  publisher: 'Remo Store',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://remostore.com',
    siteName: 'ريمو ستور',
    title: 'ريمو ستور - تسوق أونلاين | أفضل الأسعار والعروض',
    description: 'تسوق أحدث المنتجات بأفضل الأسعار. شحن سريع، دفع آمن، ضمان جودة.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ريمو ستور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ريمو ستور - تسوق أونلاين',
    description: 'تسوق أحدث المنتجات بأفضل الأسعار. شحن سريع ودفع آمن.',
    images: ['/og-image.jpg'],
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
  alternates: {
    canonical: 'https://remostore.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'E-commerce',
};
