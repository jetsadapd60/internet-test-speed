#!/bin/bash

# Internet Quality Intelligence App - VPS Setup Script
# Version: 1.2.0 - Robust SSL/HTTP Setup

set -e

echo "🚀 Starting Platform Setup..."

# 1. Check for sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# 2. Configuration
export DOMAIN=${1:-speed.balldoernsai.cloud}
export ROOT_DOMAIN="balldoernsai.cloud"
export API_PORT=3010
export WEB_PORT=3011

echo "🌐 Domain: $DOMAIN"
echo "🔌 Ports: API=$API_PORT, Web=$WEB_PORT"

# 3. Prerequisites
echo "📦 Installing Dependencies..."
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git gettext-base

# 4. Clean up old configs to avoid conflicts
echo "🧹 Cleaning up old Nginx configs..."
rm -f /etc/nginx/sites-enabled/speedtest
rm -f /etc/nginx/sites-enabled/speedtest-le-ssl.conf
rm -f /etc/nginx/sites-available/speedtest
rm -f /etc/nginx/sites-available/speedtest-le-ssl.conf

# 5. Initial Nginx Config (HTTP)
echo "🌐 Setting up base Nginx config..."
envsubst '${DOMAIN} ${API_PORT} ${WEB_PORT}' < nginx.conf.template > /etc/nginx/sites-available/speedtest
ln -sf /etc/nginx/sites-available/speedtest /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# 6. SSL Setup (Optional)
read -p "Do you want to enable/refresh SSL (HTTPS)? (y/n): " SETUP_SSL
PROTOCOL="http"

if [ "$SETUP_SSL" == "y" ]; then
    echo "🛡️  Obtaining SSL Certificate for $DOMAIN..."
    # Request cert for both domain and sub-domain if possible, or just the target domain
    if certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$ROOT_DOMAIN; then
        PROTOCOL="https"
        echo "✅ SSL configured successfully!"
    else
        echo "❌ SSL setup failed. Falling back to HTTP."
        PROTOCOL="http"
    fi
else
    # Check if cert already exists from previous runs
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        PROTOCOL="https"
        echo "✨ Existing SSL detected, using HTTPS."
    fi
fi

# 7. Generate Production Env with correct Protocol
echo "⚙️  Finalizing Environment (Protocol: $PROTOCOL)..."
echo "NEXT_PUBLIC_API_URL=${PROTOCOL}://${DOMAIN}" > .env
echo "NEXT_PUBLIC_ENGINE_URL=${PROTOCOL}://${DOMAIN}" >> .env
echo "API_PORT=${API_PORT}" >> .env
echo "WEB_PORT=${WEB_PORT}" >> .env

# Clear and update API env
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    sed -i "s/your_secret_key_here/$(openssl rand -base64 32)/g" apps/api/.env
fi

# 8. Start/Restart Platform
echo "🐳 Deploying Containers..."
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE -f docker-compose.full.yml down --remove-orphans || true
$DOCKER_COMPOSE -f docker-compose.full.yml up --build -d

echo "✅ ALL DONE!"
echo "Main App: ${PROTOCOL}://${DOMAIN}"


