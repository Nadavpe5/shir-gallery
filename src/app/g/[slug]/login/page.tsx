import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateSession } from "@/lib/auth";
import { getGalleryBySlug } from "@/lib/queries";
import { PasswordGate } from "@/components/password-gate";
import { ExpiredPage } from "@/components/expired-page";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  return {
    title: gallery
      ? `Enter Password | ${gallery.client_name}`
      : "Gallery Login",
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: PageProps) {
  const { slug } = await params;

  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const isExpired = new Date(gallery.expires_at) < new Date();
  if (isExpired) {
    return <ExpiredPage clientName={gallery.client_name} />;
  }

  const session = await validateSession(slug);
  if (session) {
    redirect(`/g/${slug}`);
  }

  return <PasswordGate slug={slug} clientName={gallery.client_name} />;
}
