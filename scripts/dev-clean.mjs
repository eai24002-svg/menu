import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
process.chdir(root);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function killDevServers() {
  try {
    execSync(
      `powershell -NoProfile -Command "3000,3001,3002 | ForEach-Object { Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"`,
      { stdio: "ignore" }
    );
  } catch {
    /* ignore */
  }

  // Stop stray Next.js dev processes (Windows + OneDrive cache conflicts)
  try {
    execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'node.exe\'\\" | Where-Object { $_.CommandLine -match \'next (dev|start)\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"',
      { stdio: "ignore" }
    );
  } catch {
    /* ignore */
  }
}

function cleanCache() {
  const targets = [".next", path.join("node_modules", ".cache")];
  for (const dir of targets) {
    const full = path.join(root, dir);
    if (fs.existsSync(full)) {
      fs.rmSync(full, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    }
  }
}

const startOnly = process.argv.includes("--start-only");

if (!startOnly) {
  console.log("⏹  إيقاف السيرفرات القديمة...");
  killDevServers();
  await sleep(2000);

  console.log("🧹 تنظيف الكاش...");
  cleanCache();
}

console.log("🚀 تشغيل السيرفر...");
const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code) => process.exit(code ?? 0));
