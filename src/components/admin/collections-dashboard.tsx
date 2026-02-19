"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Share2,
  Pencil,
  Globe,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { AdminNav } from "./admin-nav";

interface GalleryRow {
  id: string;
  client_name: string;
  slug: string;
  shoot_date: string | null;
  status: string;
  cover_image_url: string | null;
  created_at: string;
  gallery_assets: { count: number }[];
}

export function CollectionsDashboard() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchGalleries = useCallback(async () => {
    const res = await fetch("/api/admin/galleries");
    if (res.ok) {
      const data = await res.json();
      setGalleries(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-menu]")) return;
      setMenuOpen(null);
    }
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this gallery? This cannot be undone.")) return;
    await fetch(`/api/admin/galleries/${id}`, { method: "DELETE" });
    setGalleries((prev) => prev.filter((g) => g.id !== id));
    setMenuOpen(null);
  }

  async function handleDuplicate(id: string) {
    await fetch(`/api/admin/galleries/${id}/duplicate`, { method: "POST" });
    fetchGalleries();
    setMenuOpen(null);
  }

  return (
    <div>
      <AdminNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold">Collections</h1>
            <p className="text-gray-400 text-sm mt-1">
              {galleries.length}{" "}
              {galleries.length === 1 ? "gallery" : "galleries"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/galleries/new")}
            className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Gallery
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl border border-gray-100">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-medium mb-1">No galleries yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Create your first gallery to get started
            </p>
            <button
              onClick={() => router.push("/admin/galleries/new")}
              className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => {
              const assetCount = gallery.gallery_assets?.[0]?.count ?? 0;
              return (
                <div
                  key={gallery.id}
                  className="group bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/admin/galleries/${gallery.id}`)}
                >
                  <div className="relative aspect-[16/10] bg-gray-50 rounded-t-xl overflow-hidden">
                    {gallery.cover_image_url ? (
                      <Image
                        src={gallery.cover_image_url}
                        alt={gallery.client_name}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                        <ImageIcon className="w-8 h-8 text-gray-200" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
                          gallery.status === "published"
                            ? "bg-green-50/90 text-green-700"
                            : "bg-white/90 text-gray-500"
                        }`}
                      >
                        {gallery.status === "published" ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {gallery.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm">
                          {gallery.client_name}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {assetCount} photos
                          {gallery.shoot_date &&
                            ` · ${new Date(gallery.shoot_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        </p>
                      </div>

                      <div className="relative" data-menu>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(
                              menuOpen === gallery.id ? null : gallery.id
                            );
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>

                        {menuOpen === gallery.id && (
                          <div
                            className="absolute right-0 top-9 z-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                window.open(`/g/${gallery.slug}`, "_blank");
                                setMenuOpen(null);
                              }}
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                              Preview
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/g/${gallery.slug}`
                                );
                                setMenuOpen(null);
                              }}
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-gray-400" />
                              Copy Link
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/admin/galleries/${gallery.id}`);
                                setMenuOpen(null);
                              }}
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-gray-400" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicate(gallery.id)}
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                              Duplicate
                            </button>
                            <div className="my-1.5 border-t border-gray-100" />
                            <button
                              onClick={() => handleDelete(gallery.id)}
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
