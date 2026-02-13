import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdsFixerClient } from "./AdsFixerClient";

export default async function AdsFixerPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return <AdsFixerClient />;
}