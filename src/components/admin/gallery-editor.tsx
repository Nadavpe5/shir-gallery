"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Trash2,
  Check,
  X,
  Globe,
  FileText,
  Image as ImageIcon,
  Camera,
  Settings,
  Info,
  Share2,
  Eye,
  Copy,
  MessageCircle,
  Mail,
  Paintbrush,
  Type,
  Palette,
  LayoutGrid,
  Monitor,
  Smartphone,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import { AdminNav } from "./admin-nav";
import type {
  DesignSettings,
  CoverLayout,
  TypographyPreset,
  ColorTheme,
  GridStyle,
  GridSize,
  GridSpacing,
} from "@/lib/types";
import { DEFAULT_DESIGN } from "@/lib/types";

interface GalleryData {
  id: string;
  client_name: string;
  shoot_title: string;
  subtitle: string | null;
  location: string | null;
  shoot_date: string | null;
  slug: string;
  status: string;
  cover_image_url: string | null;
  zip_url: string | null;
  expires_at: string;
  design_settings: DesignSettings | null;
}

interface AssetData {
  id: string;
  gallery_id: string;
  web_url: string;
  full_url: string;
  type: string;
  sort_order: number;
  filename: string | null;
}

type SidebarTab = "photos" | "design" | "details" | "settings";

interface UploadItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  error?: string;
}

export function GalleryEditor({ galleryId }: { galleryId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("photos");
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [designSection, setDesignSection] = useState<"cover" | "typography" | "color" | "grid">("cover");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [regenerating, setRegenerating] = useState(false);
  const [regenResult, setRegenResult] = useState<string | null>(null);
  const [rotatingAssets, setRotatingAssets] = useState<Set<string>>(new Set());

  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [design, setDesign] = useState<DesignSettings>(DEFAULT_DESIGN);

  const fetchGallery = useCallback(async () => {
    const [gRes, aRes] = await Promise.all([
      fetch(`/api/admin/galleries/${galleryId}`),
      fetch(`/api/admin/galleries/${galleryId}/assets`),
    ]);

    if (gRes.ok) {
      const data = await gRes.json();
      setGallery(data);
      setEditName(data.client_name);
      setEditTitle(data.shoot_title || "");
      setEditSubtitle(data.subtitle || "");
      setEditLocation(data.location || "");
      setEditDate(data.shoot_date || "");
      setEditExpiry(data.expires_at?.split("T")[0] || "");
      if (data.design_settings) {
        setDesign({ ...DEFAULT_DESIGN, ...data.design_settings });
      }
    }
    if (aRes.ok) {
      setAssets(await aRes.json());
    }
    setLoading(false);
  }, [galleryId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  async function saveDetails() {
    setSaving(true);
    const body: Record<string, unknown> = {
      client_name: editName,
      shoot_title: editTitle,
      subtitle: editSubtitle || null,
      location: editLocation || null,
      shoot_date: editDate || null,
      expires_at: editExpiry ? new Date(editExpiry).toISOString() : undefined,
    };
    if (editPassword) body.password = editPassword;

    const res = await fetch(`/api/admin/galleries/${galleryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setGallery(updated);
      setEditPassword("");
    }
    setSaving(false);
  }

  async function saveDesign(updated: DesignSettings) {
    setDesign(updated);
    const res = await fetch(`/api/admin/galleries/${galleryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design_settings: updated }),
    });
    if (res.ok) {
      const data = await res.json();
      setGallery(data);
    }
  }

  async function handlePublish(published: boolean) {
    const res = await fetch(`/api/admin/galleries/${galleryId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGallery(updated);
    }
  }

  function startUpload(files: File[]) {
    if (!files.length || !gallery) return;
    const items: UploadItem[] = files.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));
    setUploadQueue((prev) => [...prev, ...items]);
    processUploads(items);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    startUpload(Array.from(e.target.files || []));
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    startUpload(files);
  }

  async function processUploads(items: UploadItem[]) {
    if (!gallery) return;

    for (const item of items) {
      try {
        setUploadQueue((prev) =>
          prev.map((u) =>
            u.file === item.file ? { ...u, status: "uploading", progress: 10 } : u
          )
        );

        const presignRes = await fetch("/api/admin/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: item.file.name,
            contentType: item.file.type,
            gallerySlug: gallery.slug,
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { url, key } = await presignRes.json();

        setUploadQueue((prev) =>
          prev.map((u) =>
            u.file === item.file ? { ...u, progress: 25 } : u
          )
        );

        const uploadRes = await fetch(url, {
          method: "PUT",
          body: item.file,
          headers: { "Content-Type": item.file.type },
        });

        if (!uploadRes.ok) throw new Error("Upload to storage failed");

        setUploadQueue((prev) =>
          prev.map((u) =>
            u.file === item.file ? { ...u, status: "processing", progress: 65 } : u
          )
        );

        const processRes = await fetch("/api/admin/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullKey: key,
            galleryId,
            gallerySlug: gallery.slug,
            filename: item.file.name,
            type: "gallery",
          }),
        });

        if (!processRes.ok) {
          const data = await processRes.json();
          throw new Error(data.error || "Processing failed");
        }

        const newAsset = await processRes.json();
        setAssets((prev) => [...prev, newAsset]);

        setUploadQueue((prev) =>
          prev.map((u) =>
            u.file === item.file ? { ...u, status: "done", progress: 100 } : u
          )
        );
      } catch (err) {
        setUploadQueue((prev) =>
          prev.map((u) =>
            u.file === item.file
              ? { ...u, status: "error", error: (err as Error).message }
              : u
          )
        );
      }
    }

    setTimeout(() => {
      setUploadQueue((prev) => prev.filter((u) => u.status !== "done"));
    }, 5000);
  }

  async function deleteSelected() {
    if (selectedAssets.size === 0) return;
    if (
      !confirm(`Delete ${selectedAssets.size} photo(s)? This cannot be undone.`)
    )
      return;

    await fetch(`/api/admin/galleries/${galleryId}/assets`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetIds: Array.from(selectedAssets) }),
    });

    setAssets((prev) => prev.filter((a) => !selectedAssets.has(a.id)));
    setSelectedAssets(new Set());
  }

  async function setCoverImage(url: string) {
    const res = await fetch(`/api/admin/galleries/${galleryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_image_url: url }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGallery(updated);
    }
  }

  async function changeAssetType(assetId: string, type: string) {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, type } : a))
    );
    await fetch(`/api/admin/galleries/${galleryId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: assetId, type }),
    });
  }

  async function rotateAsset(assetId: string) {
    setRotatingAssets((prev) => new Set(prev).add(assetId));
    try {
      const res = await fetch(`/api/admin/galleries/${galleryId}/assets/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, direction: "cw" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssets((prev) => prev.map((a) => (a.id === assetId ? updated : a)));
      }
    } catch (err) {
      console.error("Rotate failed:", err);
    }
    setRotatingAssets((prev) => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Gallery not found</p>
      </div>
    );
  }

  const galleryLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/g/${gallery.slug}`;

  const highlights = assets.filter((a) => a.type === "highlight");
  const galleryPhotos = assets.filter((a) => a.type === "gallery");
  const originals = assets.filter((a) => a.type === "original");

  return (
    <div className="flex flex-col min-h-[100dvh] lg:h-screen">
      <AdminNav />
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-gray-100 flex flex-col bg-white lg:shrink-0">
        <div className="p-4 lg:p-5 border-b border-gray-100">
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Collections
          </button>
          <h2 className="text-lg font-semibold truncate leading-tight">
            {gallery.client_name}
          </h2>
          {gallery.shoot_title && gallery.shoot_title !== gallery.client_name && (
            <p className="text-sm text-gray-400 mt-0.5 truncate">
              {gallery.shoot_title}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full ${
                gallery.status === "published"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {gallery.status === "published" ? (
                <Globe className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              {gallery.status}
            </span>
            <span className="text-xs text-gray-400">
              {assets.length} photos
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(
            [
              { key: "photos", icon: Camera, label: "Photos" },
              { key: "design", icon: Paintbrush, label: "Design" },
              { key: "details", icon: Info, label: "Details" },
              { key: "settings", icon: Settings, label: "Settings" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:flex-1 lg:overflow-y-auto p-4 lg:p-5">
          {activeTab === "photos" && (
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-8 text-sm transition-all ${
                  isDragging
                    ? "border-blue-400 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">
                  {isDragging ? "Drop photos here" : "Upload Photos"}
                </span>
                <span className="text-[11px]">Drag & drop or click to browse</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  {uploadQueue.map((item, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate max-w-[180px]">
                          {item.file.name}
                        </span>
                        {item.status === "done" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : item.status === "error" ? (
                          <X className="w-3 h-3 text-red-500" />
                        ) : (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        )}
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.status === "error"
                              ? "bg-red-400"
                              : item.status === "done"
                                ? "bg-green-400"
                                : "bg-gray-900"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    label: "Highlights",
                    count: highlights.length,
                    type: "highlight",
                  },
                  {
                    label: "Gallery",
                    count: galleryPhotos.length,
                    type: "gallery",
                  },
                  {
                    label: "Originals",
                    count: originals.length,
                    type: "original",
                  },
                ].map(({ label, count }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-1">
              {([
                { key: "cover" as const, icon: ImageIcon, label: "Cover Layout" },
                { key: "typography" as const, icon: Type, label: "Typography" },
                { key: "color" as const, icon: Palette, label: "Color Theme" },
                { key: "grid" as const, icon: LayoutGrid, label: "Grid" },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setDesignSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    designSection === key
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                onClick={saveDetails}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Details
              </button>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Change Password
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Leave empty to keep the current password
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Expires On
                </label>
                <input
                  type="date"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={saveDetails}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Settings
              </button>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  Photo Quality
                </label>
                <p className="text-[11px] text-gray-400 mb-3">
                  Re-generate all web thumbnails at higher quality from the original uploads.
                </p>
                <button
                  onClick={async () => {
                    setRegenerating(true);
                    setRegenResult(null);
                    try {
                      const res = await fetch(`/api/admin/galleries/${galleryId}/regenerate`, { method: "POST" });
                      const data = await res.json();
                      if (res.ok) {
                        setRegenResult(`Done: ${data.processed} regenerated${data.failed ? `, ${data.failed} failed` : ""}`);
                        fetchGallery();
                      } else {
                        setRegenResult(data.error || "Failed");
                      }
                    } catch {
                      setRegenResult("Network error");
                    }
                    setRegenerating(false);
                  }}
                  disabled={regenerating}
                  className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  {regenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {regenerating ? "Regenerating..." : "Regenerate Thumbnails"}
                </button>
                {regenResult && (
                  <p className="text-xs text-gray-500 mt-2">{regenResult}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 lg:p-5 border-t border-gray-100 space-y-2.5">
          {gallery.status === "draft" ? (
            <button
              onClick={() => handlePublish(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <Globe className="w-4 h-4" />
              Publish
            </button>
          ) : (
            <button
              onClick={() => handlePublish(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Unpublish
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {activeTab === "design" ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Design Options Panel */}
          <div className="w-full lg:w-[340px] lg:shrink-0 lg:border-r border-gray-100 bg-white overflow-y-auto p-4 lg:p-6">
            {designSection === "cover" && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />Cover Layout
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {([
                    { value: "full", label: "Full", desc: "Image fills screen" },
                    { value: "center", label: "Center", desc: "Centered title" },
                    { value: "left", label: "Left", desc: "Split layout" },
                    { value: "minimal", label: "Minimal", desc: "Text only" },
                  ] as { value: CoverLayout; label: string; desc: string }[]).map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => saveDesign({ ...design, cover: value })}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center transition-all ${
                        design.cover === value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-[10px] text-gray-400 leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>

              </div>
            )}

            {designSection === "typography" && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" />Typography
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {([
                    { value: "serif", label: "Serif", font: "font-serif", desc: "Classic" },
                    { value: "sans", label: "Sans", font: "font-sans", desc: "Neutral" },
                    { value: "modern", label: "Modern", font: "var(--font-montserrat)", desc: "Sophisticated" },
                    { value: "timeless", label: "Timeless", font: "var(--font-cormorant)", desc: "Light & airy" },
                    { value: "bold", label: "Bold", font: "var(--font-oswald)", desc: "Punchy" },
                    { value: "subtle", label: "Subtle", font: "var(--font-raleway)", desc: "Minimal" },
                  ] as { value: TypographyPreset; label: string; font: string; desc: string }[]).map(({ value, label, font, desc }) => (
                    <button
                      key={value}
                      onClick={() => saveDesign({ ...design, typography: value })}
                      className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-center transition-all ${
                        design.typography === value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className="text-lg font-semibold"
                        style={font.startsWith("var(") ? { fontFamily: font } : undefined}
                      >
                        {label}
                      </span>
                      <span className="text-[10px] text-gray-400">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {designSection === "color" && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />Color Theme
                </h4>
                <div className="space-y-2">
                  {([
                    { value: "light", label: "Light", colors: ["#f8f5f0", "#2a2520", "#9da68d"] },
                    { value: "gold", label: "Gold", colors: ["#faf6ed", "#3d3425", "#c8a95e"] },
                    { value: "rose", label: "Rose", colors: ["#faf5f5", "#3d2b2b", "#c4929a"] },
                    { value: "terracotta", label: "Terracotta", colors: ["#faf5f0", "#3d2e25", "#c49272"] },
                    { value: "olive", label: "Olive", colors: ["#f5f6f2", "#2e3128", "#7a8c65"] },
                    { value: "sea", label: "Sea", colors: ["#f3f6f8", "#262e34", "#6e8a9e"] },
                    { value: "dark", label: "Dark", colors: ["#1a1a1a", "#e8e4e0", "#9da68d"] },
                  ] as { value: ColorTheme; label: string; colors: string[] }[]).map(({ value, label, colors }) => (
                    <button
                      key={value}
                      onClick={() => saveDesign({ ...design, color: value })}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all ${
                        design.color === value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex -space-x-1">
                        {colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                      {design.color === value && (
                        <Check className="w-4 h-4 text-gray-900 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {designSection === "grid" && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5" />Grid
                </h4>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-2.5">Style</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {([
                        { value: "vertical", label: "Portrait" },
                        { value: "horizontal", label: "Landscape" },
                        { value: "masonry", label: "Masonry" },
                      ] as { value: GridStyle; label: string }[]).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => saveDesign({ ...design, gridStyle: value })}
                          className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                            design.gridStyle === value
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2.5">Size</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: "regular", label: "Regular" },
                        { value: "large", label: "Large" },
                      ] as { value: GridSize; label: string }[]).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => saveDesign({ ...design, gridSize: value })}
                          className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                            design.gridSize === value
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2.5">Spacing</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: "regular", label: "Regular" },
                        { value: "large", label: "Large" },
                      ] as { value: GridSpacing; label: string }[]).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => saveDesign({ ...design, gridSpacing: value })}
                          className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                            design.gridSpacing === value
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="hidden lg:flex flex-1 flex-col bg-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Live Preview</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewMode === "desktop"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewMode === "mobile"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
              <div
                className={`bg-white shadow-lg transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-[375px] h-[680px] border-[8px] border-gray-800 rounded-[2.5rem] overflow-hidden"
                    : "w-full h-full rounded-xl overflow-hidden"
                }`}
              >
                <iframe
                  key={`${design.cover}-${design.typography}-${design.color}-${design.gridStyle}-${design.gridSize}-${design.gridSpacing}`}
                  src={`/g/${gallery.slug}?preview=1`}
                  className="w-full h-full border-0"
                  title="Gallery Preview"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
      <main
        className="flex-1 lg:overflow-y-auto bg-gray-50"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setIsDragging(false); }}
        onDrop={handleDrop}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            {selectedAssets.size > 0 ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {selectedAssets.size} selected
                </span>
                <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                <select
                  onChange={(e) => {
                    selectedAssets.forEach((id) =>
                      changeAssetType(id, e.target.value)
                    );
                    setSelectedAssets(new Set());
                  }}
                  defaultValue=""
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="" disabled>
                    Move to...
                  </option>
                  <option value="highlight">Highlights</option>
                  <option value="gallery">Gallery</option>
                  <option value="original">Originals</option>
                </select>
                <button
                  onClick={deleteSelected}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <div className="h-4 w-px bg-gray-200" />
                <button
                  onClick={() => setSelectedAssets(new Set())}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400">
                {assets.length} {assets.length === 1 ? "photo" : "photos"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.open(`/g/${gallery.slug}`, "_blank")
              }
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="p-4 lg:p-6">
          {assets.length === 0 ? (
            <div className="text-center py-32">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-medium mb-1">No photos yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Upload photos to get started
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800"
              >
                <Upload className="w-4 h-4" />
                Upload Photos
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {[
                { label: "Highlights", items: highlights, type: "highlight" },
                { label: "Gallery", items: galleryPhotos, type: "gallery" },
                { label: "Originals", items: originals, type: "original" },
              ]
                .filter(({ items }) => items.length > 0)
                .map(({ label, items }) => (
                  <div key={label}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                      {label}{" "}
                      <span className="text-gray-300">({items.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3">
                      {items.map((asset) => (
                        <div
                          key={asset.id}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ring-2 transition-all shadow-sm hover:shadow-md ${
                            selectedAssets.has(asset.id)
                              ? "ring-blue-500 ring-offset-2"
                              : "ring-transparent hover:ring-gray-300"
                          }`}
                          onClick={() => toggleSelect(asset.id)}
                        >
                          <Image
                            src={asset.web_url}
                            alt={asset.filename || ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                          />
                          {selectedAssets.has(asset.id) && (
                            <div className="absolute inset-0 bg-blue-500/15 flex items-center justify-center">
                              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}
                          {(gallery.cover_image_url === asset.full_url || gallery.cover_image_url === asset.web_url) && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] uppercase tracking-wider font-medium px-2 py-1 rounded-md backdrop-blur-sm">
                              Cover
                            </div>
                          )}
                          {rotatingAssets.has(asset.id) && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotateAsset(asset.id);
                            }}
                            className="absolute bottom-2 left-2 bg-black/70 text-white p-1.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Rotate 90°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(asset.full_url);
                            }}
                            className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] uppercase tracking-wider font-medium px-2 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Cover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Share Gallery</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Copy the gallery link or share directly
            </p>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={galleryLink}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(galleryLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-5 flex items-center justify-center gap-8">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Your gallery is ready!\n${galleryLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
                  WhatsApp
                </span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `${gallery.client_name} - Gallery`
                )}&body=${encodeURIComponent(
                  `Your gallery is ready!\n\n${galleryLink}`
                )}`}
                className="flex flex-col items-center gap-2 group"
              >
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <Mail className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
                  Email
                </span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
}
