"use client";
import FooterSocial from "../components/FooterSocial";

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

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

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
      setMsg(p.length + " منشور، " + v.length + " فيديو، " + a.length + " إعلان");
      setStatus("done");
    } catch (e: any) {
      setMsg("خطأ: " + e.message);
      setStatus("error");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const hasContent = posts.length > 0 || videos.length > 0 || ads.length > 0;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "white", direction: "rtl" }}>

      <nav style={{ backgroundColor: "#1a1a1a", borderBottom: "2px solid #ff9900", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: "#ff9900", fontWeight: "bold", fontSize: "22px" }}>AKD WEB</span>
        <span style={{ color: "#ccc", fontSize: "14px" }}>الرئيسية</span>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "16px" }}>

        {msg && (
          <div style={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: status === "error" ? "#ef4444" : "#ff9900", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{msg}</span>
            {status === "error" && (
              <button onClick={fetchData} style={{ backgroundColor: "#ff9900", color: "#000", border: "none", borderRadius: "8px", padding: "6px 16px", cursor: "pointer", fontWeight: "bold" }}>
                إعادة
              </button>
            )}
          </div>
        )}

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #333", borderTop: "4px solid #ff9900", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#888" }}>جاري التحميل...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#ef4444", marginBottom: "16px" }}>⚠️ فشل تحميل البيانات</p>
            <button onClick={fetchData} style={{ backgroundColor: "#ff9900", color: "#000", border: "none", borderRadius: "10px", padding: "12px 32px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
              إعادة المحاولة
            </button>
          </div>
        )}

        {status === "done" && !hasContent && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
            <p>لا يوجد محتوى بعد.</p>
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
                <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.75)", color: "#ff9900", padding: "5px 12px", borderRadius: "8px", fontSize: "12px" }}>
                  إعلان — {ad.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #ff9900", display: "inline-block" }}>📝 المنشورات</h2>
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
                    {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: "#ff9900", fontSize: "13px", textDecoration: "none" }}>🔗 فتح الرابط</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #ff9900", display: "inline-block" }}>🎬 الفيديوهات</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {videos.map(video => (
                <div key={video.id} style={{ backgroundColor: "#111", borderRadius: "14px", overflow: "hidden", border: "1px solid #222" }}>
                  <video src={video.videoUrl} controls playsInline style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "14px" }}>
                    <h3 style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{video.title || "بدون عنوان"}</h3>
                    {video.description && <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>{video.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FooterSocial />
    </div>
  );
}
