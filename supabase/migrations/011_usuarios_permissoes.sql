-- Sistema de Usuarios e Camadas de Permissao
-- Migration: 011_usuarios_permissoes.sql

-- Tipos de papel no sistema
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
      'super_admin',
      'admin_empresa',
      'diretor',
      'advogado',
      'testemunha',
      'parte_integrante',
      'convidado_unico'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de perfis de usuario (extende auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  cargo TEXT,
  role user_role NOT NULL DEFAULT 'advogado',
  empresa_id UUID,
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissoes granulares por funcionalidade
CREATE TABLE IF NOT EXISTS permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT
);

-- Associacao role -> permissoes
CREATE TABLE IF NOT EXISTS role_permissoes (
  role user_role NOT NULL,
  permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permissao_id)
);

-- Convites pendentes
CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nome TEXT,
  role user_role NOT NULL,
  empresa_id UUID,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  convidado_por UUID REFERENCES auth.users(id),
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  aceito_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acessos unicos (para convidado_unico)
CREATE TABLE IF NOT EXISTS acessos_unicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  documento_id UUID,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  tipo TEXT NOT NULL CHECK (tipo IN ('visualizar', 'assinar')),
  usado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_profiles_empresa ON user_profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token);
CREATE INDEX IF NOT EXISTS idx_acessos_unicos_token ON acessos_unicos(token);

-- Seed de permissoes
INSERT INTO permissoes (codigo, nome, categoria) VALUES
-- Demandas
('demandas.visualizar', 'Visualizar demandas', 'demandas'),
('demandas.criar', 'Criar demandas', 'demandas'),
('demandas.editar', 'Editar demandas', 'demandas'),
('demandas.excluir', 'Excluir demandas', 'demandas'),
-- Contratos
('contratos.visualizar', 'Visualizar contratos', 'contratos'),
('contratos.criar', 'Criar contratos', 'contratos'),
('contratos.editar', 'Editar contratos', 'contratos'),
('contratos.assinar_diretor', 'Assinar como diretor', 'contratos'),
('contratos.assinar_testemunha', 'Assinar como testemunha', 'contratos'),
('contratos.assinar_parte', 'Assinar como parte', 'contratos'),
('contratos.enviar_assinatura', 'Enviar para assinatura', 'contratos'),
-- Templates
('templates.visualizar', 'Visualizar templates', 'templates'),
('templates.usar', 'Usar templates', 'templates'),
('templates.criar', 'Criar templates', 'templates'),
('templates.editar', 'Editar templates', 'templates'),
-- WhatsApp
('whatsapp.chat', 'Usar chat WhatsApp', 'whatsapp'),
('whatsapp.enviar', 'Enviar mensagens', 'whatsapp'),
('whatsapp.lembretes', 'Gerenciar lembretes', 'whatsapp'),
-- Administracao
('admin.usuarios', 'Gerenciar usuarios', 'admin'),
('admin.empresas', 'Gerenciar empresas', 'admin'),
('admin.sistema', 'Configuracoes do sistema', 'admin')
ON CONFLICT (codigo) DO NOTHING;

-- Associar permissoes aos roles
-- SUPER_ADMIN: todas as permissoes
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'super_admin', id FROM permissoes
ON CONFLICT DO NOTHING;

-- ADMIN_EMPRESA: gerencia empresa
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'admin_empresa', id FROM permissoes 
WHERE codigo NOT IN ('admin.sistema')
ON CONFLICT DO NOTHING;

-- DIRETOR: assina e visualiza
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'diretor', id FROM permissoes 
WHERE codigo IN (
  'demandas.visualizar', 'contratos.visualizar', 'contratos.assinar_diretor',
  'templates.visualizar', 'templates.usar'
)
ON CONFLICT DO NOTHING;

-- ADVOGADO: trabalho juridico
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'advogado', id FROM permissoes 
WHERE codigo IN (
  'demandas.visualizar', 'demandas.criar', 'demandas.editar',
  'contratos.visualizar', 'contratos.criar', 'contratos.editar', 'contratos.enviar_assinatura',
  'templates.visualizar', 'templates.usar',
  'whatsapp.chat', 'whatsapp.enviar', 'whatsapp.lembretes'
)
ON CONFLICT DO NOTHING;

-- TESTEMUNHA: apenas assina
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'testemunha', id FROM permissoes 
WHERE codigo IN ('contratos.visualizar', 'contratos.assinar_testemunha')
ON CONFLICT DO NOTHING;

-- PARTE_INTEGRANTE: apenas seus contratos
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'parte_integrante', id FROM permissoes 
WHERE codigo IN ('contratos.visualizar', 'contratos.assinar_parte')
ON CONFLICT DO NOTHING;

-- Funcao para verificar permissao
CREATE OR REPLACE FUNCTION check_permission(
  user_id_param UUID,
  permission_code_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Buscar role do usuario
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE id = user_id_param AND ativo = true;

  -- Verificar se tem permissao
  RETURN EXISTS (
    SELECT 1
    FROM role_permissoes rp
    JOIN permissoes p ON rp.permissao_id = p.id
    WHERE rp.role = user_role_val
      AND p.codigo = permission_code_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE acessos_unicos ENABLE ROW LEVEL SECURITY;

-- Politicas RLS basicas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));

DROP POLICY IF EXISTS "Public permissoes read" ON permissoes;
CREATE POLICY "Public permissoes read" ON permissoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own convites" ON convites;
CREATE POLICY "Users can view own convites" ON convites
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
  ));
