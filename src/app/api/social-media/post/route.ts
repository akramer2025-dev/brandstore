import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

// ============ نشر منشور على Facebook/Instagram ============
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING_STAFF")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { accountId, content, imageUrl, productId, scheduledFor } = await req.json();

    console.log("📝 محاولة نشر منشور:");
    console.log("Account ID:", accountId);
    console.log("Content:", content);
    console.log("Image URL:", imageUrl);
    console.log("Scheduled For:", scheduledFor);

    if (!accountId || !content) {
      return NextResponse.json({ 
        error: "يجب توفير معرف الحساب والمحتوى" 
      }, { status: 400 });
    }

    // جلب حساب السوشيال ميديا
    const account = await prisma.socialMediaAccount.findUnique({
      where: { id: accountId }
    });

    console.log("📱 الحساب:", {
      found: !!account,
      platform: account?.platform,
      pageName: account?.pageName,
      pageId: account?.pageId,
      hasToken: !!account?.accessToken
    });

    if (!account || !account.isActive) {
      return NextResponse.json({ 
        error: "الحساب غير موجود أو غير نشط" 
      }, { status: 404 });
    }

    // إذا كان مجدولاً، حفظه فقط
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const post = await prisma.socialMediaPost.create({
        data: {
          accountId,
          content,
          imageUrl,
          productId,
          status: "SCHEDULED",
          scheduledFor: new Date(scheduledFor)
        }
      });

      return NextResponse.json({ 
        message: "تم جدولة المنشور بنجاح",
        post 
      });
    }

    // النشر المباشر
    let postId;
    let publishedAt = new Date();

    console.log("🚀 بدء النشر المباشر على", account.platform);

    try {
      if (account.platform === "FACEBOOK") {
        console.log("📘 نشر على Facebook...");
        console.log("Page ID:", account.pageId);
        console.log("Has Image:", !!imageUrl);
        
        // نشر على Facebook
        const params: any = {
          message: content,
          access_token: account.accessToken
        };

        if (imageUrl) {
          params.url = imageUrl;
          console.log("📷 نشر مع صورة:", imageUrl);
          const response = await axios.post(
            `https://graph.facebook.com/v18.0/${account.pageId}/photos`,
            null,
            { params }
          );
          postId = response.data.id;
          console.log("✅ تم النشر! Post ID:", postId);
        } else {
          console.log("📝 نشر نص فقط");
          const response = await axios.post(
            `https://graph.facebook.com/v18.0/${account.pageId}/feed`,
            null,
            { params }
          );
          postId = response.data.id;
        }

      } else if (account.platform === "INSTAGRAM") {
        // نشر على Instagram
        if (!imageUrl) {
          return NextResponse.json({ 
            error: "Instagram يتطلب صورة مع المنشور" 
          }, { status: 400 });
        }

        // خطوة 1: إنشاء Container
        const containerResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${account.pageId}/media`,
          null,
          {
            params: {
              image_url: imageUrl,
              caption: content,
              access_token: account.accessToken
            }
          }
        );

        const containerId = containerResponse.data.id;

        // خطوة 2: نشر Container
        const publishResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${account.pageId}/media_publish`,
          null,
          {
            params: {
              creation_id: containerId,
              access_token: account.accessToken
            }
          }
        );

        postId = publishResponse.data.id;
      }

      // حفظ المنشور في قاعدة البيانات
      const post = await prisma.socialMediaPost.create({
        data: {
          accountId,
          postId,
          content,
          imageUrl,
          productId,
          status: "PUBLISHED",
          publishedAt
        }
      });

      return NextResponse.json({ 
        message: "تم نشر المنشور بنجاح",
        post,
        postUrl: account.platform === "FACEBOOK" 
          ? `https://facebook.com/${postId}`
          : `https://instagram.com/p/${postId}`
      });

    } catch (publishError: any) {
      console.error("❌ خطأ في النشر:");
      console.error("Error message:", publishError.message);
      console.error("Error response:", publishError.response?.data);
      console.error("Full error:", publishError);
      
      // حفظ المنشور كفاشل
      const post = await prisma.socialMediaPost.create({
        data: {
          accountId,
          content,
          imageUrl,
          productId,
          status: "FAILED",
          error: publishError.response?.data?.error?.message || publishError.message
        }
      });

      return NextResponse.json({ 
        error: "فشل نشر المنشور",
        details: publishError.response?.data?.error?.message || publishError.response?.data?.error || publishError.message,
        fullError: publishError.response?.data,
        post
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("❌ خطأ عام في النشر:");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Full error:", error);
    
    return NextResponse.json({ 
      error: "حدث خطأ في نشر المنشور",
      details: error.message,
      fullError: error.response?.data
    }, { status: 500 });
  }
}

// ============ جلب المنشورات ============
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING_STAFF")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const status = searchParams.get("status");

    const posts = await prisma.socialMediaPost.findMany({
      where: {
        ...(accountId && { accountId }),
        ...(status && { status })
      },
      include: {
        account: true,
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            price: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({ posts });

  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في جلب المنشورات" 
    }, { status: 500 });
  }
}
