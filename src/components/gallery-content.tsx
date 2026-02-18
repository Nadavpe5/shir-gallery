"use client";

import { useState, useMemo } from "react";
import type { GalleryWithAssets } from "@/lib/types";
import { HeroSection } from "./hero-section";
import { MarqueeTicker } from "./marquee-ticker";
import { HighlightsSection } from "./highlights-section";
import { GalleryGrid } from "./gallery-grid";
import { OriginalsSection } from "./originals-section";
import { DownloadButton } from "./download-button";
import { ImageViewer } from "./image-viewer";

interface GalleryContentProps {
  gallery: GalleryWithAssets;
}

export function GalleryContent({ gallery }: GalleryContentProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

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

  return (
    <main className="min-h-screen bg-background">
      <HeroSection gallery={gallery} daysRemaining={daysRemaining} />

      <MarqueeTicker gallery={gallery} daysRemaining={daysRemaining} />

      <HighlightsSection
        assets={gallery.highlights}
        onImageClick={(i) => openViewer(highlightOffset + i)}
      />

      <div className="mx-8 md:mx-16 lg:mx-24 border-t border-border" />

      <GalleryGrid
        assets={gallery.gallery}
        onImageClick={openViewer}
        indexOffset={galleryOffset}
      />

      <div className="mx-8 md:mx-16 lg:mx-24 border-t border-border" />

      <OriginalsSection
        assets={gallery.originals}
        onImageClick={openViewer}
        indexOffset={originalsOffset}
      />

      <div className="mx-8 md:mx-16 lg:mx-24 border-t border-border" />

      <DownloadButton zipUrl={gallery.zip_url} />

      <footer className="border-t border-border py-10 px-8 md:px-16 text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
          Shir Yadgar Perez Photography
        </p>
      </footer>

      <ImageViewer
        slides={allSlides}
        open={viewerOpen}
        index={viewerIndex}
        onClose={() => setViewerOpen(false)}
        onIndexChange={setViewerIndex}
      />
    </main>
  );
}
