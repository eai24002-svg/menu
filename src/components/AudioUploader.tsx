"use client";

import { useRef, useState } from "react";
import { Upload, Music, Loader2, RotateCcw } from "lucide-react";
import { DEFAULT_BACKGROUND_MUSIC } from "@/lib/audio";

interface AudioUploaderProps {
  currentUrl?: string;
  adminPassword: string;
  onMusicChange: (url: string | undefined) => void;
}

export default function AudioUploader({
  currentUrl,
  adminPassword,
  onMusicChange,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = currentUrl || DEFAULT_BACKGROUND_MUSIC;
  const isCustom = !!currentUrl;

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/audio", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "فشل الرفع");
        return;
      }
      onMusicChange(json.url);
    } catch {
      setError("فشل الاتصال بالسيرفر");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="pt-2 border-t border-teal-forest/10">
      <h3 className="font-heading font-bold text-teal-forest text-base mb-3 flex items-center gap-2">
        <Music size={18} />
        موسيقى الخلفية
      </h3>

      <div className="rounded-2xl bg-cream border border-teal-forest/10 p-4 mb-3">
        <p className="text-xs font-arabic text-teal-forest/50 mb-2">
          {isCustom ? "الموسيقى الحالية (مخصصة)" : "الموسيقى الافتراضية"}
        </p>
        <audio
          key={previewUrl}
          src={previewUrl}
          controls
          className="w-full h-10"
          preload="metadata"
        />
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,.mp3,audio/ogg,audio/wav"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl bg-amber-gold/20 text-teal-deep font-arabic text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-gold/30 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload size={16} />
              رفع MP3 من الجهاز
            </>
          )}
        </button>
        {isCustom && (
          <button
            type="button"
            onClick={() => onMusicChange(undefined)}
            className="px-3 py-2.5 rounded-xl bg-teal-forest/5 text-teal-forest/70 hover:bg-teal-forest/10 transition-colors"
            title="العودة للموسيقى الافتراضية"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <p className="text-[10px] text-teal-forest/40 font-arabic mt-2">
        MP3, OGG, WAV — حد أقصى 10 ميجا. اضغط «حفظ الإعدادات» بعد الرفع.
      </p>

      {error && <p className="text-xs text-red-500 font-arabic mt-1">{error}</p>}
    </div>
  );
}
