import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

// ============ تحديث إحصائيات المنشور ============
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING_STAFF")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ 
        error: "يجب توفير معرف المنشور" 
      }, { status: 400 });
    }

    // جلب المنشور والحساب
    const post = await prisma.socialMediaPost.findUnique({
      where: { id: postId },
      include: { account: true }
    });

    if (!post || !post.postId) {
      return NextResponse.json({ 
        error: "المنشور غير موجود أو لم يتم نشره بعد" 
      }, { status: 404 });
    }

    let metrics: any = {};

    try {
      if (post.account.platform === "FACEBOOK") {
        // جلب إحصائيات Facebook
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${post.postId}`,
          {
            params: {
              fields: "likes.summary(true),comments.summary(true),shares",
              access_token: post.account.accessToken
            }
          }
        );

        metrics = {
          likes: response.data.likes?.summary?.total_count || 0,
          comments: response.data.comments?.summary?.total_count || 0,
          shares: response.data.shares?.count || 0
        };

        // جلب Reach من Insights
        try {
          const insightsResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${post.postId}/insights`,
            {
              params: {
                metric: "post_impressions",
                access_token: post.account.accessToken
              }
            }
          );

          if (insightsResponse.data.data && insightsResponse.data.data.length > 0) {
            metrics.reach = insightsResponse.data.data[0].values[0].value || 0;
          }
        } catch (reachError) {
          console.log("Could not fetch reach for FB post:", reachError);
        }

      } else if (post.account.platform === "INSTAGRAM") {
        // جلب إحصائيات Instagram
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${post.postId}`,
          {
            params: {
              fields: "like_count,comments_count",
              access_token: post.account.accessToken
            }
          }
        );

        metrics = {
          likes: response.data.like_count || 0,
          comments: response.data.comments_count || 0,
          shares: 0 // Instagram لا يدعم shares
        };

        // جلب Reach من Insights
        try {
          const insightsResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${post.postId}/insights`,
            {
              params: {
                metric: "reach,impressions",
                access_token: post.account.accessToken
              }
            }
          );

          if (insightsResponse.data.data && insightsResponse.data.data.length > 0) {
            const reachData = insightsResponse.data.data.find((d: any) => d.name === "reach");
            if (reachData) {
              metrics.reach = reachData.values[0].value || 0;
            }
          }
        } catch (reachError) {
          console.log("Could not fetch reach for IG post:", reachError);
        }
      }

      // تحديث المنشور في قاعدة البيانات
      const updatedPost = await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          likes: metrics.likes || post.likes,
          comments: metrics.comments || post.comments,
          shares: metrics.shares || post.shares,
          reach: metrics.reach || post.reach
        }
      });

      return NextResponse.json({ 
        message: "تم تحديث الإحصائيات بنجاح",
        metrics: {
          likes: updatedPost.likes,
          comments: updatedPost.comments,
          shares: updatedPost.shares,
          reach: updatedPost.reach
        }
      });

    } catch (apiError: any) {
      console.error("Error fetching metrics from API:", apiError);
      return NextResponse.json({ 
        error: "فشل جلب الإحصائيات",
        details: apiError.response?.data?.error?.message || apiError.message
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error updating metrics:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في تحديث الإحصائيات",
      details: error.message
    }, { status: 500 });
  }
}

// ============ تحديث كل المنشورات المنشورة ============
export async function PUT() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // جلب كل المنشورات المنشورة خلال آخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await prisma.socialMediaPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          gte: thirtyDaysAgo
        },
        postId: {
          not: null
        }
      },
      include: { account: true }
    });

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        let metrics: any = {};

        if (post.account.platform === "FACEBOOK") {
          const response = await axios.get(
            `https://graph.facebook.com/v18.0/${post.postId}`,
            {
              params: {
                fields: "likes.summary(true),comments.summary(true),shares",
                access_token: post.account.accessToken
              }
            }
          );

          metrics = {
            likes: response.data.likes?.summary?.total_count || 0,
            comments: response.data.comments?.summary?.total_count || 0,
            shares: response.data.shares?.count || 0
          };
        } else if (post.account.platform === "INSTAGRAM") {
          const response = await axios.get(
            `https://graph.facebook.com/v18.0/${post.postId}`,
            {
              params: {
                fields: "like_count,comments_count",
                access_token: post.account.accessToken
              }
            }
          );

          metrics = {
            likes: response.data.like_count || 0,
            comments: response.data.comments_count || 0,
            shares: 0
          };
        }

        await prisma.socialMediaPost.update({
          where: { id: post.id },
          data: {
            likes: metrics.likes || post.likes,
            comments: metrics.comments || post.comments,
            shares: metrics.shares || post.shares
          }
        });

        successCount++;
      } catch (updateError) {
        console.error(`Error updating post ${post.id}:`, updateError);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      message: `تم تحديث ${successCount} منشور بنجاح`,
      successCount,
      errorCount,
      totalPosts: posts.length
    });

  } catch (error: any) {
    console.error("Error bulk updating metrics:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في تحديث الإحصائيات",
      details: error.message
    }, { status: 500 });
  }
}
