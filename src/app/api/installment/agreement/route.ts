import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate unique agreement number
function generateAgreementNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGR-${timestamp}-${random}`;
}

// POST - Create new installment agreement
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      nationalIdImage,
      signature,
      selfieImage,
      fullName,
      nationalId,
      totalAmount,
      downPayment,
      numberOfInstallments,
      monthlyInstallment
    } = body;
    
    // Validation
    if (!nationalIdImage || !signature || !selfieImage) {
      return NextResponse.json(
        { error: 'جميع المستندات مطلوبة (البطاقة الشخصية، التوقيع، الصورة الشخصية)' },
        { status: 400 }
      );
    }
    
    if (!totalAmount || !downPayment || !numberOfInstallments || !monthlyInstallment) {
      return NextResponse.json(
        { error: 'بيانات التقسيط غير مكتملة' },
        { status: 400 }
      );
    }
    
    // Get user IP and User Agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Create agreement with PENDING status (simplified approval process)
    const agreement = await prisma.installmentAgreement.create({
      data: {
        userId: session.user.id,
        agreementNumber: generateAgreementNumber(),
        status: 'PENDING', // تغيير: القبول المبدئي - بانتظار مراجعة المدير
        nationalIdImage,
        signature,
        selfieImage,
        fullName: fullName || '',
        nationalId: nationalId || '',
        totalAmount,
        downPayment,
        numberOfInstallments,
        monthlyInstallment,
        interestRate: 0, // No interest for now
        acceptedTerms: true,
        acceptedAt: new Date(),
        ip,
        userAgent
      }
    });

    // 🔔 إشعار للمدير: طلب تقسيط جديد
    console.log('🔔 [ADMIN NOTIFICATION] طلب تقسيط جديد!');
    console.log(`📝 رقم الطلب: ${agreement.agreementNumber}`);
    console.log(`👤 العميل: ${fullName || session.user.name}`);
    console.log(`💰 المبلغ: ${totalAmount} ج.م`);
    console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-EG')}`);
    
    return NextResponse.json({
      success: true,
      agreement: {
        id: agreement.id,
        agreementNumber: agreement.agreementNumber,
        status: agreement.status
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating installment agreement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الاتفاقية' },
      { status: 500 }
    );
  }
}

// GET - Get user's agreements
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const agreements = await prisma.installmentAgreement.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true
          }
        }
      }
    });
    
    return NextResponse.json({ agreements });
    
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الاتفاقيات' },
      { status: 500 }
    );
  }
}
