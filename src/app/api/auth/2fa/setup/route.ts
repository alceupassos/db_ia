import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    
    // Usar service role para operacoes privilegiadas
    const supabaseAdmin = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Gerar segredo TOTP
    const secret = authenticator.generateSecret();
    
    // Gerar URL para QR Code
    const otpauth = authenticator.keyuri(
      user.email || 'user',
      'Cepalab Juridico',
      secret
    );

    // Salvar segredo (temporário até confirmar)
    const { error } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: user.id,
        totp_secret: secret, // Em produção: criptografar
        totp_enabled: false,
      });

    if (error) {
      console.error('Error saving 2FA secret:', error);
      return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
    }

    return NextResponse.json({ 
      secret,
      qrCodeUrl: otpauth 
    });
  } catch (error) {
    console.error('Error in 2FA setup:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
