import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarketingPageClient } from "./MarketingPageClient";

export default async function MarketingPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [campaigns, keywords, analytics] = await Promise.all([
    prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.seoKeyword.findMany({
      orderBy: { searchVolume: "desc" },
    }),
    prisma.websiteAnalytics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return <MarketingPageClient campaigns={campaigns} keywords={keywords} analytics={analytics} />;
}
