"use client";

import { useState, useMemo } from "react";
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
};

interface GalleryContentProps {
  gallery: GalleryWithAssets;
  galleryUrl: string;
}

export function GalleryContent({ gallery, galleryUrl }: GalleryContentProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-background" data-theme={ds.color}>
      <GalleryHeader
        gallery={gallery}
        onShareClick={() => setShareOpen(true)}
      />

      <HeroSection gallery={gallery} daysRemaining={daysRemaining} fontClass={fontClass} />

      <MarqueeTicker gallery={gallery} daysRemaining={daysRemaining} />

      <HighlightsSection
        assets={gallery.highlights}
        onImageClick={(i) => openViewer(highlightOffset + i)}
        gridSettings={gridSettings}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <GalleryGrid
        assets={gallery.gallery}
        onImageClick={openViewer}
        indexOffset={galleryOffset}
        gridSettings={gridSettings}
        fontClass={fontClass}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <OriginalsSection
        assets={gallery.originals}
        onImageClick={openViewer}
        indexOffset={originalsOffset}
        gridSettings={gridSettings}
      />

      <div className="mx-3 md:mx-16 lg:mx-24 border-t border-border" />

      <DownloadButton zipUrl={gallery.zip_url} />

      <footer className="border-t border-border py-8 md:py-10 px-5 md:px-16 flex flex-col items-center gap-2.5">
        <img src="/camera-nav.png" alt="Shir Yadgar Photography" className="w-7 h-7 md:w-8 md:h-8 opacity-40 object-contain" />
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
      />

      <BackToTop />
    </main>
  );
}
