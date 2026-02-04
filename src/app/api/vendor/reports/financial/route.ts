import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // إنشاء فلتر التواريخ
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // جلب رأس المال
    const capital = await prisma.partnerCapital.findFirst({
      where: {
        vendorId: session.user.id,
        partnerType: 'OWNER',
      },
    });

    // جلب المشتريات
    const allPurchases = await prisma.purchase.findMany({
      where: {
        vendorId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && {
          purchaseDate: dateFilter,
        }),
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    // تقسيم المشتريات حسب النوع
    const purchasesFromCapital = allPurchases.filter(p => p.fromCapital);
    const purchasesOnBehalf = allPurchases.filter(p => !p.fromCapital);

    const totalPurchases = allPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const purchasesFromCapitalTotal = purchasesFromCapital.reduce((sum, p) => sum + p.totalCost, 0);
    const purchasesOnBehalfTotal = purchasesOnBehalf.reduce((sum, p) => sum + p.totalCost, 0);

    // جلب المبيعات
    const allSales = await prisma.sale.findMany({
      where: {
        vendorId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && {
          saleDate: dateFilter,
        }),
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    const totalSales = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProfit = allSales.reduce((sum, s) => sum + (s.profit || 0), 0);

    // حساب العمولة (5% من المبيعات التي عليها عمولة)
    const salesWithCommission = allPurchases
      .filter(p => p.commissionFromStore && p.sellingPrice)
      .reduce((sum, p) => sum + (p.sellingPrice! * p.quantity * 0.05), 0);

    // جلب المصروفات
    const allExpenses = await prisma.vendorExpense.findMany({
      where: {
        vendorId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && {
          expenseDate: dateFilter,
        }),
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    // مصاريف المشاوير فقط
    const tripExpenses = allExpenses
      .filter(e => e.expenseType === 'TRANSPORTATION')
      .reduce((sum, e) => sum + e.amount, 0);

    // تجميع المصروفات حسب النوع
    const expensesByType = allExpenses.reduce((acc: any, expense) => {
      const type = expense.expenseType;
      if (!acc[type]) {
        acc[type] = {
          type,
          typeAr: getExpenseTypeArabic(type),
          total: 0,
          count: 0,
        };
      }
      acc[type].total += expense.amount;
      acc[type].count += 1;
      return acc;
    }, {});

    // صافي الربح = الربح - العمولة - المصروفات
    const netProfit = totalProfit - salesWithCommission - totalExpenses;

    return NextResponse.json({
      capital,
      purchases: {
        all: allPurchases,
        fromCapital: purchasesFromCapital,
        onBehalf: purchasesOnBehalf,
      },
      sales: {
        all: allSales,
        count: allSales.length,
      },
      expenses: {
        all: allExpenses,
        byType: Object.values(expensesByType),
      },
      summary: {
        totalPurchases,
        purchasesFromCapital: purchasesFromCapitalTotal,
        purchasesOnBehalf: purchasesOnBehalfTotal,
        tripExpenses,
        totalSales,
        totalProfit,
        totalCommission: salesWithCommission,
        totalExpenses,
        netProfit,
      },
    });

  } catch (error) {
    console.error('Error fetching financial report:', error);
    return NextResponse.json(
      { error: 'فشل جلب التقرير المالي' },
      { status: 500 }
    );
  }
}

function getExpenseTypeArabic(type: string): string {
  const types: { [key: string]: string } = {
    SHIPPING: 'شحن',
    PACKAGING: 'تغليف',
    MARKETING: 'تسويق',
    OPERATION: 'تشغيل',
    SALARY: 'رواتب',
    RENT: 'إيجار',
    UTILITIES: 'مرافق',
    MAINTENANCE: 'صيانة',
    TRANSPORTATION: 'مواصلات ومشاوير',
    OTHER: 'متنوعة',
  };
  return types[type] || type;
}
