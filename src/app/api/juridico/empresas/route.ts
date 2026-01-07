import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codigo = searchParams.get('codigo');
    const includeAssinantes = searchParams.get('include_assinantes') === 'true';

    let query = supabase.from('empresas').select('*').eq('ativo', true);

    if (codigo) {
      query = query.eq('codigo', codigo);
    }

    if (includeAssinantes) {
      query = query.select(`
        *,
        assinantes (*)
      `);
    }

    const { data, error } = await query.order('nome_fantasia');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    console.error('Error fetching empresas:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar empresas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const empresa = await req.json();

    const { data, error } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error creating empresa:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar empresa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updates } = await req.json();

    const { data, error } = await supabase
      .from('empresas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error updating empresa:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar empresa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
