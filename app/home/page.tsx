"use client";

import { useEffect, useState } from "react";

interface MediaFile { url: string; type: string; }
interface Post { id: string; title: string; description: string; link: string; files: MediaFile[]; imageUrl?: string; }
interface Video { id: string; title: string; description: string; videoUrl: string; }
interface Ad { id: string; name: string; link: string; fileUrl: string; fileType: string; }

function parseDoc(doc: any) {
  const fields = doc.fields || {};
  const parsed: any = {};
  const name = doc.name || "";
  parsed.id = name.split("/").pop();
  for (const key in fields) {
    const val = fields[key];
    if (val.stringValue !== undefined) parsed[key] = val.stringValue;
    else if (val.integerValue !== undefined) parsed[key] = Number(val.integerValue);
    else if (val.doubleValue !== undefined) parsed[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) parsed[key] = val.booleanValue;
    else if (val.arrayValue) {
      parsed[key] = (val.arrayValue.values || []).map((v: any) => {
        if (v.mapValue) {
          const obj: any = {};
          for (const k in v.mapValue.fields) {
            const f = v.mapValue.fields[k];
            if (f.stringValue !== undefined) obj[k] = f.stringValue;
          }
          return obj;
        }
        return v.stringValue || "";
      });
    }
  }
  return parsed;
}

async function fetchCollection(name: string) {
  const url = "https://firestore.googleapis.com/v1/projects/akd-web/databases/(default)/documents/" + name;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return (data.documents || []).map(parseDoc);
}

function MediaSlider({ files, link }: { files: MediaFile[]; link: string }) {
  const [c, setC] = useState(0);
  if (!files || files.length === 0) return null;
  return (
    <div>
      <div style={{ borderRadius: "10px", overflow: "hidden" }}>
        {files[c]?.type?.startsWith("video") ? (
          <video src={files[c].url} controls playsInline style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
        ) : (
          <img src={files[c].url} alt="" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block", cursor: link ? "pointer" : "default" }}
            onClick={() => link && window.open(link, "_blank")} />
        )}
      </div>
      {files.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", padding: "8px 0" }}>
          <button onClick={() => setC(p => Math.max(0, p - 1))} style={{ backgroundColor: "#222", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer" }}>◀</button>
          <span style={{ color: "#888", fontSize: "13px" }}>{c + 1}/{files.length}</span>
          <button onClick={() => setC(p => Math.min(files.length - 1, p + 1))} style={{ backgroundColor: "#222", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer" }}>▶</button>
        </div>
      )}
    </div>
  );
}

const DAYS_AR = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const DAYS_EN = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [lang, setLang] = useState<"ar"|"en">("ar");

  const fetchData = async () => {
    setStatus("loading");
    setMsg("");
    try {
      const [p, v, a] = await Promise.all([
        fetchCollection("posts"),
        fetchCollection("videos"),
        fetchCollection("ads"),
      ]);
      setPosts(p);
      setVideos(v);
      setAds(a);
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        const snap = await getDoc(doc(db, "settings", "main"));
        if (snap.exists()) setSettings(snap.data());
      } catch(_) {}
      setMsg(p.length + " منشور، " + v.length + " فيديو، " + a.length + " إعلان");
      setStatus("done");
    } catch (e: any) {
      setMsg("خطأ: " + e.message);
      setStatus("error");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const isAr = lang === "ar";
  const accent = settings?.primaryColor || "#ff9900";
  const hasContent = posts.length > 0 || videos.length > 0 || ads.length > 0;

  const offDays: string[] = settings?.offDays
    ? settings.offDays.split(",").map((d: string) => d.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "white", direction: isAr ? "rtl" : "ltr" }}>

      {/* ===== NAV ===== */}
      <nav style={{ backgroundColor: "#1a1a1a", borderBottom: `2px solid ${accent}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: accent, fontWeight: "bold", fontSize: "22px" }}>
          {settings ? (isAr ? settings.siteName : settings.siteNameEn) || "AKD WEB" : "AKD WEB"}
        </span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            style={{ backgroundColor: "#333", color: "white", border: `1px solid ${accent}`, borderRadius: "20px", padding: "5px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <span style={{ color: "#ccc", fontSize: "14px" }}>{isAr ? "الرئيسية" : "Home"}</span>
        </div>
      </nav>

      {/* ===== HERO / BIO ===== */}
      {settings && (
        <div style={{ backgroundColor: "#0a0a0a", padding: "40px 16px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "16px" }}>
              {isAr ? settings.siteName : settings.siteNameEn}
            </h1>
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="logo"
                style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, display: "block", margin: "0 auto 16px" }} />
            )}
            {settings.status && (
              <span style={{ backgroundColor: settings.statusColor || "#16a34a", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "13px", display: "inline-block", marginBottom: "16px" }}>
                {isAr ? settings.status : settings.statusEn}
              </span>
            )}
            {settings.bio && (
              <p style={{ color: "#aaa", lineHeight: "1.9", fontSize: "15px", margin: "0 auto" }}>
                {isAr ? settings.bio : settings.bioEn}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== COMPANY ACTIVITIES ===== */}
      {settings?.companyDesc && (
        <div style={{ backgroundColor: "#0d0d0d", padding: "32px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ color: accent, fontSize: "18px", fontWeight: "bold", marginBottom: "16px", textAlign: "center" }}>
              {isAr ? "نشاطات الشركة" : "Company Activities"}
            </h2>
            <p style={{ color: "#bbb", lineHeight: "1.9", fontSize: "15px" }}>
              {isAr ? settings.companyDesc : settings.companyDescEn}
            </p>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "16px" }}>

        {msg && (
          <div style={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: status === "error" ? "#ef4444" : accent, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{msg}</span>
            {status === "error" && (
              <button onClick={fetchData} style={{ backgroundColor: accent, color: "#000", border: "none", borderRadius: "8px", padding: "6px 16px", cursor: "pointer", fontWeight: "bold" }}>
                {isAr ? "إعادة" : "Retry"}
              </button>
            )}
          </div>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #333", borderTop: `4px solid ${accent}`, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#888" }}>{isAr ? "جاري التحميل..." : "Loading..."}</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#ef4444", marginBottom: "16px" }}>⚠️ {isAr ? "فشل تحميل البيانات" : "Failed to load"}</p>
            <button onClick={fetchData} style={{ backgroundColor: accent, color: "#000", border: "none", borderRadius: "10px", padding: "12px 32px", cursor: "pointer", fontWeight: "bold" }}>
              {isAr ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        )}

        {status === "done" && !hasContent && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
            <p>{isAr ? "لا يوجد محتوى بعد." : "No content yet."}</p>
          </div>
        )}

        {ads.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "12px", cursor: ad.link ? "pointer" : "default", position: "relative" }}
                onClick={() => ad.link && window.open(ad.link, "_blank")}>
                {ad.fileType?.startsWith("video") ? (
                  <video src={ad.fileUrl} autoPlay muted loop playsInline style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                ) : (
                  <img src={ad.fileUrl} alt={ad.name} style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                )}
                <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.75)", color: accent, padding: "5px 12px", borderRadius: "8px", fontSize: "12px" }}>
                  {isAr ? "إعلان" : "Ad"} — {ad.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", paddingBottom: "8px", borderBottom: `2px solid ${accent}`, display: "inline-block" }}>
              📝 {isAr ? "المنشورات" : "Posts"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {posts.map(post => (
                <div key={post.id} style={{ backgroundColor: "#111", borderRadius: "14px", overflow: "hidden", border: "1px solid #222" }}>
                  {post.files && post.files.length > 0 ? (
                    <MediaSlider files={post.files} link={post.link || ""} />
                  ) : post.imageUrl ? (
                    <img src={post.imageUrl} alt="" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
                  ) : null}
                  <div style={{ padding: "14px" }}>
                    <h3 style={{ fontWeight: "bold", fontSize: "17px", marginBottom: "6px" }}>{post.title}</h3>
                    {post.description && <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.6", marginBottom: "8px" }}>{post.description}</p>}
                    {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: "13px", textDecoration: "none" }}>🔗 {isAr ? "فتح الرابط" : "Open Link"}</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", paddingBottom: "8px", borderBottom: `2px solid ${accent}`, display: "inline-block" }}>
              🎬 {isAr ? "الفيديوهات" : "Videos"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {videos.map(video => (
                <div key={video.id} style={{ backgroundColor: "#111", borderRadius: "14px", overflow: "hidden", border: "1px solid #222" }}>
                  <video src={video.videoUrl} controls playsInline style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "14px" }}>
                    <h3 style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{video.title || (isAr ? "بدون عنوان" : "Untitled")}</h3>
                    {video.description && <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>{video.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== CONTACT & SOCIAL ===== */}
      {settings && (
        <div style={{ backgroundColor: "#0f0f0f", borderTop: "1px solid #222", padding: "40px 16px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "28px", color: accent }}>
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h2>

            {/* Contact Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "28px" }}>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} style={{ color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#1a1a1a", padding: "10px 18px", borderRadius: "10px", border: "1px solid #333" }}>
                  📞 {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} style={{ color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#1a1a1a", padding: "10px 18px", borderRadius: "10px", border: "1px solid #333" }}>
                  ✉️ {settings.email}
                </a>
              )}
              {settings.address && (
                <span style={{ color: "#ccc", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#1a1a1a", padding: "10px 18px", borderRadius: "10px", border: "1px solid #333" }}>
                  📍 {isAr ? settings.address : settings.addressEn || settings.address}
                </span>
              )}
              {settings.mapLink && (
                <a href={settings.mapLink} target="_blank" rel="noreferrer" style={{ color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#1a1a1a", padding: "10px 18px", borderRadius: "10px", border: "1px solid #333" }}>
                  🗺️ {isAr ? "الخريطة" : "Map"}
                </a>
              )}
            </div>

            {/* Social Icons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                  style={{ backgroundColor: "#25D366", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer"
                  style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook.startsWith("http") ? settings.facebook : `https://facebook.com/${settings.facebook}`} target="_blank" rel="noreferrer"
                  style={{ backgroundColor: "#1877F2", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
            </div>

            {/* Working Hours Table */}
            {settings.openTime && (
              <div style={{ overflowX: "auto" }}>
                <h3 style={{ color: accent, marginBottom: "16px", textAlign: "center", fontSize: "16px" }}>
                  🕐 {isAr ? "أوقات العمل" : "Working Hours"}
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#ccc", maxWidth: "500px", margin: "0 auto" }}>
                  <tbody>
                    {(isAr ? DAYS_AR : DAYS_EN).map((day, i) => {
                      const isOff = offDays.includes(String(i));
                      return (
                        <tr key={day} style={{ borderBottom: "1px solid #222" }}>
                          <td style={{ padding: "10px 16px", fontWeight: "500" }}>{day}</td>
                          <td style={{ padding: "10px 16px", textAlign: "center", color: isOff ? "#ef4444" : "#4ade80", fontWeight: "bold" }}>
                            {isOff
                              ? (isAr ? "مغلق" : "Closed")
                              : `${settings.openTime} - ${settings.closeTime}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div style={{ backgroundColor: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "24px 16px", textAlign: "center" }}>
        <a href="/login"
          style={{ display: "inline-block", backgroundColor: accent, color: "black", padding: "8px 28px", borderRadius: "20px", textDecoration: "none", fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>
          {isAr ? "تسجيل الدخول" : "Login"}
        </a>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          {isAr ? "AKD WEB 2025 © — جميع الحقوق محفوظة" : "AKD WEB 2025 © — All Rights Reserved"}
        </p>
      </div>

    </div>
  );
}
