"use client";

import { Download } from "lucide-react";

interface ImageOverlayProps {
  downloadUrl: string;
  filename?: string;
}

export function ImageOverlay({ downloadUrl, filename }: ImageOverlayProps) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "photo.jpg";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      onClick={handleDownload}
      className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
      aria-label="Download photo"
    >
      <Download className="w-3.5 h-3.5" />
    </button>
  );
}
