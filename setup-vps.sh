#!/bin/bash

# Internet Quality Intelligence App - VPS Setup Script
# Version: 1.1.0 - HTTP Only (No SSL)

set -e

echo "🚀 Starting Platform Setup (HTTP Only)..."

# 1. Check for sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# 2. Get Domain Info
export DOMAIN=${1:-speed.balldoernsai.cloud}
export API_PORT=3010
export WEB_PORT=3011

echo "🌐 Using Domain: $DOMAIN"
echo "🔌 API Port: $API_PORT"
echo "🌐 Web Port: $WEB_PORT"

# 3. Install Dependencies (No Certbot)
echo "📦 Installing Dependencies (Docker, Nginx)..."
apt update
apt install -y -f
apt install -y -o Dpkg::Options::="--force-overwrite" docker.io docker-compose nginx git gettext-base || {
    echo "⚠️  Standard install failed, attempting cleanup..."
    apt remove -y docker-compose-plugin
    apt install -y docker.io docker-compose nginx git gettext-base
}

# 4. Prepare Environment
echo "⚙️  Configuring Environment..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    sed -i "s/your_secret_key_here/$(openssl rand -base64 32)/g" apps/api/.env
fi

# Force HTTP only
echo "NEXT_PUBLIC_API_URL=http://${DOMAIN}" > .env
echo "NEXT_PUBLIC_ENGINE_URL=http://${DOMAIN}" >> .env
echo "API_PORT=${API_PORT}" >> .env
echo "WEB_PORT=${WEB_PORT}" >> .env

# 5. Clean up any existing SSL configs
echo "🧹 Removing any existing SSL configurations..."
rm -f /etc/nginx/sites-enabled/speedtest-le-ssl.conf
rm -f /etc/nginx/sites-available/speedtest-le-ssl.conf
# Stop certbot renewal if it exists
systemctl stop certbot.timer 2>/dev/null || true
systemctl disable certbot.timer 2>/dev/null || true

# 6. Configure Nginx (HTTP Only)
echo "🌐 Configuring Nginx (HTTP Only)..."
envsubst '${DOMAIN} ${API_PORT} ${WEB_PORT}' < nginx.conf.template > /etc/nginx/sites-available/speedtest
ln -sf /etc/nginx/sites-available/speedtest /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# 7. Run Platform
echo "🐳 Starting Containers..."
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE -f docker-compose.full.yml down --remove-orphans || true
$DOCKER_COMPOSE -f docker-compose.full.yml up --build -d

echo "✅ Setup Complete!"
echo "Your platform is running at: http://${DOMAIN}"
echo "⚠️  Note: This setup uses HTTP only (no SSL/HTTPS)"

