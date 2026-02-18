"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      setError("Invalid access token");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <span className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xs font-bold tracking-widest mb-4 shadow-lg">
            SYP
          </span>
          <h1 className="text-xl font-semibold">Shir Yadgar Photography</h1>
          <p className="text-gray-400 text-sm mt-1">
            Admin access
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your token"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
