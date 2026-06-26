#!/usr/bin/env python3
import sys
import paramiko

HOST = "31.97.123.91"
USER = "root"
PASSWORD = sys.argv[1]

cmd = r"""set -e
if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d menu.asproductioniq.com --non-interactive --agree-tos -m admin@asproductioniq.com --redirect || true
else
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d menu.asproductioniq.com --non-interactive --agree-tos -m admin@asproductioniq.com --redirect || true
fi
nginx -t && systemctl reload nginx
curl -s -o /dev/null -w 'https_menu:%{http_code}\n' https://menu.asproductioniq.com/ || true
echo SSL_DONE
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=25, look_for_keys=False, allow_agent=False)
stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=300)
for line in stdout:
    sys.stdout.buffer.write(line.encode('utf-8', errors='replace'))
    sys.stdout.buffer.flush()
print('exit', stdout.channel.recv_exit_status())
client.close()
