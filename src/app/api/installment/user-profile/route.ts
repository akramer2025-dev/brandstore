import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: استرجاع بيانات التقسيط المحفوظة للمستخدم
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    // البحث عن آخر اتفاقية تقسيط معتمدة للمستخدم
    const lastAgreement = await prisma.installmentAgreement.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['APPROVED', 'DOCUMENTS_COMPLETE']
        },
        nationalIdImage: { not: null },
        nationalIdBack: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        nationalIdImage: true,
        nationalIdBack: true,
        fullName: true,
        nationalId: true,
        address: true,
        selfieImage: true
      }
    });

    if (!lastAgreement) {
      return NextResponse.json({ 
        hasProfile: false,
        message: "لم يتم العثور على بيانات محفوظة"
      });
    }

    return NextResponse.json({
      hasProfile: true,
      profile: lastAgreement
    });
  } catch (error: any) {
    console.error("Error fetching installment profile:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء استرجاع البيانات" },
      { status: 500 }
    );
  }
}

// POST: حفظ/تحديث بيانات التقسيط للمستخدم
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nationalIdImage,
      nationalIdBack,
      firstPaymentReceipt,
      signature,
      selfieImage,
      fullName,
      nationalId,
      totalAmount,
      downPayment,
      numberOfInstallments,
      monthlyInstallment
    } = body;

    // إنشاء رقم اتفاقية فريد
    const agreementNumber = `AGR-${Date.now()}-${session.user.id.slice(0, 6).toUpperCase()}`;

    // حفظ الاتفاقية
    const agreement = await prisma.installmentAgreement.create({
      data: {
        userId: session.user.id,
        agreementNumber,
        status: 'DOCUMENTS_COMPLETE',
        nationalIdImage,
        nationalIdBack,
        firstPaymentReceipt,
        signature,
        selfieImage,
        fullName,
        nationalId,
        totalAmount,
        downPayment,
        numberOfInstallments,
        monthlyInstallment,
        acceptedTerms: true,
        acceptedAt: new Date(),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    });

    console.log('✅ تم حفظ اتفاقية التقسيط:', agreementNumber);

    return NextResponse.json({
      success: true,
      agreementId: agreement.id,
      agreementNumber: agreement.agreementNumber,
      message: "تم حفظ بياناتك بنجاح"
    });
  } catch (error: any) {
    console.error("Error saving installment profile:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}
