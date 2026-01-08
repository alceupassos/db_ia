-- Pool de Arquivos - Arquivos não vinculados a demandas
-- Permite upload de arquivos sem precisar selecionar demanda antecipadamente

CREATE TABLE IF NOT EXISTS arquivos_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  storage_url TEXT,
  supabase_path TEXT,
  mime_type TEXT,
  tamanho BIGINT,
  categoria TEXT, -- Categoria sugerida pela IA
  descricao_ia TEXT, -- Descrição gerada pela IA
  categoria_usuario TEXT, -- Categoria escolhida/editada pelo usuário
  resumo_ia TEXT, -- Resumo gerado pela IA (backward compatibility)
  status TEXT DEFAULT 'aguardando_analise' CHECK (status IN ('aguardando_analise', 'analisado', 'vinculado')),
  demanda_id UUID REFERENCES demandas_juridicas(id) ON DELETE SET NULL, -- NULL até vincular
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_arquivos_pool_status ON arquivos_pool(status);
CREATE INDEX IF NOT EXISTS idx_arquivos_pool_demanda ON arquivos_pool(demanda_id) WHERE demanda_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_arquivos_pool_categoria ON arquivos_pool(categoria);
CREATE INDEX IF NOT EXISTS idx_arquivos_pool_created_at ON arquivos_pool(created_at DESC);

-- RLS Policies
ALTER TABLE arquivos_pool ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver todos os arquivos do pool
CREATE POLICY "Usuários autenticados podem ver arquivos do pool"
  ON arquivos_pool FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Usuários autenticados podem criar arquivos no pool
CREATE POLICY "Usuários autenticados podem criar arquivos no pool"
  ON arquivos_pool FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Usuários autenticados podem atualizar arquivos do pool
CREATE POLICY "Usuários autenticados podem atualizar arquivos do pool"
  ON arquivos_pool FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Usuários autenticados podem deletar arquivos do pool
CREATE POLICY "Usuários autenticados podem deletar arquivos do pool"
  ON arquivos_pool FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_arquivos_pool_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_arquivos_pool_updated_at
  BEFORE UPDATE ON arquivos_pool
  FOR EACH ROW
  EXECUTE FUNCTION update_arquivos_pool_updated_at();

-- Comentários para documentação
COMMENT ON TABLE arquivos_pool IS 'Pool de arquivos não vinculados a demandas. Arquivos são analisados pela IA antes de serem vinculados.';
COMMENT ON COLUMN arquivos_pool.status IS 'Status do arquivo: aguardando_analise, analisado, vinculado';
COMMENT ON COLUMN arquivos_pool.categoria IS 'Categoria sugerida automaticamente pela IA';
COMMENT ON COLUMN arquivos_pool.categoria_usuario IS 'Categoria escolhida ou editada pelo usuário';
COMMENT ON COLUMN arquivos_pool.descricao_ia IS 'Descrição detalhada gerada pela IA sobre o documento';
