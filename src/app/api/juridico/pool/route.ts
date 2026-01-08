import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar arquivos do pool
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');

    let query = supabase
      .from('arquivos_pool')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (categoria && categoria !== 'all') {
      query = query.or(`categoria.eq.${categoria},categoria_usuario.eq.${categoria}`);
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,descricao_ia.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      // Se a tabela não existe, retornar array vazio
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Tabela arquivos_pool não encontrada. Execute a migration 014_arquivos_pool.sql');
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    console.error('Erro ao listar arquivos do pool:', error);
    // Retornar array vazio em caso de erro para não quebrar a UI
    return NextResponse.json([]);
  }
}

// PUT - Atualizar arquivo do pool
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('arquivos_pool')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erro ao atualizar arquivo do pool:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar arquivo' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar arquivo do pool
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar arquivo para pegar o path
    const { data: arquivo, error: fetchError } = await supabase
      .from('arquivos_pool')
      .select('supabase_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Deletar do storage se existir
    if (arquivo?.supabase_path) {
      await supabase
        .storage
        .from('arquivos-juridico')
        .remove([arquivo.supabase_path]);
    }

    // Deletar do banco
    const { error } = await supabase
      .from('arquivos_pool')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erro ao deletar arquivo do pool:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao deletar arquivo' },
      { status: 500 }
    );
  }
}
