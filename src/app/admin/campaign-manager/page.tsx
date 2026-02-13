import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CampaignManagerClient } from "./CampaignManagerClient";

export default async function CampaignManagerPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return <CampaignManagerClient />;
}