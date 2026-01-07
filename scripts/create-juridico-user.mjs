import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createJuridicoUser() {
  const email = 'juridico@cepalab.com.br';
  const password = 'juridico123';

  console.log('🔐 Criando usuário jurídico...');

  try {
    // Verifica se o usuário já existe
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('✅ Usuário já existe. Atualizando senha...');
      
      // Atualiza a senha do usuário existente
      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: password }
      );

      if (error) throw error;
      
      console.log('✅ Senha atualizada com sucesso!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Senha: ${password}`);
    } else {
      // Cria novo usuário
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Confirma email automaticamente
      });

      if (error) throw error;

      console.log('✅ Usuário criado com sucesso!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Senha: ${password}`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar/atualizar usuário:', error.message);
    process.exit(1);
  }
}

createJuridicoUser();
