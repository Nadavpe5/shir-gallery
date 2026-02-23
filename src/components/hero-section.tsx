"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
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
  const textAlign = gallery.design_settings?.coverTextAlign || "left";
  const pos = gallery.design_settings?.coverPosition || { x: 50, y: 30 };
  const zoom = gallery.design_settings?.coverZoom ?? 100;
  const isFit = coverFit === "fit";
  const serifClass = fontClass || "font-serif";

  // Flatten nameContent to avoid nested span alignment issues
  const nameContent = gallery.client_name.replace(/&/g, " & ");

  const metaContent = (textColor: string, alignment?: string) => {
    const justifyClass = alignment === 'left' ? 'justify-center' : alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : '';
    return (
      <div className={`flex flex-wrap gap-3 md:gap-5 text-[11px] md:text-xs tracking-wide ${textColor} ${justifyClass}`} style={{ alignItems: 'center' }}>
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
  };

  const anim = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

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
          <div className="mb-10">
            {metaContent("text-muted-foreground/60", "center")}
          </div>
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
      <section className={`py-16 md:py-40 px-5 md:px-16 lg:px-24`} dir={isRtl ? "rtl" : undefined}>
        <motion.div {...anim}>
          <div className={`max-w-3xl ${textAlign === 'center' ? 'mx-auto text-center' : textAlign === 'right' ? 'ml-auto text-right' : 'text-left'}`}>
            <h1 className={`${serifClass} text-5xl md:text-8xl lg:text-9xl tracking-tight mb-6 md:mb-8 font-bold text-foreground`}>
              {nameContent}
            </h1>
            {gallery.subtitle && (
              <p className={`${serifClass} text-xl md:text-2xl text-muted-foreground max-w-xl mb-10`}>
                {gallery.subtitle}
              </p>
            )}
          </div>
          <div className="mb-10">{metaContent("text-muted-foreground/60", textAlign)}</div>
        </motion.div>
      </section>
    );
  }

  // Default "full" layout -- full-bleed cover image
  return (
    <section className="relative w-full min-h-[35dvh] md:min-h-[75vh] flex items-end overflow-hidden" dir={isRtl ? "rtl" : undefined}>
      {renderCoverImage()}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* All content in one container for proper alignment */}
      <div className={`absolute bottom-5 md:bottom-10 z-10 px-4 md:px-16 lg:px-24 ${textAlign === 'center' ? 'left-0 right-0' : textAlign === 'right' ? 'right-0' : 'left-0'}`}>
        <motion.div {...anim}>
          {textAlign === 'left' ? (
            // Special layout for left alignment - all elements align to same left edge
            <div className="max-w-4xl">
              {/* Title - left aligned with negative margin to push it left */}
              <h1 className={`${serifClass} text-3xl md:text-7xl lg:text-8xl text-white tracking-tight font-bold mb-3 md:mb-4 text-left -ml-1 md:-ml-2 lg:-ml-3`}>
                {nameContent}
              </h1>
              
              {/* Subtitle - left aligned, starts at same position as title */}
              {gallery.subtitle && (
                <p className={`${serifClass} text-sm md:text-xl text-white/70 tracking-tight font-normal mb-6 md:mb-10 text-left`}>
                  {gallery.subtitle}
                </p>
              )}
              
              {/* Metadata - left aligned, starts at same position */}
              <div className="text-left">
                {metaContent("text-white/60", 'left')}
              </div>
            </div>
          ) : (
            // Normal layout for center and right
            <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''}`}>
              <h1 className={`${serifClass} text-3xl md:text-7xl lg:text-8xl text-white tracking-tight font-bold mb-3 md:mb-4 ${textAlign === 'center' ? 'text-center' : 'text-right'}`}>
                {nameContent}
              </h1>
              
              {gallery.subtitle && (
                <p className={`${serifClass} text-sm md:text-xl text-white/70 tracking-tight font-normal mb-6 md:mb-10 ${textAlign === 'center' ? 'text-center' : 'text-right'}`}>
                  {gallery.subtitle}
                </p>
              )}
              
              <div className={textAlign === 'center' ? 'text-center' : 'text-right'}>
                {metaContent("text-white/60", textAlign)}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
