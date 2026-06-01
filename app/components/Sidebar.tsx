"use client";

import Link from "next/link";
import { auth } from "@/app/firebase";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const logout = async () => {
    await signOut(auth);
    document.cookie = "auth_token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const links = [
    { href: "/dashboard", label: "لوحة التحكم", icon: "🏠" },
    { href: "/posts", label: "المنشورات", icon: "📝" },
    { href: "/videos", label: "الفيديوهات", icon: "🎬" },
    { href: "/ads", label: "الإعلانات", icon: "📢" },
    { href: "/settings", label: "الإعدادات", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-white p-6 min-h-screen flex flex-col justify-between">
      <div>
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">AKD</h1>
          <p className="text-zinc-500 text-sm">Dashboard</p>
        </div>

        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname === link.href
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        <span>تسجيل الخروج</span>
      </button>
    </aside>
  );
}