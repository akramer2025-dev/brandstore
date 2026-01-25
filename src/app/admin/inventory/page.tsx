import { redirect } from "next/navigation";

export default async function AdminInventoryPage() {
  // Redirect to the unified warehouse page
  redirect("/admin/warehouse?tab=inventory");
}
