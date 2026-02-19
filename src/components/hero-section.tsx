"use client";

import { motion } from "framer-motion";
import { Download, MapPin, Calendar, Clock } from "lucide-react";
import type { Gallery, CoverLayout, CoverFit, CoverFocusPoint } from "@/lib/types";

interface HeroSectionProps {
  gallery: Gallery;
  coverUrl: string | null;
  daysRemaining: number;
  fontClass?: string;
}

export function HeroSection({ gallery, coverUrl, daysRemaining, fontClass }: HeroSectionProps) {
  const formattedDate = gallery.shoot_date
    ? new Date(gallery.shoot_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const cover: CoverLayout = gallery.design_settings?.cover || "full";
  const coverFit: CoverFit = gallery.design_settings?.coverFit || "fill";
  const focusPoint: CoverFocusPoint = gallery.design_settings?.coverFocusPoint || "top";
  const focusClass = focusPoint === "top" ? "bg-top" : focusPoint === "bottom" ? "bg-bottom" : "bg-center";
  const isFit = coverFit === "fit";
  const serifClass = fontClass || "font-serif";

  const nameContent = gallery.client_name.split("&").map((part, i, arr) => (
    <span key={i}>
      {part}
      {i < arr.length - 1 && (
        <span className="font-sans font-extralight">&amp;</span>
      )}
    </span>
  ));

  const metaContent = (textColor: string) => (
    <div className={`flex flex-wrap items-center gap-3 md:gap-5 text-[11px] md:text-xs tracking-wide ${textColor}`}>
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
  );

  const anim = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

  const bgStyle = coverUrl
    ? { backgroundImage: `url(${coverUrl})` }
    : undefined;

  const zipName = gallery.zip_url?.split("/").pop() || "gallery.zip";

  if (cover === "center") {
    return (
      <section className="py-14 md:py-32 px-5 md:px-16 lg:px-24 text-center">
        <motion.div {...anim} className="max-w-3xl mx-auto">
          {bgStyle && (
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] mb-8 md:mb-12 overflow-hidden rounded-lg md:rounded-none">
              {isFit ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={bgStyle} />
                  <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={bgStyle} />
                </>
              ) : (
                <div className={`w-full h-full bg-cover ${focusClass}`} style={bgStyle} />
              )}
            </div>
          )}
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 md:mb-6">
            {gallery.shoot_title}
          </p>
          <h1 className={`${serifClass} text-4xl md:text-7xl tracking-tight mb-4 md:mb-6 font-bold text-foreground`}>
            {nameContent}
          </h1>
          {gallery.subtitle && (
            <p className={`${serifClass} text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8`}>
              {gallery.subtitle}
            </p>
          )}
          <div className="flex justify-center mb-10">
            {metaContent("text-muted-foreground/60")}
          </div>
          {gallery.zip_url && (
            <a
              href={`/api/download?url=${encodeURIComponent(gallery.zip_url)}&name=${encodeURIComponent(zipName)}`}
              className="inline-flex items-center gap-2 bg-sage text-sage-foreground tracking-[0.15em] uppercase text-[11px] font-medium px-7 py-3 transition-all hover:opacity-85"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </a>
          )}
        </motion.div>
      </section>
    );
  }

  if (cover === "left") {
    return (
      <section className="min-h-[70dvh] md:min-h-[80vh] flex flex-col md:flex-row w-full">
        <motion.div
          {...anim}
          className="flex-1 flex flex-col justify-center px-5 md:px-16 lg:px-20 py-10 md:py-24"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 md:mb-6">
            {gallery.shoot_title}
          </p>
          <h1 className={`${serifClass} text-4xl md:text-6xl lg:text-7xl tracking-tight mb-4 md:mb-6 font-bold text-foreground`}>
            {nameContent}
          </h1>
          {gallery.subtitle && (
            <p className={`${serifClass} text-lg md:text-xl text-muted-foreground max-w-md mb-8`}>
              {gallery.subtitle}
            </p>
          )}
          <div className="mb-10">{metaContent("text-muted-foreground/60")}</div>
          {gallery.zip_url && (
            <a
              href={`/api/download?url=${encodeURIComponent(gallery.zip_url)}&name=${encodeURIComponent(zipName)}`}
              className="inline-flex items-center gap-2 bg-sage text-sage-foreground tracking-[0.15em] uppercase text-[11px] font-medium px-7 py-3 transition-all hover:opacity-85 self-start"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </a>
          )}
        </motion.div>
        {bgStyle && (
          <div className="relative flex-1 min-h-[50vh] md:min-h-0 overflow-hidden">
            {isFit ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={bgStyle} />
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={bgStyle} />
              </>
            ) : (
              <div className={`absolute inset-0 bg-cover ${focusClass}`} style={bgStyle} />
            )}
          </div>
        )}
      </section>
    );
  }

  if (cover === "minimal") {
    return (
      <section className="py-16 md:py-40 px-5 md:px-16 lg:px-24">
        <motion.div {...anim} className="max-w-3xl">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 md:mb-6">
            {gallery.shoot_title}
          </p>
          <h1 className={`${serifClass} text-5xl md:text-8xl lg:text-9xl tracking-tight mb-6 md:mb-8 font-bold text-foreground`}>
            {nameContent}
          </h1>
          {gallery.subtitle && (
            <p className={`${serifClass} text-xl md:text-2xl text-muted-foreground max-w-xl mb-10`}>
              {gallery.subtitle}
            </p>
          )}
          <div className="mb-10">{metaContent("text-muted-foreground/60")}</div>
          {gallery.zip_url && (
            <a
              href={`/api/download?url=${encodeURIComponent(gallery.zip_url)}&name=${encodeURIComponent(zipName)}`}
              className="inline-flex items-center gap-2 bg-sage text-sage-foreground tracking-[0.15em] uppercase text-[11px] font-medium px-7 py-3 transition-all hover:opacity-85"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </a>
          )}
        </motion.div>
      </section>
    );
  }

  // Default "full" layout -- full-bleed cover image
  return (
    <section className="relative w-full min-h-[60dvh] md:min-h-[75vh] flex items-end overflow-hidden">
      {bgStyle && isFit ? (
        <>
          <div className="absolute inset-0 z-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={bgStyle} />
          <div className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat" style={bgStyle} />
        </>
      ) : bgStyle ? (
        <div className={`absolute inset-0 z-0 bg-cover ${focusClass}`} style={bgStyle} />
      ) : null}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="relative z-10 w-full px-5 md:px-16 lg:px-24 pb-10 md:pb-24">
        <motion.div {...anim} className="max-w-4xl">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/70 mb-4 md:mb-6">
            {gallery.shoot_title}
          </p>
          <h1 className={`${serifClass} text-4xl md:text-7xl lg:text-8xl text-white tracking-tight mb-4 md:mb-6 font-bold`}>
            {nameContent}
          </h1>
          {gallery.subtitle && (
            <p className={`${serifClass} text-lg md:text-xl text-white/70 max-w-xl mb-8`}>
              {gallery.subtitle}
            </p>
          )}
          <div className="mb-8 md:mb-10">{metaContent("text-white/60")}</div>
          {gallery.zip_url && (
            <a
              href={`/api/download?url=${encodeURIComponent(gallery.zip_url)}&name=${encodeURIComponent(zipName)}`}
              className="inline-flex items-center gap-2 bg-white text-black tracking-[0.15em] uppercase text-[11px] font-medium px-7 py-3 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
