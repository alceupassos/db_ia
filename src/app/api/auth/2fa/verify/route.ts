import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { code } = await req.json();
    
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Buscar segredo do usuário
    const { data: user2fa, error: fetchError } = await supabase
      .from('user_2fa')
      .select('totp_secret')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !user2fa?.totp_secret) {
      return NextResponse.json({ error: '2FA não configurado' }, { status: 400 });
    }

    // Verificar código
    const isValid = authenticator.verify({
      token: code,
      secret: user2fa.totp_secret,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
    }

    // Gerar códigos de backup
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Ativar 2FA e salvar backup codes
    const { error: updateError } = await supabase
      .from('user_2fa')
      .update({
        totp_enabled: true,
        backup_codes: backupCodes,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error enabling 2FA:', updateError);
      return NextResponse.json({ error: 'Erro ao ativar 2FA' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      backupCodes 
    });
  } catch (error) {
    console.error('Error in 2FA verify:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
