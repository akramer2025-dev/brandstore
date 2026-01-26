import { redirect } from "next/navigation";

export default async function AdminProductionPage() {
  redirect("/admin/warehouse?tab=production");
}

