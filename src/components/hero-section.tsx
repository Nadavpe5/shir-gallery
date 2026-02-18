"use client";

import { motion } from "framer-motion";
import { Download, MapPin, Calendar, Clock } from "lucide-react";
import type { Gallery } from "@/lib/types";

interface HeroSectionProps {
  gallery: Gallery;
  daysRemaining: number;
}

export function HeroSection({ gallery, daysRemaining }: HeroSectionProps) {
  const formattedDate = gallery.shoot_date
    ? new Date(gallery.shoot_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative min-h-[90vh] flex items-end">
      {gallery.cover_image_url && (
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${gallery.cover_image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>
      )}

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/70 mb-6">
            {gallery.shoot_title}
          </p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-6 font-bold">
            {gallery.client_name.split("&").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="font-sans font-extralight">&amp;</span>
                )}
              </span>
            ))}
          </h1>

          {gallery.subtitle && (
            <p className="font-serif text-lg md:text-xl text-white/70 max-w-xl mb-8">
              {gallery.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 text-xs tracking-wide text-white/60 mb-10">
            {gallery.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {gallery.location}
              </span>
            )}
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
            {daysRemaining > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Available for {daysRemaining} days
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {gallery.zip_url && (
              <a
                href={gallery.zip_url}
                download
                className="inline-flex items-center gap-2 bg-white text-black tracking-[0.15em] uppercase text-[11px] font-medium px-7 py-3 transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                Download All
              </a>
            )}
            <span className="text-[11px] tracking-wide text-white/50">
              {gallery.edited_count} edited + {gallery.originals_count}{" "}
              originals
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
