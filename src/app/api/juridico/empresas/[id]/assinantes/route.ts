import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('assinantes')
      .select('*')
      .eq('empresa_id', id)
      .eq('ativo', true)
      .order('ordem_assinatura, nome_completo');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    console.error('Error fetching assinantes:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar assinantes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assinante = await req.json();

    const { data, error } = await supabase
      .from('assinantes')
      .insert({
        ...assinante,
        empresa_id: id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error creating assinante:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar assinante';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
