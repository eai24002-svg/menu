"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { getItemImage } from "@/lib/food-images";

interface ImageUploaderProps {
  itemId: string;
  categoryId: string;
  currentImage?: string;
  adminPassword: string;
  onImageChange: (url: string | undefined) => void;
}

export default function ImageUploader({
  itemId,
  categoryId,
  currentImage,
  adminPassword,
  onImageChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const previewSrc = currentImage || getItemImage(itemId, categoryId);

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "فشل الرفع");
        return;
      }
      onImageChange(json.url);
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
    <div>
      <label className="text-sm font-arabic text-teal-forest/60 mb-2 block">
        صورة الطبق
      </label>

      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-cream border border-teal-forest/10 mb-3">
        <Image
          src={previewSrc}
          alt="معاينة"
          fill
          className="object-cover"
          sizes="400px"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={28} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl bg-olive-fresh/10 text-olive-dark font-arabic text-sm font-semibold flex items-center justify-center gap-2 hover:bg-olive-fresh/20 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload size={16} />
              رفع من الجهاز
            </>
          )}
        </button>
        {currentImage && (
          <button
            type="button"
            onClick={() => onImageChange(undefined)}
            className="px-3 py-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
            title="حذف الصورة المخصصة"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p className="text-[10px] text-teal-forest/40 font-arabic mt-2 flex items-center gap-1">
        <ImageIcon size={10} />
        JPG, PNG, WEBP — حد أقصى 25 ميجا
      </p>

      {error && (
        <p className="text-xs text-red-500 font-arabic mt-1">{error}</p>
      )}
    </div>
  );
}
