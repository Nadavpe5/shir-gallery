"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <p className="font-serif text-7xl font-bold text-muted-foreground/20 mb-6">
          404
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4">
          Page Not Found
        </h1>
        <div className="w-px h-8 bg-sage/40 mx-auto mb-6" />
        <p className="text-muted-foreground text-sm mb-10">
          The gallery you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/"
          className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground/40 pb-1 transition-colors"
        >
          Go back
        </Link>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
            Shir Yadgar Perez Photography
          </p>
        </div>
      </motion.div>
    </div>
  );
}
