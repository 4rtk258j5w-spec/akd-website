"use client";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  videoUrl: string;
}

export default function VideoCard({
  title,
  thumbnail,
  videoUrl,
}: VideoCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">
        <h3 className="text-white text-xl font-bold mb-4">
          {title}
        </h3>

        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          مشاهدة الفيديو
        </a>
      </div>
    </div>
  );
}