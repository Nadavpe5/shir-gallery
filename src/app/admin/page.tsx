import { redirect } from "next/navigation";
import { validateAdminSession } from "@/lib/admin-auth";
import { CollectionsDashboard } from "@/components/admin/collections-dashboard";

export default async function AdminPage() {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) redirect("/admin/login");

  return <CollectionsDashboard />;
}
