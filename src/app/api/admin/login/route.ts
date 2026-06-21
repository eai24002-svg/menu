import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/menu-store";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (verifyAdminPassword(password)) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
