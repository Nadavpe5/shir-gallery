"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface DownloadButtonProps {
  zipUrl: string | null;
  fontClass?: string;
}

export function DownloadButton({ zipUrl, fontClass }: DownloadButtonProps) {
  const serifClass = fontClass || "font-serif";
  const [showNote, setShowNote] = useState(false);

  if (!zipUrl) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">
          Download is currently unavailable
        </p>
      </div>
    );
  }

  function handleClick() {
    setShowNote(true);
    setTimeout(() => setShowNote(false), 5000);
  }

  return (
    <section className="px-5 md:px-16 lg:px-24 py-14 md:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Take Them Home
        </p>
        <h2 className={`${serifClass} text-2xl md:text-4xl font-bold mb-4`}>
          Download All
        </h2>
        <div className="w-px h-8 bg-sage/40 mx-auto mb-8" />
        <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto">
          Get all your photographs in a single ZIP file
        </p>

        <a
          href={`/api/download?url=${encodeURIComponent(zipUrl)}&name=${encodeURIComponent(zipUrl.split("/").pop() || "gallery.zip")}`}
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 bg-sage text-sage-foreground tracking-wide text-[10px] font-medium px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
        >
          <Download className="w-3 h-3" />
          Download ZIP
        </a>

        {showNote && (
          <p className="mt-5 text-xs text-muted-foreground animate-in fade-in">
            Your download will begin shortly
          </p>
        )}
      </motion.div>
    </section>
  );
}
