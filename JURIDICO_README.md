# Camada Jurídica - Sistema de Demandas Jurídicas

Sistema SaaS completo para gerenciamento de demandas jurídicas com integração de IA e Google Drive.

## Funcionalidades

- ✅ **Autenticação Magic Link** - Login sem senha via email
- ✅ **Dashboard de Demandas** - Visualização com KPIs, filtros e busca
- ✅ **Formulário Inteligente** - Criação de demandas com autocomplete e pre-preenchimento
- ✅ **Integração Google Drive** - Seleção e vinculação de arquivos diretamente do Drive
- ✅ **IA para Resumos** - Resumo automático de contratos usando ChatGPT
- ✅ **Busca Semântica** - Busca inteligente nos documentos usando IA
- ✅ **Gerenciamento Completo** - Edição, exclusão e acompanhamento de demandas

## Configuração Inicial

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```bash
# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (já configurado)
OPENAI_API_KEY=your_openai_key

# Google Drive Picker (NOVO - necessário configurar)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Configurar Google Drive Picker

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Google Drive API
   - Google Picker API
4. Crie credenciais OAuth 2.0:
   - Tipo: Aplicativo Web
   - URI de redirecionamento autorizado: `http://localhost:3000` (dev) e seu domínio (prod)
5. Copie o Client ID e adicione ao `.env.local` como `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 3. Executar Migrações

```bash
# Aplicar migration do banco de dados
npm run migrate
# ou através do Supabase Dashboard: SQL Editor > Run migration 002_juridico.sql
```

### 4. Importar Dados Iniciais

```bash
# Importar dados da planilha Excel
node scripts/import-excel.mjs
```

## Estrutura do Sistema

```
src/
├── app/
│   ├── juridico/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── nova/page.tsx         # Formulário nova demanda
│   │   └── [id]/page.tsx         # Detalhes da demanda
│   ├── login/page.tsx            # Página de login
│   ├── actions/
│   │   └── juridico.ts           # Server Actions
│   └── api/
│       └── juridico/
│           ├── resumir-contrato/ # API para resumos IA
│           └── buscar-semantica/ # API para busca semântica
├── components/
│   ├── auth-provider.tsx         # Context de autenticação
│   ├── protected-route.tsx       # HOC para proteger rotas
│   ├── google-drive-picker.tsx   # Componente Google Drive
│   ├── ai-summary-button.tsx     # Botão para resumos IA
│   ├── ai-search.tsx             # Busca semântica
│   └── juridico-kpi-card.tsx     # Cards de KPI
└── lib/
    ├── supabase-client.ts        # Cliente Supabase (frontend)
    └── supabase-server.ts        # Cliente Supabase (server)

supabase/
└── migrations/
    └── 002_juridico.sql          # Schema do banco de dados

scripts/
└── import-excel.mjs              # Script de importação
```

## Uso

### Autenticação

O sistema suporta dois métodos de login:

**1. Email e Senha (Recomendado)**
- Email: `juridico@cepalab.com.br`
- Senha: `juridico123`

**2. Magic Link**
- Digite seu email
- Verifique sua caixa de entrada e clique no link mágico

Para acessar:
1. Acesse `/login`
2. Escolha o método de login (Email/Senha ou Magic Link)
3. Faça login e você será redirecionado para o dashboard

**Criar novo usuário:**
```bash
node scripts/create-juridico-user.mjs
```

### Criar Nova Demanda

1. No dashboard, clique em "Nova Demanda"
2. Preencha os campos (autocomplete disponível para clientes)
3. Salve

### Adicionar Arquivos

1. Na página de detalhes da demanda
2. Clique em "Selecionar do Google Drive"
3. Autorize o acesso ao Google Drive (primeira vez)
4. Selecione o arquivo desejado

### Gerar Resumo com IA

1. Na página de detalhes da demanda
2. Localize o arquivo na sidebar
3. Clique em "Resumir com IA"
4. Aguarde o processamento (usa ChatGPT)

### Busca Semântica

1. Use a barra de busca semântica na sidebar
2. Digite sua consulta em linguagem natural
3. A IA encontrará documentos relevantes

## Banco de Dados

### Tabelas Principais

- **clientes** - Cadastro de clientes
- **demandas_juridicas** - Demandas jurídicas
- **arquivos_demanda** - Arquivos vinculados às demandas
- **resumos_contratos** - Resumos gerados pela IA

### Políticas RLS

Todas as tabelas têm Row Level Security (RLS) habilitado, permitindo acesso apenas para usuários autenticados.

## Próximos Passos

- [ ] Melhorar extração de texto de arquivos PDF/DOCX do Google Drive
- [ ] Adicionar notificações por email
- [ ] Implementar dashboard de relatórios
- [ ] Adicionar exportação de dados
- [ ] Implementar versionamento de documentos

## Troubleshooting

### Google Drive Picker não abre

- Verifique se `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está configurado
- Verifique se as APIs estão habilitadas no Google Cloud Console
- Verifique os URIs de redirecionamento

### Erro ao gerar resumo

- Verifique se `OPENAI_API_KEY` está configurado
- Verifique créditos da conta OpenAI

### Erro de autenticação

- Verifique configuração do Supabase Auth
- Verifique se Magic Link está habilitado no Supabase Dashboard
