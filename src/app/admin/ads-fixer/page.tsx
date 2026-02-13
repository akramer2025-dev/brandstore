import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdsFixerPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // تم نقل إصلاح الإعلانات إلى مركز التسويق المتكامل
  redirect("/admin/marketing-center");
}