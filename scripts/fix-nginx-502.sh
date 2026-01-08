#!/bin/bash

# Local Fix Orchestrator - Portuguese
VPS_USER="cepalab"
VPS_HOST="192.168.100.20"
VPS_PASSWORD="abc123.."

echo "🚀 Iniciando Operação Resgate (Fix 502 Gateway)..."

# 1. Enviar scripts
echo "📤 Enviando ferramentas de correção..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no scripts/apply-robust-nginx.sh scripts/rescue-app.sh $VPS_USER@$VPS_HOST:/tmp/

# 2. Executar correção da aplicação
echo "🔧 Corrigindo aplicação Next.js..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "bash /tmp/rescue-app.sh"

# 3. Executar correção do Nginx (com sudo)
echo "🛡️  Configurando Nginx Robusto..."
sshpass -p "$VPS_PASSWORD" ssh -tt -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "sudo bash /tmp/apply-robust-nginx.sh"

echo "✅ Tudo pronto! Verifique http://192.168.100.20"
