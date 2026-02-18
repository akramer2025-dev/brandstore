import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        products: [],
        vendors: [],
        totalResults: 0,
      });
    }

    // استخراج أول صورة من الـ images
    const getFirstImage = (images: string | null) => {
      if (!images) return '/placeholder-product.jpg';
      const imageArray = images.split(',');
      return imageArray[0] || '/placeholder-product.jpg';
    };

    // البحث في المنتجات
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameAr: { contains: query, mode: 'insensitive' } },
          { 
            description: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            descriptionAr: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            category: { 
              name: { 
                contains: query, 
                mode: 'insensitive' 
              } 
            } 
          },
        ],
        isActive: true,
        isVisible: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
      take: 10,
      orderBy: [
        { stock: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // البحث في متاجر الشركاء (vendors)
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { storeName: { contains: query, mode: 'insensitive' } },
          { storeDescription: { contains: query, mode: 'insensitive' } },
        ],
        isApproved: true,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    const totalResults = products.length + vendors.length;

    return NextResponse.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: getFirstImage(p.images),
        price: p.price,
        fakePrice: p.originalPrice,
        category: p.category?.name || '',
        brand: p.badge || '',
        inStock: p.stock > 0,
        vendor: p.vendor ? {
          id: p.vendor.id,
          name: p.vendor.storeName,
        } : null,
      })),
      vendors: vendors.map(v => ({
        id: v.id,
        storeName: v.storeName,
        storeDescription: v.storeDescription,
        storeLogo: null,
        ownerName: null,
        productsCount: v._count.products,
      })),
      totalResults,
    });
  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل البحث' },
      { status: 500 }
    );
  }
}
