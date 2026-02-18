import { redirect } from "next/navigation";
import { validateAdminSession } from "@/lib/admin-auth";
import { GalleryCreationWizard } from "@/components/admin/gallery-creation-wizard";

export default async function NewGalleryPage() {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) redirect("/admin/login");

  return <GalleryCreationWizard />;
}
