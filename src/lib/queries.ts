import "server-only";
import { supabaseAdmin } from "./supabase-server";
import type { Gallery, GalleryAsset, GalleryWithAssets, DesignSettings } from "./types";
import { DEFAULT_DESIGN } from "./types";

function parseDesignSettings(raw: unknown): DesignSettings {
  if (typeof raw === "object" && raw !== null && "gridStyle" in raw) {
    return { ...DEFAULT_DESIGN, ...raw } as DesignSettings;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as Partial<DesignSettings>;
      return { ...DEFAULT_DESIGN, ...parsed } as DesignSettings;
    } catch {
      return DEFAULT_DESIGN;
    }
  }
  return DEFAULT_DESIGN;
}

export async function getGalleryBySlug(
  slug: string
): Promise<Gallery | null> {
  const { data, error } = await supabaseAdmin
    .from("galleries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  const gallery = data as Gallery;
  gallery.design_settings = parseDesignSettings(gallery.design_settings);
  return gallery;
}

export async function getGalleryAssets(
  galleryId: string
): Promise<GalleryAsset[]> {
  const { data, error } = await supabaseAdmin
    .from("gallery_assets")
    .select("*")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as GalleryAsset[];
}

export async function getGalleryWithAssets(
  slug: string
): Promise<GalleryWithAssets | null> {
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return null;

  const assets = await getGalleryAssets(gallery.id);

  return {
    ...gallery,
    highlights: assets.filter((a) => a.type === "highlight"),
    gallery: assets.filter((a) => a.type === "gallery"),
    originals: assets.filter((a) => a.type === "original"),
  };
}
