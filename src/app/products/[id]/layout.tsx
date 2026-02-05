import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { ReactNode } from "react";

interface Props {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        nameAr: true,
        descriptionAr: true,
        price: true,
        images: true,
      },
    });

    if (!product) {
      return {
        title: "منتج غير موجود - ريمو ستور",
      };
    }

    // Get first image
    const images = product.images
      ? product.images.split(",").map((img) => img.trim()).filter((img) => img)
      : [];
    const mainImage = images[0] || "/logo.png";

    const title = `${product.nameAr} - ${product.price.toLocaleString()} جنيه | ريمو ستور`;
    const description = product.descriptionAr?.slice(0, 160) || `${product.nameAr} متوفر الآن في ريمو ستور بسعر ${product.price.toLocaleString()} جنيه`;

    return {
      title,
      description,
      openGraph: {
        title: `🛍️ ${product.nameAr}`,
        description: `💰 السعر: ${product.price.toLocaleString()} جنيه\n\n${description}\n\n✨ تسوق الآن من ريمو ستور`,
        images: [
          {
            url: mainImage,
            width: 1200,
            height: 630,
            alt: product.nameAr,
          },
        ],
        type: "website",
        siteName: "ريمو ستور",
        locale: "ar_EG",
      },
      twitter: {
        card: "summary_large_image",
        title: `🛍️ ${product.nameAr} - ${product.price.toLocaleString()} جنيه`,
        description: description,
        images: [mainImage],
      },
    };
  } catch {
    return {
      title: "ريمو ستور",
    };
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
