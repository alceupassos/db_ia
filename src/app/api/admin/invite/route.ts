import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, nome, role, empresa_id } = await req.json();

    // Obter usuario que esta convidando
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Criar convite
    const { data: convite, error: inviteError } = await supabase
      .from('convites')
      .insert({
        email,
        nome,
        role,
        empresa_id: empresa_id || null,
        convidado_por: user.id,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // TODO: Enviar email com link de convite usando Resend ou Supabase Auth Magic Link
    // Por enquanto, apenas criar o registro no banco

    return NextResponse.json({ 
      success: true,
      convite,
      message: 'Convite criado com sucesso. O usuário receberá um email com instruções.',
    });
  } catch (error: unknown) {
    console.error('Error creating invite:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar convite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
