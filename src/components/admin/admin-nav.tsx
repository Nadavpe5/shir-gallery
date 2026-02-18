"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-3 group"
        >
          <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-widest group-hover:bg-gray-700 transition-colors">
            SYP
          </span>
          <span className="text-sm font-medium tracking-wide text-gray-700 hidden sm:block">
            Shir Yadgar Photography
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
