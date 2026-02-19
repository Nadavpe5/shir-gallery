"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 flex items-center justify-between h-14 sm:h-16">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-3 group"
        >
          <Image
            src="/camera-login.png"
            alt="Shir Yadgar Photography"
            width={48}
            height={48}
            className="w-9 h-9 sm:w-12 sm:h-12 group-hover:opacity-80 transition-opacity"
            priority
          />
          <span className="text-sm sm:text-base font-medium tracking-wide text-gray-800 truncate">
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
