#!/bin/bash

# Este script executa a limpeza e reinicialização completa no VPS
# Fix 502 Bad Gateway - Opus 4.5 level

APP_PATH="/home/cepalab/apps/juridico"
APP_NAME="cepalab-juridico"

echo "🧹 Iniciando limpeza profunda e correção..."

cd $APP_PATH

# 1. Parar processos pendentes
echo "🛑 Parando processos antigos..."
pm2 delete $APP_NAME 2>/dev/null || true
pkill -f "next-server" || true
pkill -f "npm install" || true

# 2. Forçar limpeza de cache do npm
echo "📦 Limpando cache e instalando dependências puras..."
npm cache clean --force
rm -rf node_modules
npm install --omit=dev --legacy-peer-deps

# 3. Iniciar com PM2 garantindo 127.0.0.1 e porta 3001
echo "🚀 Iniciando aplicação na porta 3001..."
PORT=3001 pm2 start npm --name "$APP_NAME" -- start -- -p 3001

# 4. Salvar configuração do PM2
pm2 save

echo "✨ Aplicação reiniciada!"
pm2 list
