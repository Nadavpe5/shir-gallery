"use client";

import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { Download } from "lucide-react";

interface ViewerSlide {
  src: string;
  alt?: string;
  downloadUrl: string;
  filename?: string;
}

interface ImageViewerProps {
  slides: ViewerSlide[];
  open: boolean;
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageViewer({ slides, open, index, onClose, onIndexChange }: ImageViewerProps) {
  const lightboxSlides = slides.map((s) => ({
    src: s.src,
    alt: s.alt,
  }));

  function handleDownload() {
    const current = slides[index];
    if (!current) return;

    const name = current.filename || "photo.jpg";
    const proxyUrl = `/api/download?url=${encodeURIComponent(current.downloadUrl)}&name=${encodeURIComponent(name)}`;
    window.open(proxyUrl, "_blank");
  }

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={lightboxSlides}
      plugins={[Counter]}
      counter={{ container: { style: { top: "unset", bottom: 0 } } }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
      }}
      toolbar={{
        buttons: [
          <button
            key="download"
            type="button"
            onClick={handleDownload}
            className="yarl__button"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </button>,
          "close",
        ],
      }}
      carousel={{
        finite: false,
        padding: "0px",
      }}
      animation={{
        swipe: 250,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      on={{
        view: ({ index: newIndex }) => {
          onIndexChange(newIndex);
        },
      }}
    />
  );
}
