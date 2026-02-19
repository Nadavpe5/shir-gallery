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
    <section className="px-3 md:px-16 lg:px-24 py-14 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 md:mb-14"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Curated Selection
        </p>
        <h2 className="font-serif text-2xl md:text-4xl font-bold">
          Highlights
        </h2>
        <div className="w-px h-6 md:h-8 bg-sage/40 mx-auto mt-4 md:mt-5" />
      </motion.div>

      {gridSettings?.style === "editorial" ? (
        <div className={`grid grid-cols-2 md:grid-cols-3 ${gridSettings?.spacing === "large" ? "gap-4 md:gap-5" : "gap-2 md:gap-3"}`}>
          {assets.map((asset, i) => {
            const cycle = Math.floor(i / 5);
            const pos = i % 5;
            const flip = cycle % 2 === 1;
            const isHero = pos === 0;
            const spanClass = isHero
              ? flip
                ? "md:col-start-2 md:col-span-2 md:row-span-2 col-span-2"
                : "md:col-span-2 md:row-span-2 col-span-2"
              : "";
            const aspectClass = isHero ? "aspect-[4/5]" : "aspect-square";
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className={`relative ${aspectClass} ${spanClass} cursor-pointer group overflow-hidden`}
                onClick={() => onImageClick(i)}
              >
                <ImageOverlay
                  downloadUrl={asset.full_url}
                  filename={asset.filename || undefined}
                />
                <Image
                  src={asset.web_url}
                  alt={asset.filename || `Highlight ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading={i < 4 ? "eager" : "lazy"}
                />
              </motion.div>
            );
          })}
        </div>
      ) : gridSettings?.style === "masonry" ? (
        <div className={`columns-2 md:columns-3 ${gridSettings?.spacing === "large" ? "gap-5 md:gap-8" : "gap-4 md:gap-6"}`}>
          {assets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="relative break-inside-avoid mb-4 md:mb-6 cursor-pointer group overflow-hidden"
              onClick={() => onImageClick(i)}
            >
              <ImageOverlay
                downloadUrl={asset.full_url}
                filename={asset.filename || undefined}
              />
              <Image
                src={asset.web_url}
                alt={asset.filename || `Highlight ${i + 1}`}
                width={800}
                height={1200}
                unoptimized
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading={i < 4 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
        </div>
      ) : (
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
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading={i < 4 ? "eager" : "lazy"}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
