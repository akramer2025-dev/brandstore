import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ error: 'Missing product IDs' }, { status: 400 });
    }
    
    const productIds = idsParam.split(',').filter(id => id.trim() !== '');
    
    if (productIds.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }
    
    // جلب المنتجات مع التحقق من حقل allowInstallment
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true,
        isVisible: true,
        isActive: true
      }
    });
    
    // فلترة المنتجات القابلة للتقسيط فقط
    const eligibleProducts = products.filter(p => p.allowInstallment === true);
    
    return NextResponse.json({
      success: true,
      products: eligibleProducts
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في التحقق من المنتجات',
        products: [] 
      },
      { status: 200 }
    );
  }
}
