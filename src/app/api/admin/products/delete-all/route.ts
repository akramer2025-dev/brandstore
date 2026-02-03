import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: مسح كل المنتجات
export async function DELETE() {
  try {
    // مسح كل المنتجات
    const result = await prisma.product.deleteMany({});
    
    return NextResponse.json({ 
      message: `تم مسح ${result.count} منتج بنجاح`, 
      count: result.count 
    });
  } catch (error) {
    console.error('Error deleting all products:', error);
    return NextResponse.json({ error: 'فشل في مسح المنتجات' }, { status: 500 });
  }
}