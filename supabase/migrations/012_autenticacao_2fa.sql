-- Autenticacao 2FA e Niveis de Seguranca
-- Migration: 012_autenticacao_2fa.sql

-- Niveis de seguranca para documentos
DO $$ BEGIN
    CREATE TYPE security_level AS ENUM ('basico', 'intermediario', 'alto', 'critico');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Configuracao 2FA por usuario
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  backup_codes_used INTEGER DEFAULT 0,
  ultimo_uso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuracao de nivel por tipo de documento
CREATE TABLE IF NOT EXISTS documento_security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento TEXT NOT NULL,
  valor_minimo DECIMAL,
  valor_maximo DECIMAL,
  security_level security_level NOT NULL,
  requer_2fa BOOLEAN DEFAULT false,
  requer_qrcode BOOLEAN DEFAULT false,
  requer_video_confirmacao BOOLEAN DEFAULT false,
  descricao TEXT
);

-- Log de verificacoes 2FA
CREATE TABLE IF NOT EXISTS log_verificacoes_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  documento_id UUID,
  tipo_verificacao TEXT,
  sucesso BOOLEAN,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_log_2fa_user ON log_verificacoes_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_security_tipo ON documento_security_config(tipo_documento);

-- Seed de Configuracoes de Seguranca
INSERT INTO documento_security_config (tipo_documento, valor_minimo, valor_maximo, security_level, requer_2fa, requer_qrcode) VALUES
-- Documentos internos
('memorando', NULL, NULL, 'basico', false, false),
('ata_reuniao', NULL, NULL, 'basico', false, false),
-- Contratos por valor
('contrato', 0, 10000, 'basico', false, false),
('contrato', 10000, 50000, 'intermediario', false, false),
('contrato', 50000, 500000, 'alto', true, false),
('contrato', 500000, NULL, 'critico', true, true),
-- Documentos criticos sempre nivel maximo
('procuracao', NULL, NULL, 'critico', true, true),
('patente', NULL, NULL, 'critico', true, true),
('licitacao', NULL, NULL, 'critico', true, true),
('nda', NULL, NULL, 'alto', true, false)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE documento_security_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_verificacoes_2fa ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Users can manage own 2FA" ON user_2fa;
CREATE POLICY "Users can manage own 2FA" ON user_2fa
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public security config read" ON documento_security_config;
CREATE POLICY "Public security config read" ON documento_security_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own 2FA logs" ON log_verificacoes_2fa;
CREATE POLICY "Users can view own 2FA logs" ON log_verificacoes_2fa
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));
