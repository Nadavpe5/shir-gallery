"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordGateProps {
  slug: string;
  clientName: string;
  theme?: string;
}

export function PasswordGate({ slug, clientName, theme }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/g/${slug}`);
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background" data-theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-6">
            Private Gallery
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            {clientName}
          </h1>
          <div className="w-px h-8 bg-sage/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent border-b border-foreground/20 px-1 py-3 text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
            autoFocus
            disabled={loading}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-xs"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="inline-flex items-center justify-center gap-2 bg-sage text-sage-foreground tracking-[0.15em] uppercase text-[11px] font-medium px-8 py-3 rounded-md transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                View Gallery
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-14 flex flex-col items-center gap-2.5">
          <img src="/logo-96.png" alt="Shir Yadgar Photography" width={96} height={75} className="w-20 h-20 md:w-24 md:h-24 opacity-40 object-contain" />
          <p className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
            Shir Yadgar Photography
          </p>
        </div>
      </motion.div>
    </div>
  );
}
