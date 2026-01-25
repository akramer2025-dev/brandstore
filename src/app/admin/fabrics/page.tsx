import { redirect } from "next/navigation";

export default async function AdminFabricsPage() {
  redirect("/admin/warehouse?tab=fabrics");
}
