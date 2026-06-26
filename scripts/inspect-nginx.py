#!/usr/bin/env python3
import sys
import paramiko

HOST = "31.97.123.91"
USER = "root"
PASSWORD = sys.argv[1]

SCRIPT = r"""
set -e
echo '=== NGINX ENABLED ==='
ls -la /etc/nginx/sites-enabled/
echo '=== RUWIDA ==='
cat /etc/nginx/sites-available/ruwaida-art
echo '=== SPIRITO ==='
cat /etc/nginx/sites-available/spirito-vita-menu
echo '=== PROTEAM ==='
cat /etc/nginx/sites-available/proteam 2>/dev/null || echo '(none)'
echo '=== CURL menu ==='
curl -sI -H 'Host: menu.asproductioniq.com' http://127.0.0.1/ | head -15
echo '=== CURL main ==='
curl -sI -H 'Host: asproductioniq.com' http://127.0.0.1/ | head -15
echo '=== CURL vps host ==='
curl -sI -H 'Host: srv916021.hstgr.cloud' http://127.0.0.1/ | head -15
echo '=== menu body snippet ==='
curl -s -H 'Host: menu.asproductioniq.com' http://127.0.0.1/ | head -3
echo '=== main body snippet ==='
curl -s -H 'Host: asproductioniq.com' http://127.0.0.1/ | head -3
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=25, look_for_keys=False, allow_agent=False)
stdin, stdout, stderr = client.exec_command(SCRIPT, timeout=60)
for line in stdout:
    sys.stdout.buffer.write(line.encode("utf-8", errors="replace"))
err = stderr.read().decode("utf-8", errors="replace")
if err:
    print(err)
client.close()
