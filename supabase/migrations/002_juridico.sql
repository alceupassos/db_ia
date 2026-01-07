-- Sistema Jurídico - Camada Jurídica
-- Migration para criar todas as tabelas do sistema de demandas jurídicas

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT,
    contato TEXT,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de Demandas Jurídicas
CREATE TABLE IF NOT EXISTS demandas_juridicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nome TEXT NOT NULL, -- Mantém histórico mesmo se cliente for deletado
    demanda TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    data_solicitacao DATE,
    prazo DATE,
    data_entrega DATE,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM ANDAMENTO', 'CONCLUÍDO', 'Cancelado')),
    observacoes TEXT,
    documentos_assinados TEXT DEFAULT 'EM ANDAMENTO' CHECK (documentos_assinados IN ('EM ANDAMENTO', 'CONCLUÍDO', 'x', '')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de Arquivos vinculados a Demandas
CREATE TABLE IF NOT EXISTS arquivos_demanda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id UUID REFERENCES demandas_juridicas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tipo TEXT, -- PDF, DOCX, etc.
    tamanho BIGINT, -- em bytes
    google_drive_id TEXT, -- ID do arquivo no Google Drive
    google_drive_url TEXT, -- URL do arquivo no Google Drive
    supabase_path TEXT, -- Path no Supabase Storage (se houver backup local)
    mime_type TEXT,
    resumo_ia TEXT, -- Resumo gerado pela IA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de Resumos de Contratos gerados pela IA
CREATE TABLE IF NOT EXISTS resumos_contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arquivo_id UUID REFERENCES arquivos_demanda(id) ON DELETE CASCADE,
    resumo TEXT NOT NULL,
    pontos_principais JSONB, -- Array de pontos principais extraídos
    clausulas_importantes JSONB, -- Array de cláusulas importantes
    sugestoes_proximos_passos JSONB, -- Sugestões da IA
    modelo_ia TEXT DEFAULT 'gpt-4o', -- Modelo usado para gerar o resumo
    tokens_usados INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_demandas_cliente ON demandas_juridicas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_demandas_status ON demandas_juridicas(status);
CREATE INDEX IF NOT EXISTS idx_demandas_responsavel ON demandas_juridicas(responsavel);
CREATE INDEX IF NOT EXISTS idx_demandas_data_solicitacao ON demandas_juridicas(data_solicitacao);
CREATE INDEX IF NOT EXISTS idx_arquivos_demanda ON arquivos_demanda(demanda_id);
CREATE INDEX IF NOT EXISTS idx_arquivos_google_drive ON arquivos_demanda(google_drive_id);
CREATE INDEX IF NOT EXISTS idx_resumos_arquivo ON resumos_contratos(arquivo_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

-- Enable Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas_juridicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_demanda ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumos_contratos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users can view all clients" ON clientes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert clients" ON clientes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update clients" ON clientes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete clients" ON clientes FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para demandas
CREATE POLICY "Users can view all demandas" ON demandas_juridicas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert demandas" ON demandas_juridicas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update demandas" ON demandas_juridicas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete demandas" ON demandas_juridicas FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para arquivos
CREATE POLICY "Users can view all arquivos" ON arquivos_demanda FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert arquivos" ON arquivos_demanda FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update arquivos" ON arquivos_demanda FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete arquivos" ON arquivos_demanda FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para resumos
CREATE POLICY "Users can view all resumos" ON resumos_contratos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert resumos" ON resumos_contratos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update resumos" ON resumos_contratos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete resumos" ON resumos_contratos FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demandas_updated_at BEFORE UPDATE ON demandas_juridicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar bucket no Storage para backup de arquivos (se necessário)
INSERT INTO storage.buckets (id, name, public)
VALUES ('juridico-arquivos', 'juridico-arquivos', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para arquivos jurídicos
CREATE POLICY "Authenticated users can upload juridico files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'juridico-arquivos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view juridico files"
ON storage.objects FOR SELECT
USING (bucket_id = 'juridico-arquivos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete juridico files"
ON storage.objects FOR DELETE
USING (bucket_id = 'juridico-arquivos' AND auth.role() = 'authenticated');
