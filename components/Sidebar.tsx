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
      <style>{`
        .sb-desktop { display: flex; }
        .sb-mobilebar { display: none; }
        details.sb-menu > summary { list-style: none; }
        details.sb-menu > summary::-webkit-details-marker { display: none; }
        @media (max-width: 768px) {
          .sb-desktop { display: none !important; }
          .sb-mobilebar { display: block !important; }
        }
      `}</style>

      {/* ===== قائمة الموبايل (details - تشتغل بدون جافاسكربت) ===== */}
      <div className="sb-mobilebar">
        <details className="sb-menu">
          <summary style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, backgroundColor: "#18181b", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #27272a", cursor: "pointer", color: "white", WebkitTapHighlightColor: "transparent" }}>
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
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", textDecoration: "none", color: pathname === l.href ? "white" : "#d4d4d8", backgroundColor: pathname === l.href ? "#2563eb" : "transparent", fontSize: "16px" }}>
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

      {/* ===== قائمة الحاسوب الجانبية ===== */}
      <aside className="sb-desktop" style={{ width: "240px", backgroundColor: "#18181b", borderRight: "1px solid #27272a", color: "white", padding: "24px 16px", minHeight: "100vh", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}>
        <div>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>AKD</h1>
            <p style={{ color: "#71717a", fontSize: "12px", margin: "4px 0 0" }}>Dashboard</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {links.map(l => (
              <Link key={l.href} href={l.href}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", textDecoration: "none", color: pathname === l.href ? "white" : "#a1a1aa", backgroundColor: pathname === l.href ? "#2563eb" : "transparent" }}>
                <span>{l.icon}</span>
                <span style={{ fontSize: "14px" }}>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#dc2626", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px" }}>
          تسجيل الخروج
        </button>
      </aside>
    </>
  );
}
