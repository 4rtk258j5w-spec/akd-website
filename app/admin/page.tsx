"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db, firebaseConfig } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface Permissions {
  posts: boolean;
  videos: boolean;
  ads: boolean;
  settings: boolean;
  admins: boolean;
}

interface Admin {
  uid: string;
  email: string;
  displayName: string;
  permissions: Permissions;
  role: string;
  createdAt: string;
}

const PERM_LABELS: { key: keyof Permissions; label: string }[] = [
  { key: "posts", label: "المنشورات" },
  { key: "videos", label: "الفيديوهات" },
  { key: "ads", label: "الإعلانات" },
  { key: "settings", label: "الإعدادات" },
  { key: "admins", label: "إدارة الأدمنز" },
];

const DEFAULT_PERMS: Permissions = {
  posts: false,
  videos: false,
  ads: false,
  settings: false,
  admins: false,
};

const is: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  backgroundColor: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "10px",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "12px",
  fontSize: "14px",
};

const lb: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#a1a1aa",
  fontSize: "13px",
};

const sec: React.CSSProperties = {
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "24px",
};

export default function AdminPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<Permissions>({ ...DEFAULT_PERMS });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchAdmins = async () => {
    const snapshot = await getDocs(collection(db, "admins"));
    const data = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })) as Admin[];
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const togglePerm = (key: keyof Permissions) => {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  };

  const setAllPerms = (val: boolean) => {
    setPerms({ posts: val, videos: val, ads: val, settings: val, admins: val });
  };

  const addAdmin = async () => {
    if (!displayName.trim()) return setError("أدخل الاسم");
    if (!email.trim()) return setError("أدخل البريد الإلكتروني");
    if (password.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use secondary Firebase app so current session isn't logged out
      const secondaryApp =
        getApps().find((a) => a.name === "secondary") ||
        initializeApp(firebaseConfig, "secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = cred.user.uid;

      await setDoc(doc(db, "admins", uid), {
        email,
        displayName,
        permissions: perms,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      setDisplayName("");
      setEmail("");
      setPassword("");
      setPerms({ ...DEFAULT_PERMS });
      setSuccess("تم إضافة الأدمن بنجاح!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchAdmins();
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    }
    setLoading(false);
  };

  const deleteAdmin = async (uid: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الأدمن؟")) return;
    await deleteDoc(doc(db, "admins", uid));
    await fetchAdmins();
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#09090b", minHeight: "100vh", color: "white" }} dir="rtl">
      <Sidebar />
      <div style={{ flex: 1, padding: "32px", overflowY: "auto" }} className="page-body">

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>إدارة الأدمنز</h1>
          <p style={{ color: "#71717a", marginTop: "4px", fontSize: "14px" }}>إضافة وإدارة صلاحيات المشرفين</p>
        </div>

        {success && (
          <div style={{ backgroundColor: "#16a34a", color: "white", padding: "12px 18px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600" }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: "#dc2626", color: "white", padding: "12px 18px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {/* Add Admin Form */}
        <div style={sec}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "#0EA5E9" }}>إضافة أدمن جديد</h2>

          <label style={lb}>الاسم</label>
          <input
            style={is}
            placeholder="اسم المشرف"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <label style={lb}>البريد الإلكتروني</label>
          <input
            style={is}
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={lb}>كلمة المرور</label>
          <input
            style={is}
            type="password"
            placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label style={{ ...lb, marginBottom: "12px" }}>الصلاحيات</label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            {PERM_LABELS.map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: perms[key] ? "#1d4ed8" : "#27272a",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  border: `1px solid ${perms[key] ? "#2563eb" : "#3f3f46"}`,
                  userSelect: "none",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={perms[key]}
                  onChange={() => togglePerm(key)}
                  style={{ accentColor: "#2563eb", width: "16px", height: "16px" }}
                />
                {label}
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setAllPerms(true)}
              style={{ backgroundColor: "#7c3aed", color: "white", fontWeight: "600", padding: "9px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "14px" }}
            >
              صلاحيات كاملة
            </button>
            <button
              onClick={() => setAllPerms(false)}
              style={{ backgroundColor: "#27272a", color: "#a1a1aa", fontWeight: "600", padding: "9px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "14px" }}
            >
              مسح الصلاحيات
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={addAdmin}
              disabled={loading}
              style={{ backgroundColor: "#2563eb", color: "white", fontWeight: "bold", padding: "12px 32px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "15px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "جاري الإضافة..." : "إضافة الأدمن"}
            </button>
          </div>
        </div>

        {/* Admins List */}
        <div style={sec}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "#0EA5E9" }}>
            قائمة الأدمنز ({admins.length})
          </h2>

          {admins.length === 0 && (
            <p style={{ color: "#71717a", textAlign: "center", padding: "32px 0" }}>لا يوجد أدمنز بعد.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {admins.map((admin) => (
              <div
                key={admin.uid}
                style={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "18px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "16px", marginBottom: "4px" }}>{admin.displayName}</p>
                    <p style={{ color: "#71717a", fontSize: "13px", marginBottom: "8px" }}>{admin.email}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {PERM_LABELS.map(({ key, label }) => (
                        <span
                          key={key}
                          style={{
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: admin.permissions?.[key] ? "#1d4ed8" : "#27272a",
                            color: admin.permissions?.[key] ? "white" : "#71717a",
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: "#52525b", fontSize: "11px", marginTop: "8px" }}>
                      أُضيف: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("ar-IQ") : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAdmin(admin.uid)}
                    style={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold", padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", flexShrink: 0 }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
