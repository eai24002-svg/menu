import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/menu-store";

export async function GET() {
  const data = await getMenuData();
  return NextResponse.json(data);
}
