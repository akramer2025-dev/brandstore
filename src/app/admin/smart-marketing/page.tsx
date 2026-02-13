import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmartMarketingClient } from "./SmartMarketingClient";

export default async function SmartMarketingPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch data for all marketing features
  const [campaigns, analytics, orders, keywords] = await Promise.all([
    prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.websiteAnalytics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.seoKeyword.findMany({
      orderBy: { searchVolume: "desc" },
    }),
  ]);

  return (
    <SmartMarketingClient 
      campaigns={campaigns} 
      analytics={analytics} 
      orders={orders}
      keywords={keywords}
    />
  );
}