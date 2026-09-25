#!/bin/bash
# =========================================================
# Skrip Auto-Deployment Aplikasi BK SMPN 41 Jakarta di VPS
# =========================================================

set -e

echo "========================================================="
echo "🚀 Memulai Deployment Otomatis BK SMPN 41 Jakarta..."
echo "========================================================="

# 1. Update OS Packages
echo "🔄 Updating sistem Linux..."
sudo apt update -y

# 2. Install Node.js 20 LTS, Git, Nginx, MySQL/MariaDB
echo "📦 Memasang Node.js 20, Git, Nginx, dan Database..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx mariadb-server curl

# 3. Install PM2 Process Manager
echo "⚡ Memasang PM2 Process Manager..."
sudo npm install -g pm2

# 4. Setup Database MySQL
echo "🗄️ Mengonfigurasi Database MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS bk41jktdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'bkuser'@'localhost' IDENTIFIED BY 'BKsmpn41Jkt2026!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON bk41jktdb.* TO 'bkuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 5. Prepare Web Directory & Clone Repository
TARGET_DIR="/var/www/bksmpn41jkt"
echo "📥 Menyiapkan direktori di $TARGET_DIR..."

sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

if [ -d "$TARGET_DIR/.git" ]; then
  echo "🔄 Mengambil update terbaru dari GitHub..."
  cd "$TARGET_DIR"
  git pull origin main
else
  echo "📥 Mengklon repositori dari GitHub..."
  rm -rf "$TARGET_DIR"
  git clone https://github.com/ppgbk41/bksmpn41jkt.git "$TARGET_DIR"
  cd "$TARGET_DIR"
fi

# 6. Buat file .env otomatis
echo "⚙️ Membuat file konfigurasi .env..."
cat <<EOF > .env
DATABASE_URL="mysql://bkuser:BKsmpn41Jkt2026!@127.0.0.1:3306/bk41jktdb?connection_limit=20&pool_timeout=20"
JWT_SECRET="bk-smp41-jkt-secret-key-2026-super-secure"
BK_TEACHER_EMAIL="bksmpn41jkt@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="bksmpn41jkt@gmail.com"
EOF

# 7. Install dependencies, sync database schema & build Next.js
echo "🔨 Mengunduh modul & membuat sistem (Build)..."
npm install
npx prisma db push
npx prisma generate
npm run build

# 8. Start application using PM2
echo "🚀 Menjalankan aplikasi dengan PM2..."
pm2 delete bk-smp41 2>/dev/null || true
pm2 start npm --name "bk-smp41" -- start
pm2 save

# 9. Configure Nginx Reverse Proxy
echo "🌐 Mengonfigurasi Nginx Server..."
sudo tee /etc/nginx/sites-available/bksmp41 > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/bksmp41 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "========================================================="
echo "🎉 DEPLOYMENT SELESAI & BERHASIL!"
echo "Situs web BK SMPN 41 Jakarta sudah aktif di VPS Anda."
echo "Silakan buka IP VPS Anda di browser!"
echo "========================================================="
