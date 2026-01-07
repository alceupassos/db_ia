-- Templates Juridicos Bilingues
-- Migration: 010_templates_juridicos.sql

CREATE TABLE IF NOT EXISTS templates_juridicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  nome_pt TEXT NOT NULL,
  nome_en TEXT NOT NULL,
  descricao_pt TEXT,
  descricao_en TEXT,
  conteudo_pt TEXT NOT NULL,
  conteudo_en TEXT NOT NULL,
  orgao_destino TEXT[],
  empresa TEXT DEFAULT 'CEPALAB',
  variaveis JSONB,
  tags TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_templates_categoria ON templates_juridicos(categoria);
CREATE INDEX IF NOT EXISTS idx_templates_empresa ON templates_juridicos(empresa);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates_juridicos USING GIN(tags);

-- Trigger para updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates_juridicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE templates_juridicos ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Users can view templates" ON templates_juridicos;
CREATE POLICY "Users can view templates" ON templates_juridicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON templates_juridicos;
CREATE POLICY "Admins can manage templates" ON templates_juridicos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));
