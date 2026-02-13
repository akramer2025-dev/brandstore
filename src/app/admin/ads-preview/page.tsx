import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdsPreviewClient } from "./AdsPreviewClient";

export default async function AdsPreviewPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return <AdsPreviewClient />;
}