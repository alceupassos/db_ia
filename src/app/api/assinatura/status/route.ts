import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentoId = searchParams.get('documento_id');

    if (!documentoId) {
      return NextResponse.json({ error: 'documento_id e obrigatorio' }, { status: 400 });
    }

    const { data: documento, error: docError } = await supabase
      .from('documentos_assinatura')
      .select('*')
      .eq('id', documentoId)
      .single();

    if (docError) throw docError;

    const { data: assinaturas, error: assError } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('documento_id', documentoId)
      .order('created_at');

    if (assError) throw assError;

    // Calcular status geral
    const todasAssinadas = assinaturas?.every(a => a.assinado_em) || false;
    const statusFinal = todasAssinadas ? 'assinado' : documento.status;

    return NextResponse.json({
      documento,
      assinaturas: assinaturas || [],
      status: statusFinal,
      progresso: {
        total: assinaturas?.length || 0,
        assinadas: assinaturas?.filter((a: { assinado_em: string | null }) => a.assinado_em).length || 0,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching status:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
