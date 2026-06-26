#!/usr/bin/env python3
"""Upload local project to KVM2 and deploy menu only (port 3001). Does NOT touch Rowaida Art."""
import os
import sys
import time
import tarfile
import tempfile
import paramiko

HOST = "31.97.123.91"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else ""
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REMOTE_DIR = "/var/www/spirito-vita-menu"

SKIP_DIRS = {
    "node_modules",
    ".next",
    ".git",
    ".cursor",
    "__pycache__",
}
SKIP_NAMES = {".env.local", ".DS_Store"}


def should_skip(path: str) -> bool:
    parts = path.replace("\\", "/").split("/")
    if any(p in SKIP_DIRS for p in parts):
        return True
    if os.path.basename(path) in SKIP_NAMES:
        return True
    return False


def make_tarball() -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp.close()
    with tarfile.open(tmp.name, "w:gz") as tar:
        for dirpath, dirnames, filenames in os.walk(ROOT):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".git")]
            for name in filenames:
                full = os.path.join(dirpath, name)
                rel = os.path.relpath(full, ROOT)
                if should_skip(rel):
                    continue
                tar.add(full, arcname=rel.replace("\\", "/"))
    return tmp.name


REMOTE_SCRIPT = r"""set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "=== ROWAIDA CHECK (must stay up) ==="
curl -s -o /dev/null -w 'rowaida_local:%{http_code}\n' http://127.0.0.1:3000/ || true
pm2 list || true

echo "=== BACKUP MENU DATA ==="
BACKUP_DIR="/var/backups/spirito-vita-menu-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -d /var/www/spirito-vita-menu/data ]; then cp -a /var/www/spirito-vita-menu/data "$BACKUP_DIR/" || true; fi
if [ -d /var/www/spirito-vita-menu/public/uploads ]; then cp -a /var/www/spirito-vita-menu/public/uploads "$BACKUP_DIR/" || true; fi
if [ -f /var/www/spirito-vita-menu/.env.local ]; then cp /var/www/spirito-vita-menu/.env.local "$BACKUP_DIR/" || true; fi
echo "Backup: $BACKUP_DIR"

echo "=== EXTRACT NEW CODE ==="
mkdir -p /var/www/spirito-vita-menu
cd /var/www/spirito-vita-menu
tar -xzf /tmp/menu-deploy.tar.gz

echo "=== RESTORE PRESERVED FILES ==="
if [ -f "$BACKUP_DIR/.env.local" ]; then cp "$BACKUP_DIR/.env.local" .env.local; fi
if [ -d "$BACKUP_DIR/data" ]; then cp -a "$BACKUP_DIR/data" ./ || true; fi
if [ -d "$BACKUP_DIR/uploads" ]; then mkdir -p public/uploads && cp -a "$BACKUP_DIR/uploads"/* public/uploads/ 2>/dev/null || true; fi

if [ ! -f .env.local ]; then cp .env.example .env.local; fi
grep -q '^PORT=' .env.local && sed -i 's/^PORT=.*/PORT=3001/' .env.local || echo 'PORT=3001' >> .env.local
grep -q '^ADMIN_PASSWORD=' .env.local || echo 'ADMIN_PASSWORD=SpiritoMenu2026!Secure' >> .env.local

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
if ! command -v pm2 >/dev/null 2>&1; then npm install -g pm2; fi

echo "=== BUILD MENU (3001) ==="
npm ci
npm run build

mkdir -p public/uploads/items public/uploads/audio data
chmod -R 755 data public/uploads
chown -R www-data:www-data data public/uploads 2>/dev/null || true

pm2 delete spirito-vita-menu 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "=== NGINX MENU ONLY ==="
cat > /etc/nginx/sites-available/spirito-vita-menu <<'NGINX'
server {
    listen 80;
    server_name menu.asproductioniq.com srv916021.hstgr.cloud;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/spirito-vita-menu /etc/nginx/sites-enabled/spirito-vita-menu

nginx -t
systemctl reload nginx

if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d menu.asproductioniq.com --non-interactive --agree-tos -m admin@asproductioniq.com --redirect --no-eff-email 2>/dev/null || true
  nginx -t && systemctl reload nginx
fi

echo "=== VERIFY ==="
curl -s -o /dev/null -w 'menu_local:%{http_code}\n' http://127.0.0.1:3001/ || true
curl -s -o /dev/null -w 'rowaida_local:%{http_code}\n' http://127.0.0.1:3000/ || true
curl -sk https://menu.asproductioniq.com/ | grep -o 'روح الحياة' | head -1 || true
curl -sk https://www.asproductioniq.com/ | grep -o 'رويدة آرت' | head -1 || true
rm -f /tmp/menu-deploy.tar.gz
echo DEPLOY_UPLOAD_DONE
"""


def run():
    if not PASSWORD:
        print("Usage: python deploy-upload.py <root_password>")
        sys.exit(1)

    tar_path = make_tarball()
    print(f"Created tarball: {tar_path}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    for attempt in range(8):
        try:
            client.connect(HOST, username=USER, password=PASSWORD, timeout=25, look_for_keys=False, allow_agent=False)
            break
        except Exception as e:
            print(f"connect attempt {attempt + 1} failed: {e}")
            time.sleep(5)
    else:
        os.unlink(tar_path)
        print("Could not SSH after retries")
        sys.exit(2)

    print("Connected to", HOST)
    sftp = client.open_sftp()
    sftp.put(tar_path, "/tmp/menu-deploy.tar.gz")
    sftp.close()
    os.unlink(tar_path)

    stdin, stdout, stderr = client.exec_command(REMOTE_SCRIPT, get_pty=True, timeout=1200)

    def safe_print(text: str) -> None:
        sys.stdout.buffer.write(text.encode("utf-8", errors="replace"))
        sys.stdout.buffer.flush()

    for line in stdout:
        safe_print(line)
    err = stderr.read().decode("utf-8", errors="replace")
    if err.strip():
        print("STDERR:", err)
    code = stdout.channel.recv_exit_status()
    client.close()
    print("exit code:", code)
    sys.exit(code)


if __name__ == "__main__":
    run()
