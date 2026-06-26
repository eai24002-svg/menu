#!/usr/bin/env python3
"""One-shot remote deploy script for Spirito Vita menu on KVM2."""
import sys
import time
import paramiko

HOST = "31.97.123.91"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else ""

DEPLOY_SCRIPT = r"""set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "=== INSPECT EXISTING SITE (read-only) ==="
pm2 list || true
ss -tlnp | grep -E ':3000|:3001|:80|:443' || true
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true

echo "=== PREPARE APP DIRECTORY ==="
mkdir -p /var/www/spirito-vita-menu
cd /var/www/spirito-vita-menu

if [ ! -d .git ]; then
  git clone https://github.com/eai24002-svg/menu.git .
else
  git fetch origin
  git reset --hard origin/main
fi

echo "=== ENV ==="
if [ ! -f .env.local ]; then
  cp .env.example .env.local
fi
# Ensure production port without touching other apps
grep -q '^PORT=' .env.local && sed -i 's/^PORT=.*/PORT=3001/' .env.local || echo 'PORT=3001' >> .env.local
grep -q '^ADMIN_PASSWORD=' .env.local || echo 'ADMIN_PASSWORD=SpiritoMenu2026!Secure' >> .env.local
if grep -q '^ADMIN_PASSWORD=spirito2024' .env.local || grep -q '^ADMIN_PASSWORD=changeme' .env.local; then
  sed -i 's/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=SpiritoMenu2026!Secure/' .env.local
fi

echo "=== NODE CHECK ==="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "=== BUILD ==="
npm ci
npm run build

echo "=== PERMISSIONS ==="
mkdir -p public/uploads/items public/uploads/audio data
chmod -R 755 data public/uploads
chown -R www-data:www-data data public/uploads 2>/dev/null || true

echo "=== PM2 (port 3001 only) ==="
pm2 delete spirito-vita-menu 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "=== NGINX SITE (new file only) ==="
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

# Restore HTTPS after deploy (HTTP-only config would break https://menu.*)
if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d menu.asproductioniq.com --non-interactive --agree-tos -m admin@asproductioniq.com --redirect --no-eff-email 2>/dev/null || true
  nginx -t && systemctl reload nginx
fi

echo "=== VERIFY ==="
pm2 list
curl -s -o /dev/null -w 'menu_local:%{http_code}\n' http://127.0.0.1:3001/ || true
echo DEPLOY_DONE
"""


def run():
    if not PASSWORD:
        print("Usage: deploy-remote.py <root_password>")
        sys.exit(1)

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
        print("Could not SSH after retries")
        sys.exit(2)

    print("Connected to", HOST)
    stdin, stdout, stderr = client.exec_command(DEPLOY_SCRIPT, get_pty=True, timeout=900)

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
