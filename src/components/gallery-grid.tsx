"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryAsset } from "@/lib/types";

interface GalleryGridProps {
  assets: GalleryAsset[];
  onImageClick: (index: number) => void;
  indexOffset: number;
}

export function GalleryGrid({
  assets,
  onImageClick,
  indexOffset,
}: GalleryGridProps) {
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
          {assets.length} Photographs
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold">
          Full Gallery
        </h2>
        <div className="w-px h-8 bg-sage/40 mx-auto mt-5" />
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {assets.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
            className="relative aspect-[3/4] cursor-pointer group overflow-hidden animate-shimmer"
            onClick={() => onImageClick(indexOffset + i)}
          >
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
