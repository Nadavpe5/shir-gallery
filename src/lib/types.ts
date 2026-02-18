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
