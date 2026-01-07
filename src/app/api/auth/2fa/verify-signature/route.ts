import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { code, documentoId, method = 'totp' } = await req.json();

    // Obter usuario da sessao
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    // Buscar segredo 2FA do usuario
    const { data: user2fa, error: fetchError } = await supabase
      .from('user_2fa')
      .select('totp_secret, totp_enabled')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !user2fa?.totp_enabled || !user2fa?.totp_secret) {
      return NextResponse.json({ error: '2FA nao configurado' }, { status: 400 });
    }

    // Verificar codigo TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: user2fa.totp_secret,
    });

    if (!isValid) {
      // Registrar tentativa falha
      await supabase.from('log_verificacoes_2fa').insert({
        user_id: user.id,
        documento_id: documentoId,
        tipo_verificacao: method,
        sucesso: false,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({ error: 'Codigo invalido' }, { status: 401 });
    }

    // Registrar verificacao bem-sucedida
    await supabase.from('log_verificacoes_2fa').insert({
      user_id: user.id,
      documento_id: documentoId,
      tipo_verificacao: method,
      sucesso: true,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    // Atualizar ultimo uso do 2FA
    await supabase
      .from('user_2fa')
      .update({ ultimo_uso: new Date().toISOString() })
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true,
      verified: true,
    });
  } catch (error: unknown) {
    console.error('Error verifying 2FA:', error);
    const message = error instanceof Error ? error.message : 'Erro ao verificar 2FA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
