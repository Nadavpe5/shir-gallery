import { redirect } from "next/navigation";
import { validateAdminSession } from "@/lib/admin-auth";
import { GalleryEditor } from "@/components/admin/gallery-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryEditorPage({ params }: PageProps) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const { id } = await params;
  return <GalleryEditor galleryId={id} />;
}
