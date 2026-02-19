"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { GalleryAsset, GridStyle, GridSize, GridSpacing } from "@/lib/types";
import { ImageOverlay } from "./image-overlay";

interface GridSettings {
  style: GridStyle;
  size: GridSize;
  spacing: GridSpacing;
}

interface OriginalsSectionProps {
  assets: GalleryAsset[];
  onImageClick: (index: number) => void;
  indexOffset: number;
  gridSettings?: GridSettings;
}

const BATCH_SIZE = 20;

export function OriginalsSection({
  assets,
  onImageClick,
  indexOffset,
  gridSettings,
}: OriginalsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  if (assets.length === 0) return null;

  const visible = assets.slice(0, visibleCount);
  const hasMore = visibleCount < assets.length;

  return (
    <section className="px-3 md:px-16 lg:px-24 py-14 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 md:mb-14"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          {assets.length} Unedited Photographs
        </p>
        <h2 className="font-serif text-2xl md:text-4xl font-bold">
          Originals
        </h2>
        <div className="w-px h-6 md:h-8 bg-sage/40 mx-auto mt-4 md:mt-5" />
      </motion.div>

      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 ${gridSettings?.spacing === "large" ? "gap-5 md:gap-6" : "gap-3 md:gap-4"}`}>
        {visible.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: (i % 10) * 0.04 }}
            className="relative aspect-[3/2] cursor-pointer group overflow-hidden animate-shimmer"
            onClick={() => onImageClick(indexOffset + i)}
          >
            <ImageOverlay
              downloadUrl={asset.full_url}
              filename={asset.filename || undefined}
            />
            <Image
              src={asset.web_url}
              alt={asset.filename || `Original ${i + 1}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground/40 pb-1 transition-colors"
          >
            Load More
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
