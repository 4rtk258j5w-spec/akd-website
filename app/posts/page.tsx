"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

interface MediaFile {
  url: string;
  type: string;
  storagePath: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  link: string;
  files: MediaFile[];
  createdAt: any;
}

function MediaSlider({ files, link }: { files: MediaFile[], link: string }) {
  const [current, setCurrent] = useState(0);
  return (
    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
      <div style={{ display: "flex", transition: "transform 0.3s", transform: `translateX(${current * 100}%)`, width: `${files.length * 100}%` }}>
        {files.map((f, i) => (
          <div key={i} style={{ minWidth: `${100 / files.length}%` }}>
            {f.type.startsWith("video") ? (
              <video src={f.url} controls style={{ width: "100%", maxHeight: "300px", borderRadius: "12px" }} />
            ) : f.type === "application/pdf" ? (
              <a href={f.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#27272a", padding: "40px", borderRadius: "12px", color: "white", textDecoration: "none", fontSize: "16px" }}>
                📄 فتح PDF
              </a>
            ) : (
              <img src={f.url} alt="" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "12px", cursor: link ? "pointer" : "default" }}
                onClick={() => link && window.open(link, "_blank")} />
            )}
          </div>
        ))}
      </div>
      {files.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))}
            style={{ backgroundColor: "#27272a", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer" }}>
            &#8592;
          </button>
          <span style={{ color: "#a1a1aa", fontSize: "13px", alignSelf: "center" }}>{current + 1} / {files.length}</span>
          <button onClick={() => setCurrent(p => Math.min(files.length - 1, p + 1))}
            style={{ backgroundColor: "#27272a", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer" }}>
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed",
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  };

  const addPost = async () => {
    if (!title) return alert("ادخل عنوان المنشور");
    setLoading(true); setSuccess(false);
    try {
      const uploadedFiles: MediaFile[] = [];
      for (const file of files) {
        const path = `posts/${Date.now()}_${file.name}`;
        const url = await uploadFile(file, path);
        uploadedFiles.push({ url, type: file.type, storagePath: path });
      }
      await addDoc(collection(db, "posts"), { title, description, link, files: uploadedFiles, createdAt: serverTimestamp() });
      setTitle(""); setDescription(""); setLink(""); setFiles([]); setProgress(0);
      setLoading(false); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchPosts();
    } catch (error: any) { alert(error.message); setLoading(false); }
  };

  const deletePost = async (post: Post) => {
    await deleteDoc(doc(db, "posts", post.id));
    for (const f of post.files || []) {
      try { await deleteObject(ref(storage, f.storagePath)); } catch {}
    }
    await fetchPosts();
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#09090b", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px" }} className="page-body">

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>المنشورات</h1>
          <p style={{ color: "#71717a", marginTop: "4px", fontSize: "14px" }}>ادارة منشورات الموقع</p>
        </div>

        {success && (
          <div style={{ backgroundColor: "#16a34a", color: "white", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600" }}>
            تم نشر المنشور بنجاح!
          </div>
        )}

        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>اضافة منشور جديد</h2>

          <input type="text" placeholder="عنوان المنشور" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box" }} />

          <textarea placeholder="وصف المنشور (اختياري)" value={description} onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box", height: "80px", resize: "vertical" }} />

          <input type="text" placeholder="رابط اختياري (يفتح عند الضغط على الصورة)" value={link} onChange={(e) => setLink(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", color: "white", marginBottom: "12px", outline: "none", boxSizing: "border-box" }} />

          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #3f3f46", borderRadius: "12px", padding: "30px", cursor: "pointer", marginBottom: "16px", backgroundColor: "#09090b" }}>
            <span style={{ fontSize: "32px", marginBottom: "8px" }}>📁</span>
            <span style={{ fontWeight: "600", marginBottom: "4px" }}>{files.length > 0 ? `${files.length} ملف مختار` : "اختر صور / فيديوهات / PDF"}</span>
            <span style={{ color: "#71717a", fontSize: "13px" }}>حتى 10 ملفات — JPG, PNG, MP4, PDF</span>
            <input type="file" accept="image/*,video/*,application/pdf" multiple hidden
              onChange={(e) => {
                const selected = Array.from(e.target.files || []).slice(0, 10);
                setFiles(selected);
              }} />
          </label>

          {files.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {files.map((f, i) => (
                <span key={i} style={{ backgroundColor: "#27272a", padding: "4px 12px", borderRadius: "8px", fontSize: "13px", color: "#a1a1aa" }}>
                  {f.name.length > 20 ? f.name.slice(0, 20) + "..." : f.name}
                </span>
              ))}
            </div>
          )}

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
            <button onClick={addPost} disabled={loading}
              style={{ backgroundColor: "#2563eb", color: "white", fontWeight: "bold", padding: "12px 32px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}>
              {loading ? `جاري الرفع... ${progress}%` : "نشر المنشور"}
            </button>
            <button onClick={() => { setTitle(""); setDescription(""); setLink(""); setFiles([]); }}
              style={{ backgroundColor: "#27272a", color: "white", fontWeight: "bold", padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer" }}>
              مسح
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {posts.length === 0 && <p style={{ color: "#71717a", textAlign: "center", padding: "40px 0" }}>لا توجد منشورات بعد.</p>}
          {posts.map((post) => (
            <div key={post.id} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontWeight: "600", fontSize: "18px", marginBottom: "4px" }}>{post.title}</h3>
                  {post.description && <p style={{ color: "#71717a", fontSize: "14px", marginBottom: "4px" }}>{post.description}</p>}
                  {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: "13px" }}>{post.link}</a>}
                </div>
                <button onClick={() => deletePost(post)}
                  style={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold", padding: "8px 20px", borderRadius: "10px", border: "none", cursor: "pointer" }}>
                  حذف
                </button>
              </div>
              {post.files && post.files.length > 0 && (
                <MediaSlider files={post.files} link={post.link} />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
