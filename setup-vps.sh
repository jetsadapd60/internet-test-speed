#!/bin/bash

# Internet Quality Intelligence App - VPS Setup Script
# Version: 1.0.0

set -e

echo "🚀 Starting Platform Setup..."

# 1. Check for sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# 2. Get Domain Info
read -p "Enter your Domain (e.g. speed.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo "Domain is required!"
  exit 1
fi

# 3. Install Dependencies
echo "📦 Installing Dependencies (Docker, Nginx, Certbot)..."
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git

# 4. Prepare Environment
echo "⚙️  Configuring Environment..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    # Generate a random secret for JWT if not set
    sed -i "s/your_secret_key_here/$(openssl rand -base64 32)/g" apps/api/.env
fi

# Create .env for docker-compose variable substitution
echo "NEXT_PUBLIC_API_URL=http://${DOMAIN}" > .env

# 5. Configure Nginx
echo "🌐 Configuring Nginx..."
envsubst '${DOMAIN}' < nginx.conf.template > /etc/nginx/sites-available/speedtest
ln -sf /etc/nginx/sites-available/speedtest /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# 6. Run Platform
echo "🐳 Starting Containers..."
docker-compose -f docker-compose.full.yml up --build -d

# 7. SSL Setup (Optional but Recommended)
read -p "Do you want to setup SSL (HTTPS) now? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" == "y" ]; then
    echo "🛡️  Obtaining SSL Certificate..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || echo "SSL Setup failed. Please check your DNS records."
fi

echo "✅ Setup Complete!"
echo "Your platform is running at: http://${DOMAIN}"
if [ "$SETUP_SSL" == "y" ]; then
    echo "Secure URL: https://${DOMAIN}"
fi
