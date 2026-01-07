import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WPPCONNECT_URL = process.env.WPPCONNECT_URL || 'http://localhost:21465';
const WPPCONNECT_SECRET_KEY = process.env.WPPCONNECT_SECRET_KEY || '';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { sessionName = 'default', phone, message, file } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Telefone e mensagem sao obrigatorios' }, { status: 400 });
    }

    // Enviar mensagem via WPPConnect
    const payload: any = {
      phone,
      message,
    };

    if (file) {
      payload.media = file;
    }

    const response = await fetch(`${WPPCONNECT_URL}/api/${sessionName}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': WPPCONNECT_SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Salvar mensagem no banco
    if (data.success || data.messageId) {
      await supabase.from('whatsapp_messages').insert({
        session_name: sessionName,
        telefone: phone,
        message_id: data.messageId,
        body: message,
        from_me: true,
        timestamp: new Date().toISOString(),
        status: 'sent',
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
