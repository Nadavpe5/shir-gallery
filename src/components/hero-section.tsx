"use client";

import { motion } from "framer-motion";
import { Download, MapPin, Calendar, Clock } from "lucide-react";
import type { Gallery, CoverLayout, CoverFit } from "@/lib/types";

function hasHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

interface HeroSectionProps {
  gallery: Gallery;
  coverUrl: string | null;
  daysRemaining: number;
  fontClass?: string;
}

export function HeroSection({ gallery, coverUrl, daysRemaining, fontClass }: HeroSectionProps) {
  const isRtl = hasHebrew(gallery.client_name) || hasHebrew(gallery.subtitle || "") || hasHebrew(gallery.shoot_title || "");
  const formattedDate = gallery.shoot_date
    ? new Date(gallery.shoot_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const cover: CoverLayout = gallery.design_settings?.cover || "full";
  const coverFit: CoverFit = gallery.design_settings?.coverFit || "fill";
  const pos = gallery.design_settings?.coverPosition || { x: 50, y: 30 };
  const zoom = gallery.design_settings?.coverZoom ?? 100;
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

  const zipName = gallery.zip_url?.split("/").pop() || "gallery.zip";

  const zoomScale = zoom > 100 ? zoom / 100 : 1;

  const fillStyle = coverUrl
    ? {
        backgroundImage: `url(${coverUrl})`,
        backgroundPosition: `${pos.x}% ${pos.y}%`,
        backgroundSize: "cover" as const,
        backgroundRepeat: "no-repeat" as const,
        transform: zoomScale > 1 ? `scale(${zoomScale})` : undefined,
      }
    : undefined;

  const fitBlurStyle = coverUrl
    ? { backgroundImage: `url(${coverUrl})` }
    : undefined;

  const fitStyle = coverUrl
    ? {
        backgroundImage: `url(${coverUrl})`,
        backgroundSize: "contain" as const,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat" as const,
      }
    : undefined;

  function renderCoverImage() {
    if (!coverUrl) return null;
    if (isFit) {
      return (
        <>
          <div className="absolute inset-0 z-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={fitBlurStyle} />
          <div className="absolute inset-0 z-0" style={fitStyle} />
        </>
      );
    }
    return <div className="absolute inset-0 z-0" style={fillStyle} />;
  }

  if (cover === "center") {
    return (
      <section className="py-14 md:py-32 px-5 md:px-16 lg:px-24 text-center" dir={isRtl ? "rtl" : undefined}>
        <motion.div {...anim} className="max-w-3xl mx-auto">
          {coverUrl && (
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] mb-8 md:mb-12 overflow-hidden rounded-lg md:rounded-none">
              {isFit ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={fitBlurStyle} />
                  <div className="absolute inset-0" style={fitStyle} />
                </>
              ) : (
                <div className="w-full h-full" style={fillStyle} />
              )}
            </div>
          )}
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
      <section className={`flex flex-col md:min-h-[80vh] w-full ${isRtl ? "md:flex-row-reverse" : "md:flex-row"}`} dir={isRtl ? "rtl" : undefined}>
        <motion.div
          {...anim}
          className={`flex-1 flex flex-col justify-center px-5 md:px-16 lg:px-20 py-10 md:py-24 ${isRtl ? "items-end text-right" : ""}`}
        >
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
        {coverUrl && (
          <div className="relative flex-1 min-h-[35dvh] md:min-h-0 overflow-hidden">
            {isFit ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-60" style={fitBlurStyle} />
                <div className="absolute inset-0" style={fitStyle} />
              </>
            ) : (
              <div className="absolute inset-0" style={fillStyle} />
            )}
          </div>
        )}
      </section>
    );
  }

  if (cover === "minimal") {
    return (
      <section className={`py-16 md:py-40 px-5 md:px-16 lg:px-24 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : undefined}>
        <motion.div {...anim} className={`max-w-3xl ${isRtl ? "ml-auto" : ""}`}>
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
    <section className="relative w-full min-h-[35dvh] md:min-h-[75vh] flex items-end overflow-hidden" dir={isRtl ? "rtl" : undefined}>
      {renderCoverImage()}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className={`relative z-10 w-full px-4 md:px-16 lg:px-24 pb-5 md:pb-24 ${isRtl ? "text-right" : ""}`}>
        <motion.div {...anim} className={`max-w-4xl ${isRtl ? "ml-auto" : ""}`}>
          <div className="flex flex-col w-full">
            <h1 className={`${serifClass} text-3xl md:text-7xl lg:text-8xl text-white tracking-tight mb-2 md:mb-6 font-bold`} style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {nameContent}
            </h1>
            {gallery.subtitle && (
              <p className={`${serifClass} text-sm md:text-xl text-white/70 tracking-tight mb-4 md:mb-8`} style={{ textAlign: isRtl ? 'right' : 'left' }}>
                {gallery.subtitle}
              </p>
            )}
          </div>
          <div className="mb-4 md:mb-10">{metaContent("text-white/60")}</div>
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
