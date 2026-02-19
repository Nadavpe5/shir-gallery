"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryAsset, GridStyle, GridSize, GridSpacing } from "@/lib/types";
import { ImageOverlay } from "./image-overlay";

interface GridSettings {
  style: GridStyle;
  size: GridSize;
  spacing: GridSpacing;
}

interface GalleryGridProps {
  assets: GalleryAsset[];
  onImageClick: (index: number) => void;
  indexOffset: number;
  gridSettings?: GridSettings;
  fontClass?: string;
}

export function GalleryGrid({
  assets,
  onImageClick,
  indexOffset,
  gridSettings,
  fontClass,
}: GalleryGridProps) {
  if (assets.length === 0) return null;

  const aspect = gridSettings?.style === "horizontal" ? "aspect-[4/3]" : "aspect-[3/4]";
  const cols = gridSettings?.size === "large"
    ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  const gap = gridSettings?.spacing === "large" ? "gap-5 md:gap-6" : "gap-3 md:gap-4";
  const serifClass = fontClass || "font-serif";

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
          {assets.length} Photographs
        </p>
        <h2 className={`${serifClass} text-2xl md:text-4xl font-bold`}>
          Full Gallery
        </h2>
        <div className="w-px h-6 md:h-8 bg-sage/40 mx-auto mt-4 md:mt-5" />
      </motion.div>

      <div className={`grid ${cols} ${gap}`}>
        {assets.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
            className={`relative ${aspect} cursor-pointer group overflow-hidden rounded-sm md:rounded-none animate-shimmer`}
            onClick={() => onImageClick(indexOffset + i)}
          >
            <ImageOverlay
              downloadUrl={asset.full_url}
              filename={asset.filename || undefined}
            />
            <Image
              src={asset.web_url}
              alt={asset.filename || `Photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
