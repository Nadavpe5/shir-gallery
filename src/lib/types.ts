export type CoverLayout = "full" | "center" | "left" | "minimal";
export type CoverFit = "fill" | "fit";
export type CoverFocusPoint = "top" | "center" | "bottom";
export type TypographyPreset = "sans" | "serif" | "modern" | "timeless" | "bold" | "subtle";
export type ColorTheme = "light" | "gold" | "rose" | "terracotta" | "olive" | "sea" | "dark";
export type GridStyle = "vertical" | "horizontal" | "masonry";
export type GridSize = "regular" | "large";
export type GridSpacing = "regular" | "large";

export interface DesignSettings {
  cover: CoverLayout;
  coverFit: CoverFit;
  coverFocusPoint: CoverFocusPoint;
  typography: TypographyPreset;
  color: ColorTheme;
  gridStyle: GridStyle;
  gridSize: GridSize;
  gridSpacing: GridSpacing;
}

export const DEFAULT_DESIGN: DesignSettings = {
  cover: "full",
  coverFit: "fill",
  coverFocusPoint: "top",
  typography: "serif",
  color: "light",
  gridStyle: "vertical",
  gridSize: "regular",
  gridSpacing: "regular",
};

export interface Gallery {
  id: string;
  slug: string;
  client_name: string;
  shoot_title: string;
  subtitle: string | null;
  location: string | null;
  shoot_date: string | null;
  password_hash: string;
  cover_image_url: string | null;
  expires_at: string;
  created_at: string;
  zip_url: string | null;
  edited_count: number;
  originals_count: number;
  status: "draft" | "published";
  design_settings: DesignSettings;
}

export interface GalleryAsset {
  id: string;
  gallery_id: string;
  web_url: string;
  full_url: string;
  type: "highlight" | "gallery" | "original";
  sort_order: number;
  filename: string | null;
  created_at: string;
}

export interface GallerySession {
  id: string;
  gallery_id: string;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  ip_address: string | null;
  user_agent: string | null;
}

export interface GalleryEvent {
  id: string;
  gallery_id: string;
  session_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GalleryWithAssets extends Gallery {
  highlights: GalleryAsset[];
  gallery: GalleryAsset[];
  originals: GalleryAsset[];
}
