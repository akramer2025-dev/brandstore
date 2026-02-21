import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketing/facebook/balance
 * جلب رصيد Facebook Ads Account
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Get Facebook credentials from env or database
    let accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    let adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    // Try to get from database if not in env
    if (!accessToken) {
      try {
        const dbToken = await prisma.systemSetting.findUnique({
          where: { key: "facebook_access_token" }
        });
        if (dbToken) accessToken = dbToken.value;
        
        const dbAccountId = await prisma.systemSetting.findUnique({
          where: { key: "facebook_ad_account_id" }
        });
        if (dbAccountId) adAccountId = dbAccountId.value;
      } catch (e) {
        console.log("Could not fetch from database, using env only");
      }
    }

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: 'Facebook credentials غير موجودة. أضفها في إعدادات Facebook.' },
        { status: 400 }
      );
    }

    const baseUrl = 'https://graph.facebook.com/v21.0';

    // جلب بيانات Ad Account (يشمل الرصيد والإنفاق)
    const accountResponse = await fetch(
      `${baseUrl}/${adAccountId}?fields=account_id,name,account_status,currency,balance,amount_spent,spend_cap,disable_reason&access_token=${accessToken}`
    );

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.error('Facebook API Error:', errorData);
      return NextResponse.json(
        { error: 'فشل في جلب بيانات الحساب من Facebook', details: errorData },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();

    // تحويل balance من cents إلى عملة عادية
    const balanceInCurrency = accountData.balance ? parseFloat(accountData.balance) / 100 : 0;
    const spentInCurrency = accountData.amount_spent ? parseFloat(accountData.amount_spent) / 100 : 0;
    const spendCapInCurrency = accountData.spend_cap ? parseFloat(accountData.spend_cap) / 100 : null;

    return NextResponse.json({
      success: true,
      account: {
        id: accountData.account_id,
        name: accountData.name,
        status: accountData.account_status,
        currency: accountData.currency,
        balance: balanceInCurrency,
        amountSpent: spentInCurrency,
        spendCap: spendCapInCurrency,
        disableReason: accountData.disable_reason || null,
      },
      formatted: {
        balance: `${balanceInCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${accountData.currency}`,
        spent: `${spentInCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${accountData.currency}`,
        spendCap: spendCapInCurrency ? `${spendCapInCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${accountData.currency}` : 'غير محدد',
      }
    });

  } catch (error: any) {
    console.error('Error fetching Facebook balance:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الرصيد', details: error.message },
      { status: 500 }
    );
  }
}
