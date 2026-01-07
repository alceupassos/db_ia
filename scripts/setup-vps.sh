#!/bin/bash

# Setup script for VPS
# Run this once on the VPS to prepare the environment
# Usage: ssh cepalab@192.168.100.20 'bash -s' < scripts/setup-vps.sh

set -e

echo "🔧 Configurando VPS para Cepalab Jurídico..."

# Update system
echo "📦 Atualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker (optional but recommended)
echo "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install PM2 (alternative to Docker)
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Create app directory
echo "📁 Criando diretórios..."
mkdir -p ~/apps/juridico
cd ~/apps/juridico

# Create .env file template
echo "📝 Criando template de variáveis de ambiente..."
cat > .env << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uoqzxsfdxlqpbujsklfn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_N0YPhbqwlL5X8CoXHfSEHw_xFEpqPGa
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google APIs
GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EOF

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Edite o arquivo ~/apps/juridico/.env com suas chaves"
echo "   2. Execute o deploy: ./scripts/deploy.sh"
echo ""
