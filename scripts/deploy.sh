#!/bin/bash

# Deploy script for Cepalab Jurídico
# Usage: ./scripts/deploy.sh

set -e

# Configuration
VPS_USER="cepalab"
VPS_HOST="192.168.100.20"
VPS_PATH="/home/cepalab/apps/juridico"
APP_NAME="cepalab-juridico"

echo "🚀 Iniciando deploy para $VPS_HOST..."

# 1. Build local
echo "📦 Construindo aplicação..."
npm run build

# 2. Create deployment package
echo "📁 Criando pacote de deploy..."
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.ts \
    Dockerfile \
    docker-compose.prod.yml \
    --exclude='.next/cache' 2>/dev/null || \
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.ts

# 3. Copy to VPS
echo "📤 Enviando arquivos para VPS..."
scp deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# 4. Deploy on VPS
echo "🔧 Executando deploy no VPS..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    set -e
    
    # Create directory if not exists
    mkdir -p /home/cepalab/apps/juridico
    cd /home/cepalab/apps/juridico
    
    # Backup current version
    if [ -d ".next" ]; then
        echo "📋 Fazendo backup da versão atual..."
        mv .next .next.backup 2>/dev/null || true
    fi
    
    # Extract new version
    echo "📂 Extraindo nova versão..."
    tar -xzf /tmp/deploy.tar.gz
    rm /tmp/deploy.tar.gz
    
    # Install dependencies
    echo "📦 Instalando dependências..."
    npm ci --production
    
    # Restart with Docker (if using Docker)
    if command -v docker &> /dev/null; then
        echo "🐳 Reiniciando container Docker..."
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml up -d --build
    else
        # Or restart with PM2 (if using PM2)
        if command -v pm2 &> /dev/null; then
            echo "🔄 Reiniciando com PM2..."
            pm2 delete cepalab-juridico 2>/dev/null || true
            pm2 start npm --name "cepalab-juridico" -- start
            pm2 save
        else
            echo "⚠️ Nenhum gerenciador de processos encontrado (Docker ou PM2)"
            echo "   Instale Docker ou PM2 para gerenciar a aplicação"
        fi
    fi
    
    # Clean up backup
    rm -rf .next.backup 2>/dev/null || true
    
    echo "✅ Deploy concluído!"
ENDSSH

# Clean up local
rm deploy.tar.gz

echo ""
echo "✅ Deploy finalizado com sucesso!"
echo "🌐 Acesse: http://$VPS_HOST:3001"
