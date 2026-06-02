"use client";
import { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendReset = async () => {
    if (!email.trim()) return setError("أدخل البريد الإلكتروني");
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setStep("sent");
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        setError("لا يوجد حساب بهذا البريد الإلكتروني");
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const is = "w-full p-4 rounded-xl bg-zinc-900 text-white border border-zinc-700 outline-none focus:border-blue-500";

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">

        {step === "email" && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔑</div>
              <h1 className="text-white text-2xl font-bold mb-2">نسيت كلمة المرور؟</h1>
              <p className="text-zinc-500 text-sm">
                أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
              </p>
            </div>

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
              className={is + " mb-6"}
              onKeyDown={(e) => e.key === "Enter" && sendReset()}
            />

            <button
              onClick={sendReset}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-xl font-bold mb-4"
            >
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </button>

            <div className="text-center">
              <a href="/login" className="text-zinc-500 text-sm hover:text-zinc-300">
                ← العودة لتسجيل الدخول
              </a>
            </div>
          </>
        )}

        {step === "sent" && (
          <div className="text-center py-4">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-white text-2xl font-bold mb-3">تم إرسال الرابط!</h2>
            <p className="text-zinc-400 text-sm mb-2">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى:
            </p>
            <p className="text-blue-400 font-bold mb-6">{email}</p>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 text-right">
              <p className="text-zinc-300 text-sm leading-loose">
                📌 <strong>الخطوات:</strong><br/>
                ١. افتح بريدك الإلكتروني<br/>
                ٢. ابحث عن رسالة من Firebase<br/>
                ٣. اضغط على الرابط في الرسالة<br/>
                ٤. أدخل كلمة مرور جديدة<br/>
                ٥. سجّل دخولك بكلمة المرور الجديدة
              </p>
            </div>

            <p className="text-zinc-600 text-xs mb-6">
              الرابط صالح لمدة ساعة واحدة فقط.<br/>
              لم تجد الرسالة؟ تحقق من مجلد الـ Spam.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setStep("email"); setError(""); }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl text-sm"
              >
                إرسال مرة أخرى
              </button>
              <a
                href="/login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-bold text-center block"
              >
                العودة لتسجيل الدخول
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
