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

const EDITORIAL_CYCLE = 6;

function getEditorialClass(index: number, total: number): string {
  const fullCycles = Math.floor(total / EDITORIAL_CYCLE);
  const trailing = total % EDITORIAL_CYCLE;
  const cycle = Math.floor(index / EDITORIAL_CYCLE);
  const pos = index % EDITORIAL_CYCLE;
  const flip = cycle % 2 === 1;

  if (cycle < fullCycles) {
    if (pos !== 0) return "";
    const base = "col-span-2 row-span-2";
    return flip ? `${base} md:col-start-2` : base;
  }

  const trailIdx = index - fullCycles * EDITORIAL_CYCLE;
  const trailFlip = fullCycles % 2 === 1;

  if (trailing >= 4) {
    if (trailIdx === 0) {
      const base = "col-span-2 row-span-2";
      return trailFlip ? `${base} md:col-start-2` : base;
    }
    return "";
  }

  if (trailing === 1 && trailIdx === 0) {
    return "col-span-2 md:col-span-3";
  }

  if (trailing === 2 && trailIdx === 0) {
    return "col-span-2";
  }

  return "";
}

export function GalleryGrid({
  assets,
  onImageClick,
  indexOffset,
  gridSettings,
  fontClass,
}: GalleryGridProps) {
  if (assets.length === 0) return null;

  const style = gridSettings?.style || "vertical";
  const isMasonry = style === "masonry";
  const isEditorial = style === "editorial";
  const aspect = style === "horizontal" ? "aspect-[4/3]" : "aspect-[3/4]";
  const cols = gridSettings?.size === "large"
    ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  const gap = gridSettings?.spacing === "large" ? "gap-5 md:gap-6" : "gap-3 md:gap-4";
  const masonryCols = gridSettings?.size === "large"
    ? "columns-2 md:columns-2 lg:columns-3"
    : "columns-2 md:columns-3 lg:columns-4";
  const masonryGap = gridSettings?.spacing === "large" ? "gap-5 md:gap-6" : "gap-3 md:gap-4";
  const editorialGap = gridSettings?.spacing === "large" ? "gap-2.5 md:gap-3" : "gap-1.5 md:gap-2";
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

      {isEditorial ? (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 ${editorialGap}`}
          style={{
            gridAutoRows: "clamp(180px, 30vw, 420px)",
            gridAutoFlow: "dense",
          }}
        >
          {assets.map((asset, i) => {
            const spanClass = getEditorialClass(i, assets.length);
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
                className={`relative cursor-pointer group overflow-hidden ${spanClass}`}
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
                  unoptimized
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading={i < 6 ? "eager" : "lazy"}
                />
              </motion.div>
            );
          })}
        </div>
      ) : isMasonry ? (
        <div className={`${masonryCols} ${masonryGap}`}>
          {assets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
              className="relative break-inside-avoid mb-3 md:mb-4 cursor-pointer group overflow-hidden rounded-sm md:rounded-none"
              onClick={() => onImageClick(indexOffset + i)}
            >
              <ImageOverlay
                downloadUrl={asset.full_url}
                filename={asset.filename || undefined}
              />
              <Image
                src={asset.web_url}
                alt={asset.filename || `Photo ${i + 1}`}
                width={800}
                height={1200}
                unoptimized
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      ) : (
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
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
