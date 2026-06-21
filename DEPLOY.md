# نشر منيو روح الحياة على KVM2 (موقع ثانوي)

هذا المشروع يعمل **منفصل تماماً** عن موقعك الحالي — منفذ مختلف + مجلد مختلف + دومين فرعي.

## المتطلبات على السيرفر

- Node.js 20+
- PM2 (`npm i -g pm2`)
- Nginx (موجود مسبقاً)

## 1) رفع الملفات

```bash
# على السيرفر — مجلد جديد (لا يلمس موقعك الحالي)
mkdir -p /var/www/spirito-vita-menu
cd /var/www/spirito-vita-menu
```

ارفع المشروع كاملاً (Git أو SCP) إلى `/var/www/spirito-vita-menu`

## 2) الإعداد

```bash
cd /var/www/spirito-vita-menu
cp .env.example .env.local
nano .env.local   # غيّر ADMIN_PASSWORD و PORT إن لزم
npm ci
npm run build
```

## 3) صلاحيات الكتابة (مهم للأدمن)

```bash
chmod -R 755 data public/uploads
chown -R www-data:www-data data public/uploads
```

## 4) تشغيل بـ PM2 (منفذ 3001)

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

تأكد أن موقعك الحالي يبقى على منفذه (مثلاً 3000) — هذا المشروع على **3001**.

## 5) Nginx — دومين فرعي جديد

أضف ملفاً **جديداً** (لا تعدّل ملف موقعك الحالي):

`/etc/nginx/sites-available/menu.spiritovita.iq`

```nginx
server {
    listen 80;
    server_name menu.yourdomain.com;

    client_max_body_size 12M;

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
```

```bash
ln -s /etc/nginx/sites-available/menu.spiritovita.iq /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

SSL (اختياري):

```bash
certbot --nginx -d menu.yourdomain.com
```

## 6) التحقق

| الصفحة | الرابط |
|--------|--------|
| المنيو | `https://menu.yourdomain.com` |
| الأدمن | `https://menu.yourdomain.com/admin` |

## 7) تحديث لاحق

```bash
cd /var/www/spirito-vita-menu
git pull   # أو ارفع الملفات الجديدة
npm ci
npm run build
pm2 restart spirito-vita-menu
```

## ملاحظات أمان

- غيّر `ADMIN_PASSWORD` قبل النشر
- لا ترفع `.env.local` إلى Git
- النسخ الاحتياطي: `data/menu.json` و `public/uploads/`
