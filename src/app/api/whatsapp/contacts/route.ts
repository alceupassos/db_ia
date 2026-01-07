import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo');
    const empresaId = searchParams.get('empresa_id');

    let query = supabase.from('whatsapp_contacts').select('*').eq('ativo', true);

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query.order('nome');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Erro ao buscar contatos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contact = await req.json();

    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error creating contact:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar contato';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updates } = await req.json();

    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error updating contact:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar contato';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID e obrigatorio' }, { status: 400 });
    }

    const { error } = await supabase
      .from('whatsapp_contacts')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting contact:', error);
    const message = error instanceof Error ? error.message : 'Erro ao deletar contato';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
