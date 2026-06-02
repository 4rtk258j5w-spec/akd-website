"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function SetupPage() {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [storedOwnerUid, setStoredOwnerUid] = useState<string | null>(null);
  const [firestoreOwnerUid, setFirestoreOwnerUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Read from localStorage
    const localOwner = localStorage.getItem("akd_owner_uid");
    setStoredOwnerUid(localOwner);

    // Read from Firestore
    getDoc(doc(db, "settings", "main")).then((snap) => {
      if (snap.exists() && snap.data().ownerUid) {
        setFirestoreOwnerUid(snap.data().ownerUid);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user ? user.uid : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setAsOwner = async () => {
    if (!currentUid) return alert("يجب تسجيل الدخول أولاً");
    setSaving(true);
    try {
      localStorage.setItem("akd_owner_uid", currentUid);
      setStoredOwnerUid(currentUid);

      // Merge into Firestore settings/main
      await setDoc(doc(db, "settings", "main"), { ownerUid: currentUid }, { merge: true });
      setFirestoreOwnerUid(currentUid);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  const sec: React.CSSProperties = {
    backgroundColor: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "20px",
    maxWidth: "520px",
  };

  const uidBox: React.CSSProperties = {
    backgroundColor: "#09090b",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "10px 14px",
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#a1a1aa",
    wordBreak: "break-all",
    marginTop: "6px",
  };

  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh", color: "white", padding: "40px 24px", direction: "rtl" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "6px" }}>إعداد المالك (Owner)</h1>
          <p style={{ color: "#71717a", fontSize: "14px" }}>
            صفحة إعداد لمرة واحدة — قم بتعيين حسابك الحالي كمالك للوحة التحكم.
          </p>
        </div>

        {loading ? (
          <p style={{ color: "#71717a" }}>جاري التحميل...</p>
        ) : (
          <>
            {success && (
              <div style={{ backgroundColor: "#16a34a", color: "white", padding: "12px 18px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600" }}>
                تم تعيينك كمالك بنجاح!
              </div>
            )}

            <div style={sec}>
              <p style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "4px" }}>حسابك الحالي (UID)</p>
              <div style={uidBox}>{currentUid || "غير مسجل الدخول"}</div>
            </div>

            <div style={sec}>
              <p style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "4px" }}>المالك المحفوظ في المتصفح (localStorage)</p>
              <div style={uidBox}>{storedOwnerUid || "لم يُعيَّن بعد"}</div>
            </div>

            <div style={sec}>
              <p style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "4px" }}>المالك المحفوظ في Firestore</p>
              <div style={uidBox}>{firestoreOwnerUid || "لم يُعيَّن بعد"}</div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={setAsOwner}
                disabled={saving || !currentUid}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "white",
                  fontWeight: "bold",
                  padding: "13px 28px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: saving || !currentUid ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  opacity: saving || !currentUid ? 0.7 : 1,
                }}
              >
                {saving ? "جاري الحفظ..." : "تعيينك كمالك (Owner)"}
              </button>
              <Link
                href="/admin"
                style={{
                  backgroundColor: "#27272a",
                  color: "white",
                  fontWeight: "600",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "15px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                العودة لإدارة الأدمنز
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
