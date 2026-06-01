"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

interface Ad {
  id: string;
  name: string;
  link: string;
  fileUrl: string;
  fileType: string;
  storagePath: string;
  duration: number;
  createdAt: any;
}

export default function AdsPage() {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [duration, setDuration] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [expiredAds, setExpiredAds] = useState<Set<string>>(new Set());

  const fetchAds = async () => {
    const snapshot = await getDocs(collection(db, "ads"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Ad[];
    setAds(data);
  };

  useEffect(() => { fetchAds(); }, []);

  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed",
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(percent);
        },
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const addAd = async () => {
    if (!name || !file) return alert("ادخل اسم الاعلان واختر ملف");
    setLoading(true);
    setSuccess(false);
    try {
      const path = `ads/${Date.now()}_${file.name}`;
      const fileUrl = await uploadFile(file, path);
      await addDoc(collection(db, "ads"), {
        name, link, fileUrl, fileType: file.type, storagePath: path,
        duration, createdAt: serverTimestamp()
      });
      setName(""); setLink(""); setFile(null); setProgress(0); setDuration(10);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchAds();
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const deleteAd = async (ad: Ad) => {
    await deleteDoc(doc(db, "ads", ad.id));
    if (ad.storagePath) {
      try { await deleteObject(ref(storage, ad.storagePath)); } catch {}
    }
    await fetchAds();
  };

  const handleAdEnd = (id: string) => {
    setExpiredAds(prev => new Set(prev).add(id));
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#09090b", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px" }} className="page-body">

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>الاعلانات</h1>
          <p style={{ color: "#71717a", marginTop: "4px", fontSize: "14px" }}>ادارة اعلانات الموقع</p>
        </div>

        {success && (
          <div style={{ backgroundColor: "#16a34a", color: "white", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600" }}>
            تم رفع الاعلان بنجاح!
          </div>
        )}

        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>اضافة اعلان جديد</h2>

          <input
            type="text"
            placeholder="اسم الاعلان"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
          />

          <input
            type="text"
            placeholder="رابط الاعلان (اختياري) - يفتح عند الضغط"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
          />

          <div style={{ marginBottom: "12px" }}>
            <label style={{ color: "#a1a1aa", fontSize: "14px", display: "block", marginBottom: "8px" }}>مدة الاعلان (بالثواني)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #3f3f46", borderRadius: "12px", padding: "30px", cursor: "pointer", marginBottom: "16px", backgroundColor: "#09090b" }}>
            <span style={{ fontSize: "32px", marginBottom: "8px" }}>📁</span>
            <span style={{ fontWeight: "600", marginBottom: "4px" }}>{file ? file.name : "اختر صورة او فيديو"}</span>
            <span style={{ color: "#71717a", fontSize: "13px" }}>JPG, PNG, MP4, MOV</span>
            <input type="file" accept="image/*,video/*" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          {loading && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#71717a" }}>جاري الرفع...</span>
                <span style={{ fontSize: "13px", color: "#60a5fa" }}>{progress}%</span>
              </div>
              <div style={{ backgroundColor: "#27272a", borderRadius: "99px", height: "8px" }}>
                <div style={{ backgroundColor: "#2563eb", height: "8px", borderRadius: "99px", width: `${progress}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          )}

          <button
            onClick={addAd}
            disabled={loading}
            style={{ backgroundColor: "#2563eb", color: "white", fontWeight: "bold", padding: "12px 32px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
          >
            {loading ? `جاري الرفع... ${progress}%` : "حفظ الاعلان"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ads.length === 0 && (
            <p style={{ color: "#71717a", textAlign: "center", padding: "40px 0" }}>لا توجد اعلانات بعد.</p>
          )}
          {ads.map((ad) => (
            <div key={ad.id} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>{ad.name}</h3>
                  {ad.link && <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: "13px" }}>{ad.link}</a>}
                  <p style={{ color: "#71717a", fontSize: "13px", marginTop: "4px" }}>المدة: {ad.duration} ثانية</p>
                </div>
                <button
                  onClick={() => deleteAd(ad)}
                  style={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold", padding: "8px 20px", borderRadius: "10px", border: "none", cursor: "pointer" }}
                >
                  حذف
                </button>
              </div>

              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                {ad.fileType?.startsWith("video") ? (
                  <video
                    src={ad.fileUrl}
                    style={{ width: "100%", maxWidth: "500px", borderRadius: "12px", display: "block" }}
                    onEnded={() => handleAdEnd(ad.id)}
                    onClick={() => ad.link && window.open(ad.link, "_blank")}
                    autoPlay
                    muted
                  />
                ) : (
                  <img
                    src={ad.fileUrl}
                    alt={ad.name}
                    style={{ width: "100%", maxWidth: "500px", borderRadius: "12px", display: "block", cursor: ad.link ? "pointer" : "default" }}
                    onClick={() => ad.link && window.open(ad.link, "_blank")}
                  />
                )}

                {expiredAds.has(ad.id) && ad.link && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
                    <a href={ad.link} target="_blank" rel="noopener noreferrer"
                      style={{ backgroundColor: "#2563eb", color: "white", fontWeight: "bold", padding: "14px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "16px" }}>
                      اضغط هنا
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
