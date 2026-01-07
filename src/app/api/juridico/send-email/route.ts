import { NextRequest, NextResponse } from 'next/server';
import { sendPrazoNotification, sendStatusNotification, sendWeeklySummary } from '@/app/actions/email';

export async function POST(req: NextRequest) {
  try {
    const { type, email, data } = await req.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    let result;
    
    switch (type) {
      case 'prazo':
        result = await sendPrazoNotification(email, data);
        break;
      case 'status':
        result = await sendStatusNotification(email, data);
        break;
      case 'summary':
        result = await sendWeeklySummary(email, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de e-mail inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao enviar e-mail' },
      { status: 500 }
    );
  }
}
