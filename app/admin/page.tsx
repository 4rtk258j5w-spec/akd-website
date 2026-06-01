"use client";

import { useState } from "react";

export default function PostsPage() {

  const [image, setImage] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#070707] border-r border-zinc-900 p-5 flex flex-col justify-between">

        <div>

          <h1 className="text-4xl font-black mb-12 leading-tight">
            <span className="text-purple-500">AKD</span>
            <br />
            Dashboard
          </h1>

          <div className="space-y-3">

            {[
              "الرئيسية",
              "المنشورات",
              "الفيديوهات",
              "الإعلانات",
              "الإعدادات",
            ].map((item) => (
              <button
                key={item}
                className="w-full h-[56px] rounded-2xl bg-zinc-900 hover:bg-purple-600 duration-300 text-right px-5"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full h-[55px] bg-red-600 rounded-2xl font-bold hover:bg-red-700 duration-300">
          تسجيل خروج
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-10">

          <div>
            <h2 className="text-5xl font-black mb-2">
              إنشاء منشور جديد
            </h2>

            <p className="text-zinc-500">
              ارفع صورة واكتب محتوى المنشور
            </p>
          </div>

          <button className="bg-purple-600 hover:bg-purple-700 duration-300 px-7 h-[52px] rounded-2xl font-bold">
            حفظ المنشور
          </button>
        </div>

        {/* BOX */}
        <div className="bg-[#0d0d0d] border border-zinc-900 rounded-[32px] p-8">

          {/* IMAGE */}
          <label className="border-2 border-dashed border-zinc-800 hover:border-purple-500 duration-300 rounded-3xl h-[260px] flex flex-col items-center justify-center cursor-pointer bg-[#090909] mb-8">

            <div className="text-5xl mb-4">🖼️</div>

            <h3 className="text-2xl font-bold mb-2">
              {image ? image.name : "اختر صورة المنشور"}
            </h3>

            <p className="text-zinc-500">
              PNG - JPG - WEBP
            </p>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImage(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* INPUTS */}
          <div className="space-y-6">

            <div>
              <label className="block mb-3 text-lg">
                عنوان المنشور
              </label>

              <input
                type="text"
                placeholder="اكتب عنوان المنشور"
                className="w-full h-[60px] bg-zinc-900 rounded-2xl px-6 outline-none border border-zinc-800 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-3 text-lg">
                محتوى المنشور
              </label>

              <textarea
                placeholder="اكتب محتوى المنشور هنا..."
                className="w-full h-[220px] bg-zinc-900 rounded-2xl p-6 outline-none border border-zinc-800 focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-8">

            <button className="bg-purple-600 hover:bg-purple-700 duration-300 h-[55px] px-10 rounded-2xl font-bold">
              نشر المنشور
            </button>

            <button className="bg-zinc-800 hover:bg-zinc-700 duration-300 h-[55px] px-10 rounded-2xl font-bold">
              معاينة
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}