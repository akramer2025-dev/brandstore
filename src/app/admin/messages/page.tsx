import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MessagesPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // تم نقل محادثات العملاء إلى مركز المحادثات والرسائل المتكامل
  redirect("/admin/messages-center");
}
