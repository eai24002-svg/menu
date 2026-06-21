import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyAdminPassword } from "@/lib/menu-store";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "audio");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
]);

const EXT_MAP: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
};

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type) && !file.name.toLowerCase().endsWith(".mp3")) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. استخدم MP3 أو OGG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً (الحد الأقصى 10 ميجا)" },
        { status: 400 }
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const ext =
      EXT_MAP[file.type] ||
      (file.name.toLowerCase().endsWith(".mp3") ? "mp3" : "mp3");
    const filename = `background-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    const url = `/uploads/audio/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json({ error: "فشل رفع الملف الصوتي" }, { status: 500 });
  }
}
