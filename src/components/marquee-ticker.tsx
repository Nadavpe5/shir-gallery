"use client";

import type { Gallery } from "@/lib/types";

interface MarqueeTickerProps {
  gallery: Gallery;
  daysRemaining: number;
}

export function MarqueeTicker({ gallery, daysRemaining }: MarqueeTickerProps) {
  return (
    <div className="border-y border-border py-5 bg-background">
      <div className="flex items-center justify-center">
        <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          Shir Yadgar Perez
        </span>
      </div>
    </div>
  );
}
