#!/usr/bin/env node

/**
 * Script para aplicar migration arquivos_pool manualmente
 * Execute: node scripts/apply-pool-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📄 Lendo migration...');
    const migrationPath = join(__dirname, '../supabase/migrations/014_arquivos_pool.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('🔧 Aplicando migration arquivos_pool...');
    
    // Dividir em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️  Aviso ao executar comando:`, error.message);
          }
        } catch {
          // Tentar executar diretamente via SQL
          console.warn(`⚠️  Não foi possível executar via RPC, tente aplicar manualmente no Supabase Dashboard`);
        }
      }
    }

    console.log('✅ Migration aplicada!');
    console.log('');
    console.log('⚠️  Se houver erros, aplique manualmente no Supabase Dashboard:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('   2. Cole o conteúdo de: supabase/migrations/014_arquivos_pool.sql');
    console.log('   3. Execute a query');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    console.log('');
    console.log('📋 Aplique manualmente no Supabase Dashboard:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('   2. Cole o conteúdo de: supabase/migrations/014_arquivos_pool.sql');
    console.log('   3. Execute a query');
    process.exit(1);
  }
}

applyMigration();
