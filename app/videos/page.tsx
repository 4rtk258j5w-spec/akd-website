"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  storagePath: string;
  createdAt: any;
}

export default function VideosPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchVideos = async () => {
    const snapshot = await getDocs(collection(db, "videos"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Video[];
    setVideos(data);
  };

  useEffect(() => { fetchVideos(); }, []);

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

  const addVideo = async () => {
    if (!videoFile) return alert("اختر فيديو");
    setLoading(true);
    setSuccess(false);
    setProgress(0);
    try {
      const videoPath = `videos/${Date.now()}_${videoFile.name}`;
      const videoUrl = await uploadFile(videoFile, videoPath);
      await addDoc(collection(db, "videos"), { title, description, videoUrl, storagePath: videoPath, createdAt: serverTimestamp() });
      await fetchVideos();
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setProgress(0);
      setLoading(false);
      setSuccess(true); setTimeout(() => window.location.reload(), 1500);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const deleteVideo = async (video: Video) => {
    await deleteDoc(doc(db, "videos", video.id));
    if (video.storagePath) {
      try { await deleteObject(ref(storage, video.storagePath)); } catch {}
    }
    await fetchVideos();
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#09090b", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px" }} className="page-body">

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>الفيديوهات</h1>
          <p style={{ color: "#71717a", marginTop: "4px", fontSize: "14px" }}>رفع وادارة فيديوهات الموقع</p>
        </div>

        {success && (
          <div style={{ backgroundColor: "#16a34a", color: "white", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600" }}>
            ✅ تم رفع الفيديو بنجاح!
          </div>
        )}

        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>رفع فيديو جديد</h2>

          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #3f3f46", borderRadius: "12px", padding: "40px", cursor: "pointer", marginBottom: "16px", backgroundColor: "#09090b" }}>
            <span style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</span>
            <span style={{ fontWeight: "600", marginBottom: "4px" }}>{videoFile ? videoFile.name : "اختر فيديو"}</span>
            <span style={{ color: "#71717a", fontSize: "13px" }}>MP4 - MOV - WEBM</span>
            <input type="file" accept="video/*" hidden onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          </label>

          <input
            type="text"
            placeholder="عنوان الفيديو (اختياري)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
          />
          <textarea
            placeholder="وصف الفيديو (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "16px", outline: "none", boxSizing: "border-box", height: "100px", resize: "vertical" }}
          />

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

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={addVideo}
              disabled={loading}
              style={{ backgroundColor: loading ? "#1d4ed8" : "#2563eb", color: "white", fontWeight: "bold", padding: "12px 32px", borderRadius: "12px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px" }}
            >
              {loading ? `جاري الرفع... ${progress}%` : "رفع الفيديو"}
            </button>
            <button
              onClick={() => { setTitle(""); setDescription(""); setVideoFile(null); setProgress(0); setSuccess(false); setLoading(false); }}
              style={{ backgroundColor: "#27272a", color: "white", fontWeight: "bold", padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              مسح
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {videos.length === 0 && (
            <p style={{ color: "#71717a", textAlign: "center", padding: "40px 0" }}>لا توجد فيديوهات بعد.</p>
          )}
          {videos.map((video) => (
            <div key={video.id} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginLeft: "16px" }}>
                <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>{video.title || "بدون عنوان"}</h3>
                {video.description && <p style={{ color: "#71717a", fontSize: "14px", marginBottom: "12px" }}>{video.description}</p>}
                <video src={video.videoUrl} controls style={{ width: "100%", maxWidth: "480px", borderRadius: "10px" }} />
              </div>
              <button
                onClick={() => deleteVideo(video)}
                style={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold", padding: "8px 20px", borderRadius: "10px", border: "none", cursor: "pointer" }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
