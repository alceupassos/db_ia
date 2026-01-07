-- Integracao WhatsApp
-- Migration: 007_whatsapp_integration.sql

-- Contatos do WhatsApp (stakeholders)
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'juiz', 'colega', 'fornecedor', 'outro')),
  empresa_id UUID REFERENCES empresas(id),
  email TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  contact_id UUID REFERENCES whatsapp_contacts(id),
  telefone TEXT NOT NULL,
  message_id TEXT,
  message_type TEXT,
  body TEXT,
  from_me BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lembretes agendados
CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID,
  contact_id UUID REFERENCES whatsapp_contacts(id),
  telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_envio TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro', 'cancelado')),
  enviado_em TIMESTAMPTZ,
  erro TEXT,
  tentativas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de mensagem
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  mensagem TEXT NOT NULL,
  variaveis JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_tipo ON whatsapp_contacts(tipo);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_empresa ON whatsapp_contacts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact ON whatsapp_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_status ON whatsapp_reminders(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_data_envio ON whatsapp_reminders(data_envio);

-- Triggers para updated_at
CREATE TRIGGER update_whatsapp_contacts_updated_at
  BEFORE UPDATE ON whatsapp_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Users can view whatsapp contacts" ON whatsapp_contacts;
CREATE POLICY "Users can view whatsapp contacts" ON whatsapp_contacts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado', 'diretor')
  ));

DROP POLICY IF EXISTS "Users can manage whatsapp contacts" ON whatsapp_contacts;
CREATE POLICY "Users can manage whatsapp contacts" ON whatsapp_contacts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));

DROP POLICY IF EXISTS "Users can view own messages" ON whatsapp_messages;
CREATE POLICY "Users can view own messages" ON whatsapp_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado', 'diretor')
  ));

DROP POLICY IF EXISTS "Users can view reminders" ON whatsapp_reminders;
CREATE POLICY "Users can view reminders" ON whatsapp_reminders
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));

DROP POLICY IF EXISTS "Users can manage reminders" ON whatsapp_reminders;
CREATE POLICY "Users can manage reminders" ON whatsapp_reminders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa', 'advogado')
  ));

DROP POLICY IF EXISTS "Users can view templates" ON whatsapp_templates;
CREATE POLICY "Users can view templates" ON whatsapp_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON whatsapp_templates;
CREATE POLICY "Admins can manage templates" ON whatsapp_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));
