"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AboutPage() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "main")).then((s) => {
      if (s.exists()) setD(s.data());
    });
  }, []);

  if (!d) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666" }}>جاري التحميل...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "white", fontFamily: "sans-serif", direction: "rtl" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#111", borderBottom: "1px solid #222", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <a href="/home" style={{ color: "#ff9900", textDecoration: "none", fontSize: "14px" }}>← الرئيسية</a>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>السيرة الذاتية / About</h1>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Logo & Name */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {d.logoUrl && (
            <img src={d.logoUrl} alt="logo" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%", marginBottom: "16px", border: "3px solid #ff9900" }} />
          )}
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>{d.siteName || d.siteNameEn}</h2>
          {d.status && (
            <span style={{ backgroundColor: d.statusColor || "#16a34a", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "13px" }}>
              {d.status}
            </span>
          )}
        </div>

        {/* Bio */}
        {d.bio && (
          <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ color: "#ff9900", marginBottom: "12px", fontSize: "16px" }}>نبذة عن الموقع</h3>
            <p style={{ lineHeight: "1.8", color: "#ccc" }}>{d.bio}</p>
          </div>
        )}

        {/* Company Description */}
        {d.companyDesc && (
          <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ color: "#ff9900", marginBottom: "12px", fontSize: "16px" }}>نشاطات الشركة</h3>
            <p style={{ lineHeight: "1.8", color: "#ccc" }}>{d.companyDesc}</p>
          </div>
        )}

        {/* Contact Info */}
        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ color: "#ff9900", marginBottom: "16px", fontSize: "16px" }}>معلومات التواصل</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {d.phone && (
              <a href={`tel:${d.phone}`} style={{ color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📞</span> {d.phone}
              </a>
            )}
            {d.email && (
              <a href={`mailto:${d.email}`} style={{ color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>✉️</span> {d.email}
              </a>
            )}
            {d.address && (
              <div style={{ color: "#ccc", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📍</span> {d.address}
              </div>
            )}
            {d.openTime && (
              <div style={{ color: "#ccc", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🕐</span> {d.openTime} - {d.closeTime}
              </div>
            )}
          </div>
        </div>

        {/* Social Media */}
        {(d.whatsapp || d.instagram || d.facebook) && (
          <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ color: "#ff9900", marginBottom: "16px", fontSize: "16px" }}>وسائل التواصل الاجتماعي</h3>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {d.whatsapp && (
                <a href={`https://wa.me/${d.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  style={{ backgroundColor: "#25D366", color: "white", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {d.instagram && (
                <a href={d.instagram.startsWith("http") ? d.instagram : `https://instagram.com/${d.instagram}`} target="_blank" rel="noreferrer"
                  style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "white", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              )}
              {d.facebook && (
                <a href={d.facebook.startsWith("http") ? d.facebook : `https://facebook.com/${d.facebook}`} target="_blank" rel="noreferrer"
                  style={{ backgroundColor: "#1877F2", color: "white", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        {d.mapLink && (
          <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "24px" }}>
            <h3 style={{ color: "#ff9900", marginBottom: "16px", fontSize: "16px" }}>الموقع على الخريطة</h3>
            <a href={d.mapLink} target="_blank" rel="noreferrer"
              style={{ backgroundColor: "#27272a", color: "#ccc", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              📍 فتح على الخريطة
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
