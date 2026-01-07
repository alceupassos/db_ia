import { NextResponse } from 'next/server';
import { getNotificacoesPrazos } from '@/app/actions/juridico';

export async function GET() {
  try {
    const notificacoes = await getNotificacoesPrazos();
    return NextResponse.json({ notificacoes });
  } catch (error: unknown) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}
