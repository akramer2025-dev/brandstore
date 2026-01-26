import { redirect } from "next/navigation";

export default async function AdminMaterialsPage() {
  redirect("/admin/warehouse?tab=materials");
}

