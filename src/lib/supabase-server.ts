import { createClient } from '@supabase/supabase-js';
// import { cookies } from 'next/headers'; // Not used

export function createServerClient() {
  // Cookie store not used in current implementation
  // const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Para APIs server-side, usar service role key para operacoes privilegiadas
  // ou anon key com cookies para operacoes de usuario
  const useServiceRole = process.env.USE_SERVICE_ROLE === 'true' || false;

  return createClient(
    supabaseUrl,
    useServiceRole ? supabaseServiceKey : supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'cepalab-juridico@1.0.0',
        },
      },
    }
  );
}

// Funcao helper para obter usuario autenticado em server components/actions
export async function getServerUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
