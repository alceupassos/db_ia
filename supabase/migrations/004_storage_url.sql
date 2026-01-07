-- Adicionar coluna storage_url para arquivos locais
ALTER TABLE arquivos_demanda
ADD COLUMN IF NOT EXISTS storage_url TEXT;

-- Remover colunas do Google Drive (opcional - mantendo para compatibilidade)
-- ALTER TABLE arquivos_demanda DROP COLUMN IF EXISTS google_drive_id;
-- ALTER TABLE arquivos_demanda DROP COLUMN IF EXISTS google_drive_url;

-- Criar bucket de storage se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('arquivos-juridico', 'arquivos-juridico', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload público (ajustar conforme necessidade)
CREATE POLICY IF NOT EXISTS "Permitir upload público"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'arquivos-juridico');

CREATE POLICY IF NOT EXISTS "Permitir leitura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'arquivos-juridico');

CREATE POLICY IF NOT EXISTS "Permitir delete para autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'arquivos-juridico');
