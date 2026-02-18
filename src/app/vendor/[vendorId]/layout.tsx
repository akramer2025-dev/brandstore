import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

interface VendorLayoutProps {
  children: React.ReactNode
  params: {
    vendorId: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { vendorId: string }
}): Promise<Metadata> {
  try {
    // جلب بيانات الشريك من قاعدة البيانات
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.vendorId },
      select: {
        id: true,
        storeNameAr: true,
        storeName: true,
        storeBioAr: true,
        storeBio: true,
        logo: true,
        coverImage: true,
      },
    })

    if (!vendor) {
      return {
        title: 'متجر غير موجود',
        description: 'المتجر المطلوب غير موجود',
      }
    }

    const storeName = vendor.storeNameAr || vendor.storeName || 'متجر الشريك'
    const storeBio = vendor.storeBioAr || vendor.storeBio || `تسوق من ${storeName} على Remostore`
    const logoUrl = vendor.logo || '/logo.png' // لوجو الموقع كـ fallback
    const coverUrl = vendor.coverImage || logoUrl

    // بناء URL الكامل للصور
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.remostore.net'
    const absoluteLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`
    const absoluteCoverUrl = coverUrl.startsWith('http') ? coverUrl : `${baseUrl}${coverUrl}`

    return {
      title: `${storeName} | Remostore`,
      description: storeBio,
      openGraph: {
        type: 'website',
        locale: 'ar_EG',
        url: `${baseUrl}/vendor/${vendor.id}/products`,
        siteName: 'Remostore',
        title: storeName,
        description: storeBio,
        images: [
          {
            url: absoluteLogoUrl,
            width: 1200,
            height: 630,
            alt: storeName,
          },
          {
            url: absoluteCoverUrl,
            width: 1200,
            height: 630,
            alt: `${storeName} - غلاف المتجر`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: storeName,
        description: storeBio,
        images: [absoluteLogoUrl],
      },
    }
  } catch (error) {
    console.error('Error generating vendor metadata:', error)
    return {
      title: 'متجر الشريك | Remostore',
      description: 'تسوق من متاجرنا المميزة',
    }
  }
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  return <>{children}</>
}
