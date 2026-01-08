#!/bin/bash

# Setup Nginx configuration for cepa.angra.io (Remote execution)
# This script copies the setup script to VPS and executes it

VPS_USER="cepalab"
VPS_HOST="192.168.100.20"
VPS_PASSWORD="abc123.."

echo "🚀 Configurando Nginx remotamente..."

# Copy setup script to VPS
echo "📤 Enviando script para VPS..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no scripts/setup-nginx-http.sh $VPS_USER@$VPS_HOST:/tmp/setup-nginx-http.sh

# Execute on VPS with sudo
echo "🔧 Executando script no VPS..."
sshpass -p "$VPS_PASSWORD" ssh -tt -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "sudo bash /tmp/setup-nginx-http.sh"

echo "✅ Configuração do Nginx concluída!"
