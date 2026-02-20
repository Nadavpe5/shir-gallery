import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { validateSession } from "@/lib/auth";
import { validateAdminSession } from "@/lib/admin-auth";
import { getGalleryWithAssets, getGalleryBySlug } from "@/lib/queries";
import { GalleryContent } from "@/components/gallery-content";
import { ExpiredPage } from "@/components/expired-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  return {
    title: gallery ? `${gallery.client_name} | Shir Yadgar Photography` : "Gallery",
    robots: { index: false, follow: false },
  };
}

export default async function GalleryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const isPreview = sp.preview === "1";
  const isAdmin = isPreview ? await validateAdminSession() : false;

  const isExpired = new Date(gallery.expires_at) < new Date();
  if (isExpired && !isAdmin) {
    return <ExpiredPage clientName={gallery.client_name} />;
  }

  if (!isAdmin) {
    const session = await validateSession(slug);
    if (!session) {
      redirect(`/g/${slug}/login`);
    }
  }

  const galleryWithAssets = await getGalleryWithAssets(slug);
  if (!galleryWithAssets) notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const galleryUrl = `${protocol}://${host}/g/${slug}`;

  return <GalleryContent gallery={galleryWithAssets} galleryUrl={galleryUrl} />;
}
