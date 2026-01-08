# CEPALAB OS - Environment Setup

To run this system, you need to configure the following environment variables:

## Frontend (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uoqzxsfdxlqpbujsklfn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_N0YPhbqwlL5X8CoXHfSEHw_xFEpqPGa
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcXp4c2ZkeGxxcGJ1anNrbGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NDMxNSwiZXhwIjoyMDgyMzYwMzE1fQ.7CJL8Zkzijib2uyBPYsdXzJXIdG3WgW3DpnquRUtYUI

# Google APIs
GOOGLE_API_KEY=AIzaSyA3lhjHSOniR1YuZhebxsLFIovlfErKWPQ
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Google Cloud Console Setup

Para usar o Google Drive Picker e Google File System:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Google Drive API
   - Google Picker API
4. Crie credenciais OAuth 2.0:
   - Tipo: Aplicativo Web
   - Origens JavaScript autorizadas: `http://localhost:3001`, `https://seu-dominio.com`
   - URIs de redirecionamento: `http://localhost:3001`, `https://seu-dominio.com`
5. Copie o Client ID para `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
6. Configure a tela de consentimento OAuth

## Infrastructure (infra/.env)

```bash
VPN_USER=alceu
VPN_PASS=abc123..
MSSQL_HOST=104.234.224.238
MSSQL_PORT=1445
MSSQL_USER=angrax
MSSQL_PASS=G8f!qP2m#R7sVd1x
MSSQL_DATABASE=sgc
SUPABASE_URL=https://supabase.angra.io
SUPABASE_KEY=your_service_role_key
```

## Gemini API Configuration

Para usar a funcionalidade de geração de infográficos na página "Como Usar", adicione a seguinte variável ao `.env.local`:

```bash
GEMINI_API_KEY=AIzaSyBOulRkp3hVZekjhYqmshOY41nAf-3K4KQ
```

### Como obter a chave:
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie uma nova API key ou use uma existente
3. Certifique-se de que tem acesso ao Gemini 3 Pro (necessário para Nano Banana Pro)
4. Cole a chave no arquivo `.env.local`

**Nota**: A geração de imagens via Gemini 3 Nano Banana Pro pode requerer plano pago. Verifique os limites de uso na documentação oficial do Google.

**Configuração da Landing Page "Como Usar":**
- A landing page utiliza o cliente Gemini (`lib/gemini.ts`) para gerar infográficos automaticamente
- As imagens são armazenadas em cache no Supabase Storage para melhor performance
- Componentes disponíveis: `InfographicCard`, `Flowchart`, `ImageGenerator`, `InfographicImage`
