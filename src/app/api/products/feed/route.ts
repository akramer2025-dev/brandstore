import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "xml"; // xml or csv

    // جلب جميع المنتجات النشطة
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
      },
      include: {
        category: true,
        vendor: {
          select: {
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (format === "csv") {
      return generateCSVFeed(products);
    } else {
      return generateXMLFeed(products);
    }
  } catch (error) {
    console.error("Error generating product feed:", error);
    return NextResponse.json(
      { error: "فشل في توليد الكتالوج" },
      { status: 500 }
    );
  }
}

function generateXMLFeed(products: any[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.remostore.net";

  // تنظيف الصور - استخدام الصورة الأولى فقط
  const getFirstImage = (images: string | null): string => {
    if (!images) return `${baseUrl}/placeholder.jpg`;
    try {
      const imageArray = JSON.parse(images);
      return imageArray[0] || `${baseUrl}/placeholder.jpg`;
    } catch {
      return images || `${baseUrl}/placeholder.jpg`;
    }
  };

  // Google/Facebook Product Feed - RSS 2.0 + Google Shopping
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ريمو ستور - Remostore</title>
    <link>${baseUrl}</link>
    <description>متجر إلكتروني لبيع الملابس والإكسسوارات</description>
    ${products
      .map((product) => {
        const image = getFirstImage(product.images);
        const link = `${baseUrl}/products/${product.id}`;
        const price = product.price.toFixed(2);
        const originalPrice = product.originalPrice
          ? product.originalPrice.toFixed(2)
          : price;

        return `
    <item>
      <g:id>${product.id}</g:id>
      <title><![CDATA[${product.nameAr}]]></title>
      <description><![CDATA[${product.descriptionAr || product.nameAr}]]></description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${product.stock > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:price>${price} EGP</g:price>
      ${
        product.originalPrice && product.originalPrice > product.price
          ? `<g:sale_price>${price} EGP</g:sale_price>`
          : ""
      }
      <g:brand>${product.vendor?.businessName || "ريمو ستور"}</g:brand>
      <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
      <g:product_type>${product.category?.nameAr || "ملابس"}</g:product_type>
      <g:item_group_id>${product.id}</g:item_group_id>
      <g:mpn>${product.id}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(xmlContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function generateCSVFeed(products: any[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.remostore.net";

  const getFirstImage = (images: string | null): string => {
    if (!images) return `${baseUrl}/placeholder.jpg`;
    try {
      const imageArray = JSON.parse(images);
      return imageArray[0] || `${baseUrl}/placeholder.jpg`;
    } catch {
      return images || `${baseUrl}/placeholder.jpg`;
    }
  };

  // CSV Header
  let csvContent = `id,title,description,link,image_link,availability,price,brand,condition,google_product_category,product_type\n`;

  // CSV Rows
  products.forEach((product) => {
    const image = getFirstImage(product.images);
    const link = `${baseUrl}/products/${product.id}`;
    const price = `${product.price.toFixed(2)} EGP`;
    const availability = product.stock > 0 ? "in stock" : "out of stock";

    csvContent += `"${product.id}","${product.nameAr}","${
      product.descriptionAr || product.nameAr
    }","${link}","${image}","${availability}","${price}","${
      product.vendor?.businessName || "ريمو ستور"
    }","new","Apparel & Accessories","${product.category?.nameAr || "ملابس"}"\n`;
  });

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products-feed.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
