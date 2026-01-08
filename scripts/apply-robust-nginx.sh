#!/bin/bash

# Configuration
NGINX_CONFIG="/etc/nginx/sites-available/cepa.angra.io"
NGINX_ENABLED="/etc/nginx/sites-enabled/cepa.angra.io"

echo "🛠️  Applying Robust Nginx Configuration..."

# Create the robust config
cat > "$NGINX_CONFIG" << 'EOF'
upstream nextjs_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name cepa.angra.io 192.168.100.20;

    # Performance & Stability Buffers
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    
    # Large Client Header Buffers (fixes some 502/400 errors)
    large_client_header_buffers 4 16k;

    # Logs
    access_log /var/log/nginx/cepa.angra.io.access.log;
    error_log /var/log/nginx/cepa.angra.io.error.log;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts - Robust settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Optimizing static assets
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    location /public {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
EOF

# Link and test
ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"
nginx -t && systemctl reload nginx

echo "✅ Nginx reloaded with robust configuration."
