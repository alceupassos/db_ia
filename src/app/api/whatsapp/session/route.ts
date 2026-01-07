import { NextResponse } from 'next/server';

const WPPCONNECT_URL = process.env.WPPCONNECT_URL || 'http://localhost:21465';
const WPPCONNECT_SECRET_KEY = process.env.WPPCONNECT_SECRET_KEY || '';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionName = searchParams.get('session') || 'default';

    const response = await fetch(`${WPPCONNECT_URL}/api/${sessionName}/check-connection-session`, {
      headers: {
        'apikey': WPPCONNECT_SECRET_KEY,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ error: 'Erro ao verificar sessao' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sessionName, start } = await req.json();

    if (start) {
      // Iniciar sessao
      const response = await fetch(`${WPPCONNECT_URL}/api/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': WPPCONNECT_SECRET_KEY,
        },
        body: JSON.stringify({
          session: sessionName || 'default',
          waitQrCode: true,
        }),
      });

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Parar sessao
      const response = await fetch(`${WPPCONNECT_URL}/api/${sessionName}/close-session`, {
        method: 'DELETE',
        headers: {
          'apikey': WPPCONNECT_SECRET_KEY,
        },
      });

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error managing session:', error);
    return NextResponse.json({ error: 'Erro ao gerenciar sessao' }, { status: 500 });
  }
}
