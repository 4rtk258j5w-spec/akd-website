"use client";
import { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is admin or owner
  const checkAccess = async (uid: string): Promise<boolean> => {
    // Check if owner
    const settings = await getDoc(doc(db, "settings", "main"));
    if (settings.exists() && settings.data().ownerUid === uid) return true;
    // Check if in admins collection
    const adminDoc = await getDoc(doc(db, "admins", uid));
    return adminDoc.exists();
  };

  const login = async () => {
    if (!email || !password) return setError("أدخل البريد وكلمة المرور");
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const allowed = await checkAccess(cred.user.uid);
      if (!allowed) {
        await signOut(auth);
        setError("ليس لديك صلاحية الدخول. تواصل مع المسؤول.");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch (e: any) {
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (e.code === "auth/user-not-found") {
        setError("هذا الحساب غير موجود");
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const allowed = await checkAccess(cred.user.uid);
      if (!allowed) {
        await signOut(auth);
        setError("ليس لديك صلاحية الدخول. تواصل مع المسؤول.");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const is = "w-full p-4 rounded-xl bg-zinc-900 text-white border border-zinc-700 outline-none focus:border-blue-500";

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">

        <h1 className="text-white text-3xl font-bold text-center mb-2">تسجيل الدخول</h1>
        <p className="text-zinc-500 text-sm text-center mb-8">للمسؤولين فقط</p>

        {error && (
          <div className="bg-red-950 border border-red-700 text-red-300 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={is + " mb-3"}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={is + " mb-2"}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />

        {/* Forgot password link */}
        <div className="text-left mb-6">
          <a href="/forgot-password" className="text-blue-400 text-sm hover:underline">
            نسيت كلمة المرور؟
          </a>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-xl mb-4 font-bold"
        >
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-zinc-700"></div>
          <span className="px-4 text-zinc-500 text-sm">أو</span>
          <div className="flex-1 border-t border-zinc-700"></div>
        </div>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-60 text-black p-4 rounded-xl flex items-center justify-center gap-3 font-medium"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>

      </div>
    </div>
  );
}
