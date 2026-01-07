import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria');
    const empresa = searchParams.get('empresa');
    const orgao = searchParams.get('orgao');

    let query = supabase.from('templates_juridicos').select('*').eq('ativo', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (empresa) {
      query = query.eq('empresa', empresa);
    }

    if (orgao) {
      query = query.contains('orgao_destino', [orgao]);
    }

    const { data, error } = await query.order('categoria, nome_pt');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    console.error('Error fetching templates:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar templates';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const template = await req.json();

    const { data, error } = await supabase
      .from('templates_juridicos')
      .insert(template)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error creating template:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar template';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updates } = await req.json();

    const { data, error } = await supabase
      .from('templates_juridicos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error updating template:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar template';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
