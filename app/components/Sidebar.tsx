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
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 text-white p-6 min-h-screen flex-col justify-between shrink-0">
        <div>
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white">AKD</h1>
            <p className="text-zinc-500 text-sm">Dashboard</p>
          </div>
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <button onClick={logout}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all flex items-center justify-center gap-2">
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <span className="text-white font-bold text-lg">AKD Dashboard</span>
        <button onClick={logout} className="text-red-400 text-sm font-bold flex items-center gap-1">
          <span>🚪</span> خروج
        </button>
      </div>

      {/* ===== Mobile Bottom Nav ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center py-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl ${
              pathname === link.href ? "text-blue-400" : "text-zinc-500"
            }`}>
            <span className="text-2xl">{link.icon}</span>
            <span className="text-[10px]">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
