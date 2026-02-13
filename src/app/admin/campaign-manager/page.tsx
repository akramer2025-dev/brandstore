import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function CampaignManagerPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // تم نقل إدارة الحملات إلى مركز التسويق المتكامل
  redirect("/admin/marketing-center");
}