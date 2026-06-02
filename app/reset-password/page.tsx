"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "../firebase";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

type Step = "loading" | "form" | "done" | "error";

function ResetContent() {
  const params = useSearchParams();
  const oobCode = params.get("oobCode") || "";

  const [step, setStep] = useState<Step>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStep("error");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((e) => { setEmail(e); setStep("form"); })
      .catch(() => setStep("error"));
  }, [oobCode]);

  const reset = async () => {
    if (password.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين");
    setLoading(true);
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStep("done");
    } catch (e: any) {
      if (e.code === "auth/expired-action-code") {
        setError("انتهت صلاحية الرابط. اطلب رابطاً جديداً.");
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const is = "w-full p-4 rounded-xl bg-zinc-900 text-white border border-zinc-700 outline-none focus:border-blue-500 mb-3";

  if (step === "loading") return (
    <div className="text-center py-16">
      <div className="w-10 h-10 border-4 border-zinc-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-zinc-500">جاري التحقق من الرابط...</p>
    </div>
  );

  if (step === "error") return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-white text-xl font-bold mb-2">الرابط غير صالح أو منتهي</h2>
      <p className="text-zinc-500 text-sm mb-6">قد يكون الرابط قديماً أو استُخدم مسبقاً</p>
      <a href="/forgot-password"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold inline-block">
        طلب رابط جديد
      </a>
    </div>
  );

  if (step === "done") return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-white text-xl font-bold mb-2">تم تغيير كلمة المرور!</h2>
      <p className="text-zinc-400 text-sm mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
      <a href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold inline-block">
        تسجيل الدخول
      </a>
    </div>
  );

  return (
    <>
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-white text-2xl font-bold mb-2">تعيين كلمة مرور جديدة</h1>
        <p className="text-zinc-500 text-sm">{email}</p>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 p-3 rounded-xl mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <label className="block text-zinc-400 text-sm mb-2">كلمة المرور الجديدة</label>
      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={is}
      />

      <label className="block text-zinc-400 text-sm mb-2">تأكيد كلمة المرور</label>
      <input
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className={is + " mb-6"}
        onKeyDown={(e) => e.key === "Enter" && reset()}
      />

      {/* Password strength indicator */}
      <div className="mb-6">
        <div className="flex gap-1 mb-1">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
              password.length === 0 ? "bg-zinc-700" :
              password.length < 6 && i <= 1 ? "bg-red-500" :
              password.length < 8 && i <= 2 ? "bg-yellow-500" :
              password.length < 10 && i <= 3 ? "bg-blue-500" :
              i <= 4 ? "bg-green-500" : "bg-zinc-700"
            }`} />
          ))}
        </div>
        <p className="text-zinc-600 text-xs">
          {password.length === 0 ? "" :
           password.length < 6 ? "ضعيفة جداً" :
           password.length < 8 ? "مقبولة" :
           password.length < 10 ? "جيدة" : "قوية ✓"}
        </p>
      </div>

      <button
        onClick={reset}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-xl font-bold"
      >
        {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
      </button>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">
        <Suspense fallback={<div className="text-center text-zinc-500 py-8">تحميل...</div>}>
          <ResetContent />
        </Suspense>
      </div>
    </div>
  );
}
