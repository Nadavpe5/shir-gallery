"use client";

import { useState, useMemo, useEffect } from "react";
import type { GalleryWithAssets, DesignSettings, TypographyPreset } from "@/lib/types";
import { DEFAULT_DESIGN } from "@/lib/types";
import { HeroSection } from "./hero-section";
import { MarqueeTicker } from "./marquee-ticker";
import { HighlightsSection } from "./highlights-section";
import { GalleryGrid } from "./gallery-grid";
import { OriginalsSection } from "./originals-section";
import { DownloadButton } from "./download-button";
import { ImageViewer } from "./image-viewer";
import { GalleryHeader } from "./gallery-header";
import { ShareModal } from "./share-modal";
import { BackToTop } from "./back-to-top";

const FONT_MAP: Record<TypographyPreset, string> = {
  sans: "font-sans",
  serif: "font-serif",
  modern: "font-[family-name:var(--font-montserrat)]",
  timeless: "font-[family-name:var(--font-cormorant)]",
  bold: "font-[family-name:var(--font-oswald)]",
  subtle: "font-[family-name:var(--font-raleway)]",
  ploni: "font-[family-name:Ploni]",
  elegant: "font-[family-name:var(--font-bodoni)]",
  editorial: "font-[family-name:var(--font-lora)]",
};

interface GalleryContentProps {
  gallery: GalleryWithAssets;
  galleryUrl: string;
}

export function GalleryContent({ gallery, galleryUrl }: GalleryContentProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const preview = window.location.search.includes("preview=1");
    const isPwa = window.matchMedia("(display-mode: standalone)").matches;
    setIsPreview(preview && isPwa);
    if (!preview) return;
    document.documentElement.style.scrollbarWidth = "none";
    const style = document.createElement("style");
    style.textContent = "html::-webkit-scrollbar{display:none}html{-ms-overflow-style:none}";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const daysRemaining = useMemo(() => {
    const exp = new Date(gallery.expires_at);
    const now = new Date();
    return Math.max(
      0,
      Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
  }, [gallery.expires_at]);

  const allSlides = useMemo(() => {
    const all = [
      ...gallery.highlights,
      ...gallery.gallery,
      ...gallery.originals,
    ];
    return all.map((asset) => ({
      src: asset.full_url,
      alt: asset.filename || undefined,
      downloadUrl: asset.full_url,
      filename: asset.filename || undefined,
    }));
  }, [gallery.highlights, gallery.gallery, gallery.originals]);

  const highlightOffset = 0;
  const galleryOffset = gallery.highlights.length;
  const originalsOffset = gallery.highlights.length + gallery.gallery.length;

  function openViewer(index: number) {
    setViewerIndex(index);
    setViewerOpen(true);
  }

  const ds: DesignSettings = { ...DEFAULT_DESIGN, ...gallery.design_settings };
  const fontClass = FONT_MAP[ds.typography] || "font-serif";
  const gridSettings = {
    style: ds.gridStyle,
    size: ds.gridSize,
    spacing: ds.gridSpacing,
  };

  const coverUrl = useMemo(() => {
    if (!gallery.cover_image_url) return null;
    const allAssets = [...gallery.highlights, ...gallery.gallery, ...gallery.originals];
    // Try exact URL match first
    let match = allAssets.find(
      (a) => a.full_url === gallery.cover_image_url || a.web_url === gallery.cover_image_url
    );
    // Fallback: match by filename extracted from cover URL
    if (!match) {
      const coverFilename = gallery.cover_image_url.split("/").pop()?.replace(/^\d+-/, "") || "";
      if (coverFilename) {
        match = allAssets.find((a) => a.filename === coverFilename);
      }
    }
    return match ? match.full_url : gallery.cover_image_url;
  }, [gallery.cover_image_url, gallery.highlights, gallery.gallery, gallery.originals]);

  return (
    <main className="min-h-screen bg-background text-foreground" data-theme={ds.color}>
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-gray-900/90 backdrop-blur-sm px-4 py-2 text-white text-xs">
          <span className="opacity-70">Preview Mode</span>
          <a
            href={`/admin/galleries/${gallery.id}`}
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md transition-colors font-medium"
          >
            Back to Admin
          </a>
        </div>
      )}
      <GalleryHeader
        gallery={gallery}
        onShareClick={() => setShareOpen(true)}
      />

      <HeroSection gallery={gallery} coverUrl={coverUrl} daysRemaining={daysRemaining} fontClass={fontClass} />

      <MarqueeTicker gallery={gallery} daysRemaining={daysRemaining} />

      <HighlightsSection
        assets={gallery.highlights}
        onImageClick={(i) => openViewer(highlightOffset + i)}
        gridSettings={gridSettings}
        fontClass={fontClass}
        galleryId={gallery.id}
        zipHighlightsUrl={gallery.zip_highlights_url}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <GalleryGrid
        assets={gallery.gallery}
        onImageClick={openViewer}
        indexOffset={galleryOffset}
        gridSettings={gridSettings}
        fontClass={fontClass}
        galleryId={gallery.id}
        zipGalleryUrl={gallery.zip_gallery_url}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <OriginalsSection
        assets={gallery.originals}
        onImageClick={openViewer}
        indexOffset={originalsOffset}
        gridSettings={gridSettings}
        fontClass={fontClass}
        galleryId={gallery.id}
        zipOriginalsUrl={gallery.zip_originals_url}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <DownloadButton galleryId={gallery.id} zipUrl={gallery.zip_url} fontClass={fontClass} />

      <footer className="border-t border-border py-8 md:py-10 px-5 md:px-16 flex flex-col items-center gap-2.5">
        <img src="/logo-96.png" alt="Shir Yadgar Photography" width={96} height={75} className="w-20 h-20 md:w-24 md:h-24 opacity-40 object-contain" />
        <p className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
          Shir Yadgar Photography
        </p>
      </footer>

      <ImageViewer
        slides={allSlides}
        open={viewerOpen}
        index={viewerIndex}
        onClose={() => setViewerOpen(false)}
        onIndexChange={setViewerIndex}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        galleryUrl={galleryUrl}
        clientName={gallery.client_name}
        fontClass={fontClass}
      />

      <BackToTop />
    </main>
  );
}
