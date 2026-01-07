-- Workflow de Aprovação de Documentos

-- Adicionar campos de aprovação na tabela arquivos_demanda
ALTER TABLE arquivos_demanda
ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'RASCUNHO' 
  CHECK (status_aprovacao IN ('RASCUNHO', 'EM_REVISAO', 'APROVADO', 'REJEITADO')),
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS comentarios_aprovacao TEXT;

-- Criar tabela de histórico de aprovações
CREATE TABLE IF NOT EXISTS historico_aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_id UUID REFERENCES arquivos_demanda(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT,
  comentario TEXT,
  aprovado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para busca por status
CREATE INDEX IF NOT EXISTS idx_arquivos_status_aprovacao ON arquivos_demanda(status_aprovacao);

-- Comentários
COMMENT ON COLUMN arquivos_demanda.status_aprovacao IS 'Status do workflow: RASCUNHO, EM_REVISAO, APROVADO, REJEITADO';
COMMENT ON COLUMN arquivos_demanda.comentarios_aprovacao IS 'Comentários do aprovador sobre o documento';
