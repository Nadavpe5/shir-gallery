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

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300">
      <div className="flex items-center justify-between px-6 md:px-12 py-3">
        <div>
          <p className="text-sm font-medium tracking-wide uppercase">
            {gallery.client_name}
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Shir Yadgar Perez
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gallery.zip_url && (
            <a
              href={gallery.zip_url}
              download
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
              aria-label="Download all"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onShareClick}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
