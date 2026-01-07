-- Cadastro de Empresas e Assinantes
-- Migration: 009_empresas_assinantes.sql

-- Cadastro de Empresas do Grupo
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  razao_social_en TEXT,
  cnpj TEXT NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  endereco_logradouro TEXT NOT NULL,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT NOT NULL,
  endereco_uf TEXT NOT NULL,
  endereco_cep TEXT NOT NULL,
  endereco_pais TEXT DEFAULT 'Brasil',
  endereco_completo_pt TEXT,
  endereco_completo_en TEXT,
  telefone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#14b8a6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funcao para gerar endereco completo PT
CREATE OR REPLACE FUNCTION generate_endereco_pt() RETURNS TRIGGER AS $$
BEGIN
  NEW.endereco_completo_pt := 
    NEW.endereco_logradouro || ', ' || 
    COALESCE(NEW.endereco_numero, 'S/N') || 
    COALESCE(', ' || NEW.endereco_complemento, '') || 
    ' - ' || NEW.endereco_bairro || ', ' || 
    NEW.endereco_cidade || '/' || NEW.endereco_uf || 
    ' - CEP: ' || NEW.endereco_cep;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_endereco_pt_trigger
  BEFORE INSERT OR UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION generate_endereco_pt();

-- Assinantes/Representantes Legais
CREATE TABLE IF NOT EXISTS assinantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cargo_pt TEXT NOT NULL,
  cargo_en TEXT,
  cpf TEXT,
  rg TEXT,
  email TEXT,
  telefone TEXT,
  pode_assinar BOOLEAN DEFAULT true,
  tipo_procuracao TEXT,
  validade_procuracao DATE,
  assinatura_digital_url TEXT,
  ordem_assinatura INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contraparte (clientes, fornecedores, parceiros)
CREATE TABLE IF NOT EXISTS contrapartes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'fornecedor', 'parceiro', 'governo', 'outro')),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj_cpf TEXT,
  endereco_completo TEXT,
  representante_nome TEXT,
  representante_cargo TEXT,
  representante_cpf TEXT,
  email TEXT,
  telefone TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_assinantes_empresa ON assinantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contrapartes_tipo ON contrapartes(tipo);

-- Triggers para updated_at
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assinantes_updated_at
  BEFORE UPDATE ON assinantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed de empresas (dados basicos - usuario deve completar)
INSERT INTO empresas (
  codigo, razao_social, nome_fantasia, cnpj, 
  endereco_logradouro, endereco_numero, endereco_bairro, 
  endereco_cidade, endereco_uf, endereco_cep
) VALUES
('CEPALAB', 'CEPALAB LABORATORIOS LTDA', 'CEPALAB', 'XX.XXX.XXX/0001-XX',
 'Rua Exemplo', '123', 'Centro', 'Sao Paulo', 'SP', '01000-000'),
('SIBIONICS', 'SIBIONICS BRASIL DISPOSITIVOS MEDICOS LTDA', 'SIBIONICS', 'YY.YYY.YYY/0001-YY',
 'Rua Exemplo', '456', 'Centro', 'Sao Paulo', 'SP', '01000-000'),
('REALTRADE', 'REALTRADE COMERCIO INTERNACIONAL LTDA', 'REALTRADE', 'ZZ.ZZZ.ZZZ/0001-ZZ',
 'Rua Exemplo', '789', 'Centro', 'Sao Paulo', 'SP', '01000-000')
ON CONFLICT (codigo) DO NOTHING;

-- Adicionar FK empresa_id em user_profiles (depois de criar tabela empresas)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_empresa_id_fkey'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas(id);
  END IF;
END $$;

-- Adicionar FK empresa_id em convites
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'convites_empresa_id_fkey'
  ) THEN
    ALTER TABLE convites 
    ADD CONSTRAINT convites_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrapartes ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Users can view empresas" ON empresas;
CREATE POLICY "Users can view empresas" ON empresas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage empresas" ON empresas;
CREATE POLICY "Admins can manage empresas" ON empresas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));

DROP POLICY IF EXISTS "Users can view assinantes" ON assinantes;
CREATE POLICY "Users can view assinantes" ON assinantes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage assinantes" ON assinantes;
CREATE POLICY "Admins can manage assinantes" ON assinantes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));

DROP POLICY IF EXISTS "Users can view contrapartes" ON contrapartes;
CREATE POLICY "Users can view contrapartes" ON contrapartes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage contrapartes" ON contrapartes;
CREATE POLICY "Users can manage contrapartes" ON contrapartes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));
