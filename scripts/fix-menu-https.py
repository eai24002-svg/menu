#!/usr/bin/env python3
"""Fix HTTPS routing for menu subdomain without touching ruwaida-art config."""
import sys
import paramiko

HOST = "31.97.123.91"
USER = "root"
PASSWORD = sys.argv[1]

SCRIPT = r"""
set -e
echo '=== BEFORE: HTTPS menu host ==='
curl -skI https://menu.asproductioniq.com/ | head -8 || true

# Ensure HTTP vhost exists for certbot
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

if ! command -v certbot >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
fi

certbot --nginx \
  -d menu.asproductioniq.com \
  --non-interactive \
  --agree-tos \
  -m admin@asproductioniq.com \
  --redirect \
  --no-eff-email || true

nginx -t
systemctl reload nginx

echo '=== AFTER SPIRITO CONFIG ==='
cat /etc/nginx/sites-available/spirito-vita-menu

echo '=== VERIFY HTTPS menu ==='
curl -skI https://menu.asproductioniq.com/ | head -12
curl -sk https://menu.asproductioniq.com/ | grep -o 'روح الحياة\|رويدة آرت' | head -3 || true

echo '=== VERIFY main site untouched ==='
curl -skI https://asproductioniq.com/ | head -8
curl -sk https://asproductioniq.com/ | grep -o 'رويدة آرت\|روح الحياة' | head -3 || true

echo FIX_DONE
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=25, look_for_keys=False, allow_agent=False)
stdin, stdout, stderr = client.exec_command(SCRIPT, timeout=300)
for line in stdout:
    sys.stdout.buffer.write(line.encode("utf-8", errors="replace"))
err = stderr.read().decode("utf-8", errors="replace")
if err:
    print(err, file=sys.stderr)
code = stdout.channel.recv_exit_status()
client.close()
sys.exit(code)
