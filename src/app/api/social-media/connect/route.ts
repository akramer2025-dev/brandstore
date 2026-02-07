import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

// ============ ربط حساب Facebook/Instagram ============
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING_STAFF")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { platform, accessToken } = await req.json();

    if (!platform || !accessToken) {
      return NextResponse.json({ 
        error: "يجب توفير المنصة (platform) والـ Access Token" 
      }, { status: 400 });
    }

    // التحقق من التوكن وجلب معلومات الصفحة
    let pageData;
    
    if (platform === "FACEBOOK") {
      // جلب صفحات Facebook
      const pagesResponse = await axios.get(
        `https://graph.facebook.com/v18.0/me/accounts`,
        {
          params: {
            access_token: accessToken,
            fields: "id,name,access_token"
          }
        }
      );

      if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
        return NextResponse.json({ 
          error: "لم يتم العثور على صفحات Facebook" 
        }, { status: 400 });
      }

      // أخذ أول صفحة (يمكن تحسينه للسماح بالاختيار)
      pageData = pagesResponse.data.data[0];

      // استبدال User Token بـ Page Token (إذا كان App ID و Secret موجودين)
      if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && 
          !process.env.FACEBOOK_APP_ID.includes("حط_هنا") && 
          !process.env.FACEBOOK_APP_SECRET.includes("حط_هنا")) {
        try {
          const longLivedTokenResponse = await axios.get(
            `https://graph.facebook.com/v18.0/oauth/access_token`,
            {
              params: {
                grant_type: "fb_exchange_token",
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: pageData.access_token
              }
            }
          );

          pageData.access_token = longLivedTokenResponse.data.access_token;
          console.log("✅ تم تحويل Token إلى Long-lived Token");
        } catch (tokenError: any) {
          console.warn("⚠️ تحذير: فشل تحويل Token إلى Long-lived، سيتم استخدام Token الحالي");
          console.warn("Error:", tokenError.response?.data || tokenError.message);
          // نستخدم الـ Page Token كما هو
        }
      } else {
        console.log("ℹ️ تنبيه: FACEBOOK_APP_ID/SECRET غير موجودين، سيتم استخدام Token كما هو");
      }
      
    } else if (platform === "INSTAGRAM") {
      // جلب Instagram Business Account
      const meResponse = await axios.get(
        `https://graph.facebook.com/v18.0/me`,
        {
          params: {
            access_token: accessToken,
            fields: "id"
          }
        }
      );

      const userId = meResponse.data.id;

      // جلب الصفحات المرتبطة
      const pagesResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${userId}/accounts`,
        {
          params: {
            access_token: accessToken,
            fields: "id,name,instagram_business_account"
          }
        }
      );

      let instagramAccount = null;
      for (const page of pagesResponse.data.data) {
        if (page.instagram_business_account) {
          instagramAccount = page.instagram_business_account;
          pageData = {
            id: instagramAccount.id,
            name: page.name + " (Instagram)",
            access_token: accessToken
          };
          break;
        }
      }

      if (!instagramAccount) {
        return NextResponse.json({ 
          error: "لم يتم العثور على حساب Instagram Business مرتبط بصفحة Facebook" 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: "المنصة غير مدعومة. المنصات المدعومة: FACEBOOK, INSTAGRAM" 
      }, { status: 400 });
    }

    // حفظ الحساب في قاعدة البيانات
    const account = await prisma.socialMediaAccount.upsert({
      where: {
        platform_pageId: {
          platform,
          pageId: pageData.id
        }
      },
      create: {
        platform,
        pageId: pageData.id,
        pageName: pageData.name,
        accessToken: pageData.access_token,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 يوم
        isActive: true,
        lastSync: new Date()
      },
      update: {
        pageName: pageData.name,
        accessToken: pageData.access_token,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        lastSync: new Date()
      }
    });

    return NextResponse.json({
      message: "تم ربط الحساب بنجاح",
      account: {
        id: account.id,
        platform: account.platform,
        pageName: account.pageName,
        isActive: account.isActive
      }
    });

  } catch (error: any) {
    console.error("❌ Error connecting social media account:");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Full error:", error);
    
    if (error.response?.data) {
      return NextResponse.json({ 
        error: "فشل الربط",
        details: error.response.data.error?.message || error.response.data.error || error.message
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "حدث خطأ في ربط الحساب",
      details: error.message
    }, { status: 500 });
  }
}

// ============ جلب الحسابات المربوطة ============
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING_STAFF")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const accounts = await prisma.socialMediaAccount.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ accounts });

  } catch (error: any) {
    console.error("Error fetching social media accounts:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في جلب الحسابات" 
    }, { status: 500 });
  }
}

// ============ حذف حساب ============
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json({ 
        error: "يجب توفير معرف الحساب" 
      }, { status: 400 });
    }

    await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "تم حذف الحساب بنجاح" });

  } catch (error: any) {
    console.error("Error deleting social media account:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في حذف الحساب" 
    }, { status: 500 });
  }
}
