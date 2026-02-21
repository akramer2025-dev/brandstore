import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/settings/facebook
 * استرجاع إعدادات Facebook من Database أو .env
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get from database first
    let accessToken = "";
    let adAccountId = "";
    let pageId = "";

    try {
      const dbToken = await prisma.systemSetting.findUnique({
        where: { key: "facebook_access_token" }
      });
      const dbAccountId = await prisma.systemSetting.findUnique({
        where: { key: "facebook_ad_account_id" }
      });
      const dbPageId = await prisma.systemSetting.findUnique({
        where: { key: "facebook_page_id" }
      });

      if (dbToken) accessToken = dbToken.value;
      if (dbAccountId) adAccountId = dbAccountId.value;
      if (dbPageId) pageId = dbPageId.value;
    } catch (dbError) {
      console.log("Database fetch failed, using .env fallback");
    }

    // Fallback to .env if not in database
    if (!accessToken) accessToken = process.env.FACEBOOK_ACCESS_TOKEN || "";
    if (!adAccountId) adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || "";
    if (!pageId) pageId = process.env.FACEBOOK_PAGE_ID || "";

    // Read current values (not showing the full token for security)
    const settings = {
      accessToken: accessToken 
        ? `${accessToken.slice(0, 20)}...` 
        : "",
      adAccountId: adAccountId,
      pageId: pageId,
      hasAccessToken: !!accessToken,
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Failed to load Facebook settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/facebook
 * حفظ إعدادات Facebook في Database (و .env للتطوير)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accessToken, adAccountId, pageId } = body;

    if (!accessToken || !adAccountId || !pageId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to database (works in production)
    try {
      await prisma.systemSetting.upsert({
        where: { key: "facebook_access_token" },
        create: { key: "facebook_access_token", value: accessToken },
        update: { value: accessToken }
      });

      await prisma.systemSetting.upsert({
        where: { key: "facebook_ad_account_id" },
        create: { key: "facebook_ad_account_id", value: adAccountId },
        update: { value: adAccountId }
      });

      await prisma.systemSetting.upsert({
        where: { key: "facebook_page_id" },
        create: { key: "facebook_page_id", value: pageId },
        update: { value: pageId }
      });

      console.log("✅ Facebook settings saved to database successfully!");
    } catch (dbError: any) {
      console.error("Database save failed:", dbError);
      throw new Error("فشل حفظ الإعدادات في قاعدة البيانات");
    }

    // Try to update .env file (works in development only)
    try {
      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      
      try {
        envContent = await fs.readFile(envPath, "utf-8");
      } catch (error) {
        console.log(".env file not found, skipping .env update (normal in production)");
      }

      if (envContent) {
        const updates: Record<string, string> = {
          FACEBOOK_ACCESS_TOKEN: accessToken,
          FACEBOOK_AD_ACCOUNT_ID: adAccountId,
          FACEBOOK_PAGE_ID: pageId,
        };

        let newEnvContent = envContent;

        for (const [key, value] of Object.entries(updates)) {
          const regex = new RegExp(`^${key}=.*$`, "m");
          
          if (regex.test(newEnvContent)) {
            newEnvContent = newEnvContent.replace(regex, `${key}="${value}"`);
          } else {
            newEnvContent += `\n${key}="${value}"`;
          }
        }

        await fs.writeFile(envPath, newEnvContent.trim() + "\n", "utf-8");
        console.log("✅ .env file updated");
      }
    } catch (envError) {
      console.log("Could not update .env file (normal in production)");
    }

    // Update process.env in current runtime (for immediate use)
    process.env.FACEBOOK_ACCESS_TOKEN = accessToken;
    process.env.FACEBOOK_AD_ACCOUNT_ID = adAccountId;
    process.env.FACEBOOK_PAGE_ID = pageId;

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error: any) {
    console.error("Failed to save Facebook settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
