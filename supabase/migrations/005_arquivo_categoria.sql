-- Adicionar colunas para categorização e descrição gerada por IA
ALTER TABLE arquivos_demanda
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS descricao_ia TEXT;

-- Criar índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_arquivos_categoria ON arquivos_demanda(categoria);

-- Comentários para documentação
COMMENT ON COLUMN arquivos_demanda.categoria IS 'Categoria do documento identificada pela IA: Contrato, Procuração, Parecer, Petição, Acordo, Notificação, Certidão, Outros';
COMMENT ON COLUMN arquivos_demanda.descricao_ia IS 'Descrição automática do documento gerada pela IA';
