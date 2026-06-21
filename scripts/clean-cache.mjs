import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);

try {
  execSync(
    `powershell -NoProfile -Command "3000,3001,3002 | ForEach-Object { Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"`,
    { stdio: "ignore" }
  );
} catch {
  /* ignore */
}

for (const dir of [".next", path.join("node_modules", ".cache")]) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
}

console.log("✓ Cache cleaned — safe to run npm run build");
