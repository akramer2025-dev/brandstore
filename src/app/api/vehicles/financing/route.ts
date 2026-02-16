import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// تطبيق التمويل البنكي
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // التحقق من وجود المركبة
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "المركبة غير موجودة" },
        { status: 404 }
      );
    }

    if (!vehicle.allowBankFinancing) {
      return NextResponse.json(
        { error: "هذه المركبة غير مؤهلة للتمويل البنكي" },
        { status: 400 }
      );
    }

    // إنشاء رقم طلب تمويل فريد
    const financeCount = await prisma.vehicleFinancing.count();
    const applicationNumber = `FIN-${Date.now()}-${financeCount + 1}`;

    // حساب التمويل
    const vehiclePrice = parseFloat(body.vehiclePrice);
    const downPayment = parseFloat(body.downPayment);
    const financedAmount = vehiclePrice - downPayment;
    const installmentYears = parseInt(body.installmentYears);
    const interestRate = parseFloat(body.interestRate);
    const adminFees = parseFloat(body.adminFees || '0');

    // حساب القسط الشهري (صيغة بسيطة)
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = installmentYears * 12;
    const monthlyInstallment = financedAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    const totalPayable = (monthlyInstallment * numberOfPayments) + downPayment + adminFees;

    // إنشاء طلب التمويل
    const financing = await prisma.vehicleFinancing.create({
      data: {
        vehicleId: body.vehicleId,
        customerId: session.user.id,
        bankName: body.bankName,
        applicationNumber,
        
        vehiclePrice,
        downPayment,
        financedAmount,
        installmentYears,
        monthlyInstallment,
        interestRate,
        totalPayable,
        adminFees,
        
        fullName: body.fullName,
        nationalId: body.nationalId,
        phone: body.phone,
        email: body.email,
        address: body.address,
        employmentStatus: body.employmentStatus,
        monthlyIncome: parseFloat(body.monthlyIncome),
        employer: body.employer,
        
        customerNotes: body.customerNotes,
        
        status: 'PENDING',
      },
    });

    return NextResponse.json(financing, { status: 201 });
  } catch (error) {
    console.error("Error creating financing application:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تقديم طلب التمويل" },
      { status: 500 }
    );
  }
}

// جلب طلبات التمويل للعميل
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const customerId = session.user.id;
    
    // إذا كان المستخدم معرض، يجلب طلبات التمويل لمركباته
    if (session.user.role === 'VEHICLE_DEALER') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: customerId },
      });

      if (!vendor) {
        return NextResponse.json(
          { error: "لم يتم العثور على حساب المعرض" },
          { status: 404 }
        );
      }

      const financingApplications = await prisma.vehicleFinancing.findMany({
        where: {
          vehicle: { vendorId: vendor.id },
        },
        include: {
          vehicle: {
            select: {
              id: true,
              vehicleNumber: true,
              brand: true,
              model: true,
              year: true,
              featuredImage: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(financingApplications);
    }

    // إذا كان العميل، يجلب طلباته فقط
    const financingApplications = await prisma.vehicleFinancing.findMany({
      where: { customerId },
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            brand: true,
            model: true,
            year: true,
            featuredImage: true,
            vendor: {
              select: {
                businessNameAr: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(financingApplications);
  } catch (error) {
    console.error("Error fetching financing applications:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب طلبات التمويل" },
      { status: 500 }
    );
  }
}
