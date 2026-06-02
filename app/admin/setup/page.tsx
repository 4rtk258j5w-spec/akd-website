"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import Link from "next/link";

type Step = "confirm" | "done";

export default function SetupPage() {
  const [user, setUser] = useState<any>(null);
  const [firestoreOwner, setFirestoreOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("confirm");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    getDoc(doc(db, "settings", "main")).then((s) => {
      if (s.exists() && s.data().ownerUid) setFirestoreOwner(s.data().ownerUid);
    });
    return () => unsub();
  }, []);

  const confirm = async () => {
    if (!user) return setError("يجب تسجيل الدخول أولاً");
    if (!password) return setError("أدخل كلمة المرور");
    setSaving(true);
    setError("");
    try {
      // Re-authenticate to verify identity
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Save owner
      localStorage.setItem("akd_owner_uid", user.uid);
      await setDoc(doc(db, "settings", "main"), { ownerUid: user.uid }, { merge: true });
      setFirestoreOwner(user.uid);
      setStep("done");
    } catch (e: any) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("كلمة المرور غير صحيحة");
      } else {
        setError(e.message);
      }
    }
    setSaving(false);
  };

  const is: React.CSSProperties = {
    width: "100%", padding: "13px 16px", backgroundColor: "#27272a",
    border: "1px solid #3f3f46", borderRadius: "10px", color: "white",
    outline: "none", fontSize: "15px", boxSizing: "border-box",
  };

  if (loading) return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#71717a" }}>جاري التحميل...</p>
    </div>
  );

  if (!user) return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#ef4444", marginBottom: "16px" }}>يجب تسجيل الدخول أولاً</p>
        <a href="/login" style={{ color: "#3b82f6" }}>تسجيل الدخول</a>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh", color: "white", padding: "40px 24px", direction: "rtl" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {step === "confirm" && (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
                🔐 تأكيد هوية المالك
              </h1>
              <p style={{ color: "#71717a", fontSize: "14px" }}>
                أدخل كلمة مرور حسابك للتحقق من هويتك وتعيينك كمالك للنظام
              </p>
            </div>

            <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", padding: "28px" }}>
              {/* Current account info */}
              <div style={{ backgroundColor: "#09090b", border: "1px solid #3f3f46", borderRadius: "10px", padding: "14px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600" }}>{user.email}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", fontFamily: "monospace" }}>{user.uid.slice(0, 20)}...</p>
                </div>
              </div>

              <label style={{ display: "block", color: "#a1a1aa", fontSize: "13px", marginBottom: "8px" }}>
                كلمة المرور للتأكيد
              </label>
              <input
                type="password"
                style={{ ...is, marginBottom: "16px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirm()}
              />

              {error && (
                <div style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#f87171", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                  ⚠️ {error}
                </div>
              )}

              {firestoreOwner && firestoreOwner !== user.uid && (
                <div style={{ backgroundColor: "#451a03", border: "1px solid #f59e0b", color: "#fbbf24", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ يوجد مالك آخر محدد مسبقاً. هذا سيستبدله.
                </div>
              )}

              <button
                onClick={confirm}
                disabled={saving}
                style={{ width: "100%", backgroundColor: "#7c3aed", color: "white", fontWeight: "bold", padding: "13px", borderRadius: "10px", border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: "15px", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "جاري التحقق..." : "✅ تأكيد وتعيين كمالك"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>تم تعيينك كمالك!</h2>
            <p style={{ color: "#71717a", marginBottom: "32px" }}>لديك الآن صلاحيات كاملة على لوحة التحكم</p>
            <Link href="/admin"
              style={{ backgroundColor: "#7c3aed", color: "white", padding: "13px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "15px" }}>
              الذهاب لإدارة الأدمنز
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
