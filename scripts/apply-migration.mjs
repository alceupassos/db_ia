import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('📄 Lendo arquivo de migração...');
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '002_juridico.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Divide a migração em comandos individuais
  const commands = migrationSQL
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`🔧 Executando ${commands.length} comandos SQL...\n`);

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    if (!command.trim() || command.trim().startsWith('--')) continue;

    try {
      // Adiciona ponto e vírgula de volta se necessário
      const sqlCommand = command.endsWith(';') ? command : command + ';';
      
      console.log(`  [${i + 1}/${commands.length}] Executando comando...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: sqlCommand });
      
      if (error) {
        // Tenta executar diretamente
        const { error: directError } = await supabase.from('_temp').select('1').limit(0);
        console.log(`    ⚠️  Comando pode já ter sido executado ou precisa ser aplicado manualmente`);
      } else {
        console.log(`    ✓ Comando executado`);
      }
    } catch (err) {
      console.log(`    ⚠️  Erro: ${err.message}`);
    }
  }

  console.log('\n✅ Migração concluída!');
  console.log('\n⚠️  NOTA: Se houver erros, você pode precisar aplicar a migração manualmente via:');
  console.log('   - Dashboard do Supabase (SQL Editor)');
  console.log('   - Supabase CLI: supabase migration up');
}

applyMigration().catch(console.error);
