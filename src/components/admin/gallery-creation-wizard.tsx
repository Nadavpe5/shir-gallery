"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { AdminNav } from "./admin-nav";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function GalleryCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [shootTitle, setShootTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [location, setLocation] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [slug, setSlug] = useState("");

  const [password, setPassword] = useState("");
  const [expiryDays, setExpiryDays] = useState(45);

  const totalSteps = 2;

  async function createGallery() {
    setLoading(true);
    setError("");

    const expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const res = await fetch("/api/admin/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: clientName,
        shoot_title: shootTitle || clientName,
        subtitle,
        location,
        shoot_date: shootDate || null,
        slug: slug || slugify(clientName),
        password,
        expires_at: expiresAt,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create gallery");
      setLoading(false);
      return;
    }

    const gallery = await res.json();
    router.push(`/admin/galleries/${gallery.id}`);
  }

  return (
    <div>
      <AdminNav />

      <div className="max-w-xl mx-auto px-6 py-12">
        <button
          onClick={() =>
            step > 1 ? setStep(step - 1) : router.push("/admin")
          }
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? "Back" : "All galleries"}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Gallery Details</h2>
            <p className="text-gray-400 text-sm mb-8">
              Basic information about the gallery
            </p>

            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (!slug || slug === slugify(clientName)) {
                      setSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g. Maya & Lior"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  value={shootTitle}
                  onChange={(e) => setShootTitle(e.target.value)}
                  placeholder="e.g. Maternity Session"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. A story of love and anticipation"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tel Aviv"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Gallery URL Slug *
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                  <span className="px-3 text-gray-400 text-sm py-3 border-r border-gray-200 bg-gray-100">
                    /g/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!clientName || !slug}
              className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Security & Expiry</h2>
            <p className="text-gray-400 text-sm mb-8">
              Set password and expiration for the gallery
            </p>

            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Gallery Password *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password for client access"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Share this with the client so they can access the gallery
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Gallery Expires In
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) =>
                      setExpiryDays(
                        Math.max(1, parseInt(e.target.value) || 45)
                      )
                    }
                    className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  />
                  <span className="text-sm text-gray-400">days</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={createGallery}
              disabled={loading || !password}
              className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Create Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
