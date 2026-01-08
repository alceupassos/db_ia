#!/bin/bash

# Setup Nginx configuration for cepa.angra.io
# Usage: 
#   Option 1: Execute directly on VPS: sudo bash scripts/setup-nginx.sh
#   Option 2: Run from local: ./scripts/setup-nginx.sh

NGINX_CONFIG="/etc/nginx/sites-available/cepa.angra.io"
NGINX_ENABLED="/etc/nginx/sites-enabled/cepa.angra.io"

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script precisa ser executado com sudo"
    echo "   Execute: sudo bash $0"
    exit 1
fi

echo "🔧 Configurando Nginx para cepa.angra.io..."

# Create nginx config
cat > "$NGINX_CONFIG" << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name cepa.angra.io;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cepa.angra.io;

    # Logs
    access_log /var/log/nginx/cepa.angra.io.access.log;
    error_log /var/log/nginx/cepa.angra.io.error.log;

    # Proxy to Next.js app
    location / {
        # FORCE IPv4 127.0.0.1 to avoid 502 Bad Gateway with ::1 (localhost IPv6 resolution)
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
NGINXCONF

echo "✅ Arquivo de configuração criado: $NGINX_CONFIG"

# Enable site
ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"
echo "✅ Site habilitado: $NGINX_ENABLED"

# Test nginx configuration
echo "🧪 Testando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração válida!"
    systemctl reload nginx
    echo "✅ Nginx recarregado com sucesso!"
    echo ""
    echo "🌐 Site configurado: http://cepa.angra.io"
    echo "⚠️  Certifique-se de que o DNS aponta para este servidor."
else
    echo "❌ Erro na configuração do Nginx!"
    exit 1
fi
