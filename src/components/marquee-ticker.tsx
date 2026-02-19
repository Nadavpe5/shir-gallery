"use client";

import type { Gallery } from "@/lib/types";

interface MarqueeTickerProps {
  gallery: Gallery;
  daysRemaining: number;
}

export function MarqueeTicker({ gallery, daysRemaining }: MarqueeTickerProps) {
  const items = [
    "Shir Yadgar Perez",
    gallery.shoot_title,
    daysRemaining > 0
      ? `Download within ${daysRemaining} days`
      : "Gallery available",
    gallery.location || "",
  ].filter(Boolean);

  const separator = (
    <span className="mx-4 md:mx-8 text-sage/40 select-none" aria-hidden>
      |
    </span>
  );

  const content = items.map((item, i) => (
    <span key={i} className="inline-flex items-center">
      <span>{item}</span>
      {separator}
    </span>
  ));

  return (
    <div className="border-y border-border py-5 overflow-hidden bg-background">
      <div className="animate-marquee whitespace-nowrap inline-flex">
        <span className="inline-flex items-center text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          {content}
          {content}
        </span>
      </div>
    </div>
  );
}
