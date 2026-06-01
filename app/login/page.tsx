"use client";

import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch (error: any) {
      alert(error.message);
    }
  };

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 w-[450px]">
        <h1 className="text-white text-5xl font-bold text-center mb-10">
          تسجيل الدخول
        </h1>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-900 text-white border border-zinc-700"
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 rounded-xl bg-zinc-900 text-white border border-zinc-700"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl mb-3"
        >
          تسجيل الدخول
        </button>

        <button
          onClick={register}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl"
        >
          إنشاء حساب جديد
        </button>
      </div>
    </div>
  );
}