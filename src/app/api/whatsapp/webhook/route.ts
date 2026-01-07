import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const event = await req.json();

    // Processar eventos do WhatsApp
    if (event.event === 'messages.upsert') {
      const message = event.data?.messages?.[0];
      
      if (message && !message.fromMe) {
        // Salvar mensagem recebida
        await supabase.from('whatsapp_messages').insert({
          session_name: event.session || 'default',
          telefone: message.from,
          message_id: message.id,
          message_type: message.type,
          body: message.body,
          from_me: false,
          timestamp: new Date(message.timestamp * 1000).toISOString(),
          status: 'received',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
