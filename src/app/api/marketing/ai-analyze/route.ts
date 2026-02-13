import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiOptimizer } from "@/lib/ai-campaign-optimizer";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const performances = await aiOptimizer.analyzeCampaigns();

    return NextResponse.json(performances);
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "فشل تحليل الحملات" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // تطبيق التحسينات التلقائية
    await aiOptimizer.applyAutoOptimizations();

    return NextResponse.json({ success: true, message: "تم تطبيق التحسينات بنجاح" });
  } catch (error) {
    console.error("Auto-optimization error:", error);
    return NextResponse.json({ error: "فشل تطبيق التحسينات" }, { status: 500 });
  }
}
