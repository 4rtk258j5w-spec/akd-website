"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function Dashboard() {
  const [postsCount, setPostsCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);

  useEffect(() => {
    (async () => {
      const p = await getDocs(collection(db, "posts"));
      const v = await getDocs(collection(db, "videos"));
      const a = await getDocs(collection(db, "ads"));
      setPostsCount(p.size);
      setVideosCount(v.size);
      setAdsCount(a.size);
    })();
  }, []);

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

  const stats = [
    { label: "المنشورات", count: postsCount, color: "#60a5fa" },
    { label: "الفيديوهات", count: videosCount, color: "#a78bfa" },
    { label: "الإعلانات", count: adsCount, color: "#4ade80" },
  ];

  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh", color: "white" }}>
      <style>{`
        .dt-desktop-aside { display: flex; }
        .dt-mobile-bar { display: none; }
        .dt-content { padding: 32px; }
        details.dt-menu > summary { list-style: none; }
        details.dt-menu > summary::-webkit-details-marker { display: none; }
        details.dt-menu[open] .dt-overlay { display: block; }
        @media (max-width: 768px) {
          .dt-desktop-aside { display: none !important; }
          .dt-mobile-bar { display: block !important; }
          .dt-content { padding: 72px 16px 24px !important; }
        }
      `}</style>

      {/* ===== قائمة الموبايل (تشتغل بدون جافاسكربت) ===== */}
      <div className="dt-mobile-bar">
        <details className="dt-menu">
          <summary style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, backgroundColor: "#18181b", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #27272a", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>AKD</span>
            <span style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "8px" }}>
              <span style={{ width: "24px", height: "2px", backgroundColor: "white" }} />
              <span style={{ width: "24px", height: "2px", backgroundColor: "white" }} />
              <span style={{ width: "24px", height: "2px", backgroundColor: "white" }} />
            </span>
          </summary>

          <div style={{ position: "fixed", top: "56px", right: 0, width: "78%", maxWidth: "300px", bottom: 0, backgroundColor: "#18181b", zIndex: 450, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: "1px solid #27272a", boxShadow: "-4px 0 20px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", textDecoration: "none", color: l.href === "/dashboard" ? "white" : "#d4d4d8", backgroundColor: l.href === "/dashboard" ? "#2563eb" : "transparent", fontSize: "16px" }}>
                  <span style={{ fontSize: "22px" }}>{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={logout} style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#dc2626", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px" }}>
              🚪 تسجيل الخروج
            </button>
          </div>
        </details>
      </div>

      <div style={{ display: "flex" }}>
        {/* ===== قائمة الحاسوب الجانبية ===== */}
        <aside className="dt-desktop-aside" style={{ width: "240px", backgroundColor: "#18181b", borderRight: "1px solid #27272a", padding: "24px 16px", minHeight: "100vh", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>AKD</h1>
              <p style={{ color: "#71717a", fontSize: "12px" }}>Dashboard</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", textDecoration: "none", color: l.href === "/dashboard" ? "white" : "#a1a1aa", backgroundColor: l.href === "/dashboard" ? "#2563eb" : "transparent" }}>
                  <span>{l.icon}</span>
                  <span style={{ fontSize: "14px" }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#dc2626", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            تسجيل الخروج
          </button>
        </aside>

        {/* ===== المحتوى ===== */}
        <div className="dt-content" style={{ flex: 1 }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>لوحة التحكم</h1>
            <p style={{ color: "#71717a", marginTop: "4px", fontSize: "14px" }}>مرحباً بك في لوحة تحكم AKD</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            {stats.map(s => (
              <div key={s.label} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "16px" }}>
                <p style={{ color: "#a1a1aa", fontSize: "12px", marginBottom: "8px" }}>{s.label}</p>
                <h2 style={{ fontSize: "40px", fontWeight: "bold", color: s.color }}>{s.count}</h2>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>الوصول السريع</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {links.slice(1).map(l => (
              <a key={l.href} href={l.href} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", padding: "16px", textDecoration: "none", color: "white", textAlign: "center", display: "block" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{l.icon}</div>
                <div style={{ fontWeight: "600", fontSize: "13px" }}>{l.label}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
