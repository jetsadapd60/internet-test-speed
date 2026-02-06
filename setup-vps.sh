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

# 6. SSL Setup (Automated)
echo "🛡️  Attempting to secure $DOMAIN with SSL..."
PROTOCOL="http"

# Try to obtain/reinstall SSL certificate non-interactively
if certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$ROOT_DOMAIN --reinstall || \
   certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$ROOT_DOMAIN; then
    PROTOCOL="https"
    echo "✅ SSL configured successfully!"
else
    # Check if a certificate already exists from a previous run
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        PROTOCOL="https"
        echo "✨ Existing SSL detected, using HTTPS."
    else
        echo "⚠️  SSL setup skipped or failed. Using HTTP."
        PROTOCOL="http"
    fi
fi

# 7. Generate Production Env with correct Protocol
echo "⚙️  Finalizing Environment (Protocol: $PROTOCOL)..."
JWT_SECRET=$(openssl rand -base64 32)
echo "NEXT_PUBLIC_API_URL=${PROTOCOL}://${DOMAIN}" > .env
echo "NEXT_PUBLIC_ENGINE_URL=${PROTOCOL}://${DOMAIN}" >> .env
echo "API_PORT=${API_PORT}" >> .env
echo "WEB_PORT=${WEB_PORT}" >> .env
echo "JWT_SECRET=${JWT_SECRET}" >> .env

# Clear and update API env
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    sed -i "s/your_secret_key_here/${JWT_SECRET}/g" apps/api/.env
fi

# 8. Start/Restart Platform
echo "🐳 Deploying Containers..."
DOCKER_CMD="docker compose"
if ! command -v docker compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
fi

$DOCKER_CMD -f docker-compose.full.yml down --remove-orphans || true
$DOCKER_CMD -f docker-compose.full.yml up --build -d

echo "🕒 Waiting for API to start..."
sleep 5

echo "📊 Deployment Status:"
$DOCKER_CMD -f docker-compose.full.yml ps

echo "📝 Latest API Logs:"
$DOCKER_CMD -f docker-compose.full.yml logs --tail=20 api

echo "✅ ALL DONE!"
echo "Main App: ${PROTOCOL}://${DOMAIN}"


