-- Assinaturas Digitais
-- Migration: 008_assinaturas.sql

-- Documentos para assinatura
CREATE TABLE IF NOT EXISTS documentos_assinatura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID,
  template_id UUID REFERENCES templates_juridicos(id),
  nome_documento TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  valor DECIMAL,
  security_level security_level DEFAULT 'basico',
  arquivo_url TEXT,
  hash_documento TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'assinado', 'cancelado')),
  empresa_id UUID REFERENCES empresas(id),
  contraparte_id UUID REFERENCES contrapartes(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assinaturas individuais
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_assinatura(id) ON DELETE CASCADE,
  signatario_nome TEXT NOT NULL,
  signatario_email TEXT NOT NULL,
  signatario_cpf TEXT,
  cargo TEXT,
  tipo_assinatura TEXT NOT NULL CHECK (tipo_assinatura IN ('diretor', 'testemunha', 'parte', 'representante')),
  assinado_em TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  hash_assinatura TEXT,
  verificacao_2fa BOOLEAN DEFAULT false,
  metodo_verificacao TEXT,
  geolocalizacao JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de aprovações (já existe, mas adicionar campos se necessário)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_aprovacoes') THEN
    CREATE TABLE historico_aprovacoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      arquivo_id UUID,
      documento_id UUID REFERENCES documentos_assinatura(id),
      status_anterior TEXT,
      status_novo TEXT,
      comentario TEXT,
      aprovado_por UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Indices
CREATE INDEX IF NOT EXISTS idx_documentos_demanda ON documentos_assinatura(demanda_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos_assinatura(status);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa ON documentos_assinatura(empresa_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_documento ON assinaturas(documento_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_email ON assinaturas(signatario_email);

-- Trigger para updated_at
CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos_assinatura
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE documentos_assinatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Users can view documentos" ON documentos_assinatura;
CREATE POLICY "Users can view documentos" ON documentos_assinatura
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    ) OR
    empresa_id = (SELECT empresa_id FROM user_profiles WHERE id = auth.uid()) OR
    id IN (
      SELECT documento_id FROM assinaturas 
      WHERE signatario_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage documentos" ON documentos_assinatura;
CREATE POLICY "Users can manage documentos" ON documentos_assinatura
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));

DROP POLICY IF EXISTS "Users can view own assinaturas" ON assinaturas;
CREATE POLICY "Users can view own assinaturas" ON assinaturas
  FOR SELECT USING (
    signatario_email = (SELECT email FROM user_profiles WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado', 'diretor')
    )
  );

DROP POLICY IF EXISTS "Users can create assinaturas" ON assinaturas;
CREATE POLICY "Users can create assinaturas" ON assinaturas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Signers can update own assinaturas" ON assinaturas;
CREATE POLICY "Signers can update own assinaturas" ON assinaturas
  FOR UPDATE USING (
    signatario_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
  );
