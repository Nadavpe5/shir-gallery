"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface DownloadButtonProps {
  galleryId: string;
  hasAnySections: boolean;
  fontClass?: string;
}

export function DownloadButton({ galleryId, hasAnySections, fontClass }: DownloadButtonProps) {
  const serifClass = fontClass || "font-serif";
  const [showNote, setShowNote] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!hasAnySections) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">
          Download is currently unavailable
        </p>
      </div>
    );
  }

  async function handleDownloadAll() {
    if (isDownloading) return;
    
    setIsDownloading(true);
    setShowNote(true);

    try {
      console.log("[DownloadButton] Fetching section URLs for galleryId:", galleryId);
      const response = await fetch(`/api/download-all-merged?galleryId=${galleryId}`);
      const data = await response.json();

      console.log("[DownloadButton] API response:", data);

      if (!response.ok || !data.sections || data.sections.length === 0) {
        console.error("[DownloadButton] Failed to get section URLs:", data.error);
        alert(`Download failed: ${data.error || "No sections available"}`);
        setShowNote(false);
        setIsDownloading(false);
        return;
      }

      console.log(`[DownloadButton] Starting ${data.sections.length} downloads`);

      for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        console.log(`[DownloadButton] Downloading ${i + 1}/${data.sections.length}:`, section.name);
        
        const downloadUrl = `/api/download?url=${encodeURIComponent(section.url)}&name=${encodeURIComponent(section.name)}`;
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = section.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (i < data.sections.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log("[DownloadButton] All downloads triggered");
      setTimeout(() => setShowNote(false), 5000);
    } catch (error) {
      console.error("[DownloadButton] Download failed:", error);
      alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowNote(false);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="px-5 md:px-16 lg:px-24 py-14 md:py-32 text-center" data-download-all-section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className={`${serifClass} text-2xl md:text-4xl font-bold mb-4`}>
          Download All
        </h2>
        <div className="w-px h-8 bg-sage/40 mx-auto mb-8" />
        <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto">
          Get all your photographs in a single ZIP file
        </p>

        <button
          onClick={handleDownloadAll}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 bg-sage text-sage-foreground tracking-wide text-[10px] font-medium px-3.5 py-1.5 rounded-md transition-all hover:opacity-90 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          {isDownloading ? "Downloading..." : "Download ZIP"}
        </button>

        {showNote && (
          <p className="mt-5 text-xs text-muted-foreground animate-in fade-in">
            Your download will begin shortly
          </p>
        )}
      </motion.div>
    </section>
  );
}
