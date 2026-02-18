"use client";

import { useState } from "react";
import { X, Copy, Check, MessageCircle, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  galleryUrl: string;
  clientName: string;
}

export function ShareModal({
  open,
  onClose,
  galleryUrl,
  clientName,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out ${clientName}'s gallery: ${galleryUrl}`
  )}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    `${clientName} - Photo Gallery`
  )}&body=${encodeURIComponent(
    `View the gallery here: ${galleryUrl}`
  )}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-card rounded-lg p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold">Share</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={galleryUrl}
                className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2.5 text-sm text-foreground"
              />
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase font-medium transition-all hover:opacity-90"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary group-hover:bg-secondary/80 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <span className="text-[10px] tracking-wide uppercase text-muted-foreground">
                  WhatsApp
                </span>
              </a>

              <a
                href={emailUrl}
                className="flex flex-col items-center gap-2 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary group-hover:bg-secondary/80 transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <span className="text-[10px] tracking-wide uppercase text-muted-foreground">
                  Email
                </span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
