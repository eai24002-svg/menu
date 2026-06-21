import fs from "fs/promises";
import path from "path";
import type { MenuData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SEED_FILE = path.join(DATA_DIR, "menu.json");

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getMenuData(): Promise<MenuData> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(MENU_FILE, "utf-8");
    return JSON.parse(content) as MenuData;
  } catch {
    const seed = await fs.readFile(SEED_FILE, "utf-8");
    await fs.writeFile(MENU_FILE, seed, "utf-8");
    return JSON.parse(seed) as MenuData;
  }
}

export async function saveMenuData(data: MenuData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(MENU_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "spirito2024";
  return password === adminPassword;
}
