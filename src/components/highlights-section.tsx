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

interface HighlightsSectionProps {
  assets: GalleryAsset[];
  onImageClick: (index: number) => void;
  gridSettings?: GridSettings;
}

export function HighlightsSection({
  assets,
  onImageClick,
  gridSettings,
}: HighlightsSectionProps) {
  if (assets.length === 0) return null;

  return (
    <section className="px-8 md:px-16 lg:px-24 py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Curated Selection
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold">
          Highlights
        </h2>
        <div className="w-px h-8 bg-sage/40 mx-auto mt-5" />
      </motion.div>

      <div className={`grid grid-cols-2 md:grid-cols-3 ${gridSettings?.spacing === "large" ? "gap-5 md:gap-8" : "gap-4 md:gap-6"}`}>
        {assets.map((asset, i) => {
          const isLarge = i % 5 === 0;
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className={`relative cursor-pointer group overflow-hidden ${
                isLarge ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => onImageClick(i)}
            >
              <div
                className={`relative w-full animate-shimmer ${
                  isLarge ? "aspect-[4/5]" : "aspect-[3/4]"
                }`}
              >
                <ImageOverlay
                  downloadUrl={asset.full_url}
                  filename={asset.filename || undefined}
                />
                <Image
                  src={asset.web_url}
                  alt={asset.filename || `Highlight ${i + 1}`}
                  fill
                  sizes={
                    isLarge
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading={i < 4 ? "eager" : "lazy"}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
