#!/bin/bash

# Setup Nginx configuration for cepa.angra.io (HTTP Only Fix)
# This uses 127.0.0.1 to avoid localhost IPv6 resolution issues (502 Gateway)

NGINX_CONFIG="/etc/nginx/sites-available/cepa.angra.io"
NGINX_ENABLED="/etc/nginx/sites-enabled/cepa.angra.io"

echo "🔧 Configurando Nginx para cepa.angra.io (HTTP/127.0.0.1)..."

# Create nginx config
cat > "$NGINX_CONFIG" << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name cepa.angra.io 192.168.100.20;

    # Logs
    access_log /var/log/nginx/cepa.angra.io.access.log;
    error_log /var/log/nginx/cepa.angra.io.error.log;

    # Proxy to Next.js app
    location / {
        # FORCE IPv4 127.0.0.1 to avoid 502 Bad Gateway with ::1
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
    echo "🌐 Acesse: http://192.168.100.20"
else
    echo "❌ Erro na configuração do Nginx!"
    exit 1
fi
