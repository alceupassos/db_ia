-- Configuracao RLS e Realtime Completa
-- Migration: 013_rls_realtime.sql

-- Habilitar Realtime para tabelas criticas
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'whatsapp_messages',
        'whatsapp_reminders',
        'documentos_assinatura',
        'assinaturas',
        'demandas_juridicas'
      )
  LOOP
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not add % to realtime publication', table_name;
    END;
  END LOOP;
END $$;

-- Politicas RLS adicionais para demandas_juridicas (se nao existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demandas_juridicas') THEN
    -- Verificar se politica ja existe
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'demandas_juridicas' 
        AND policyname = 'Demandas por empresa'
    ) THEN
      CREATE POLICY "Demandas por empresa" ON demandas_juridicas
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
          ) OR
          id IN (
            SELECT id FROM demandas_juridicas d
            WHERE EXISTS (
              SELECT 1 FROM user_profiles up
              WHERE up.id = auth.uid() 
                AND (up.empresa_id IS NOT NULL OR up.role IN ('advogado', 'diretor'))
            )
          )
        );
    END IF;
  END IF;
END $$;

-- Criar buckets de storage se nao existirem
DO $$
BEGIN
  -- Bucket de logos de empresas
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos-empresas') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('logos-empresas', 'logos-empresas', true);
  END IF;

  -- Bucket de assinaturas
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assinaturas') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('assinaturas', 'assinaturas', false);
  END IF;

  -- Bucket de documentos assinados
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documentos-assinados') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('documentos-assinados', 'documentos-assinados', false);
  END IF;

  -- Bucket de templates PDF
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'templates-pdf') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('templates-pdf', 'templates-pdf', false);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create storage buckets. Ensure storage is enabled.';
END $$;

-- Politicas de storage
DROP POLICY IF EXISTS "Public logos read" ON storage.objects;
DO $$
BEGIN
  CREATE POLICY "Public logos read" ON storage.objects
    FOR SELECT USING (bucket_id = 'logos-empresas');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Authenticated upload logos" ON storage.objects;
DO $$
BEGIN
  CREATE POLICY "Authenticated upload logos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'logos-empresas' AND
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin_empresa')
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
