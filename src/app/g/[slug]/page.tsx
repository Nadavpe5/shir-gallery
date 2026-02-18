import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateSession } from "@/lib/auth";
import { getGalleryWithAssets, getGalleryBySlug } from "@/lib/queries";
import { GalleryContent } from "@/components/gallery-content";
import { ExpiredPage } from "@/components/expired-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  return {
    title: gallery ? `${gallery.client_name} | Shir Yadgar Perez` : "Gallery",
    robots: { index: false, follow: false },
  };
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;

  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const isExpired = new Date(gallery.expires_at) < new Date();
  if (isExpired) {
    return <ExpiredPage clientName={gallery.client_name} />;
  }

  const session = await validateSession(slug);
  if (!session) {
    redirect(`/g/${slug}/login`);
  }

  const galleryWithAssets = await getGalleryWithAssets(slug);
  if (!galleryWithAssets) notFound();

  return <GalleryContent gallery={galleryWithAssets} />;
}
