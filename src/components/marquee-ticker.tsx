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
    gallery.location || "",
  ].filter(Boolean);

  const separator = (
    <span className="mx-4 md:mx-8 text-sage/40 select-none" aria-hidden>
      |
    </span>
  );

  return (
    <div className="border-y border-border py-5 bg-background">
      <div className="flex items-center justify-center flex-wrap gap-y-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
            <span>{item}</span>
            {i < items.length - 1 && separator}
          </span>
        ))}
      </div>
    </div>
  );
}
