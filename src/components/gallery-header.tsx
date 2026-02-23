"use client";

import { useState, useEffect } from "react";
import { Download, Share2 } from "lucide-react";
import type { Gallery } from "@/lib/types";

interface GalleryHeaderProps {
  gallery: Gallery;
  onShareClick: () => void;
}

export function GalleryHeader({ gallery, onShareClick }: GalleryHeaderProps) {
  const [visible, setVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleDownloadAll() {
    if (isDownloading) return;
    
    setIsDownloading(true);

    try {
      console.log("[GalleryHeader] Fetching section URLs for galleryId:", gallery.id);
      const response = await fetch(`/api/download-all-merged?galleryId=${gallery.id}`);
      const data = await response.json();

      console.log("[GalleryHeader] API response:", data);

      if (!response.ok || !data.sections || data.sections.length === 0) {
        console.error("[GalleryHeader] Failed to get section URLs:", data.error);
        setIsDownloading(false);
        return;
      }

      console.log(`[GalleryHeader] Starting ${data.sections.length} downloads`);

      for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        console.log(`[GalleryHeader] Downloading ${i + 1}/${data.sections.length}:`, section.name);
        
        const downloadUrl = `/api/download?url=${encodeURIComponent(section.url)}&name=${encodeURIComponent(section.name)}`;
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = section.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (i < data.sections.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log("[GalleryHeader] All downloads triggered");
    } catch (error) {
      console.error("[GalleryHeader] Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  }

  if (!visible) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300">
      <div className="flex items-center justify-between px-4 md:px-12 py-2.5 md:py-3">
        <div className="min-w-0 flex-1 mr-3 flex items-center gap-2 md:gap-3">
          <p className="text-xs md:text-sm font-medium tracking-wide uppercase truncate">
            {gallery.client_name}
          </p>
          <span className="text-xs md:text-sm text-muted-foreground">|</span>
          <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground truncate">
            Shir Yadgar Photography
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {(gallery.zip_gallery_url || gallery.zip_originals_url || gallery.zip_highlights_url) && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download all"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onShareClick}
            className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md hover:bg-secondary transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
