import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/settings/facebook
 * استرجاع إعدادات Facebook من .env
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read current values from .env (not showing the full token for security)
    const settings = {
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN 
        ? `${process.env.FACEBOOK_ACCESS_TOKEN.slice(0, 20)}...` 
        : "",
      adAccountId: process.env.FACEBOOK_AD_ACCOUNT_ID || "",
      pageId: process.env.FACEBOOK_PAGE_ID || "",
      hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
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
 * حفظ إعدادات Facebook في .env
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

    // Path to .env file
    const envPath = path.join(process.cwd(), ".env");

    // Read current .env file
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch (error) {
      // If .env doesn't exist, create it
      console.log(".env file not found, creating new one");
    }

    // Update or add Facebook settings
    const updates: Record<string, string> = {
      FACEBOOK_ACCESS_TOKEN: accessToken,
      FACEBOOK_AD_ACCOUNT_ID: adAccountId,
      FACEBOOK_PAGE_ID: pageId,
    };

    let newEnvContent = envContent;

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      
      if (regex.test(newEnvContent)) {
        // Update existing value
        newEnvContent = newEnvContent.replace(regex, `${key}="${value}"`);
      } else {
        // Add new value
        newEnvContent += `\n${key}="${value}"`;
      }
    }

    // Write back to .env
    await fs.writeFile(envPath, newEnvContent.trim() + "\n", "utf-8");

    // Update process.env in current runtime (for immediate use)
    process.env.FACEBOOK_ACCESS_TOKEN = accessToken;
    process.env.FACEBOOK_AD_ACCOUNT_ID = adAccountId;
    process.env.FACEBOOK_PAGE_ID = pageId;

    console.log("✅ Facebook settings saved successfully!");

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
