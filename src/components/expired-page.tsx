"use client";

import { motion } from "framer-motion";

interface ExpiredPageProps {
  clientName: string;
}

export function ExpiredPage({ clientName }: ExpiredPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Gallery Expired
        </p>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-6">
          {clientName}
        </h1>

        <div className="w-px h-8 bg-sage/40 mx-auto mb-6" />

        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          This gallery is no longer available for viewing or download.
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed">
          If you believe this is an error, please contact your photographer.
        </p>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
            Shir Yadgar Perez Photography
          </p>
        </div>
      </motion.div>
    </div>
  );
}
