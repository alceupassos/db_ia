import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { query, demandaId } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    // Busca arquivos relacionados
    let arquivosQuery = supabase
      .from('arquivos_demanda')
      .select('*, resumos_contratos(*)');

    if (demandaId) {
      arquivosQuery = arquivosQuery.eq('demanda_id', demandaId);
    }

    const { data: arquivos, error } = await arquivosQuery;

    if (error) throw error;

    if (!arquivos || arquivos.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'Nenhum arquivo encontrado'
      });
    }

    // Usa IA para fazer busca semântica
    interface ArquivoItem {
      nome: string;
      resumo_ia?: string | null;
      resumos_contratos?: Array<{ resumo: string }>;
    }
    const context = arquivos.map((arquivo: ArquivoItem) => ({
      nome: arquivo.nome,
      resumo: arquivo.resumo_ia || arquivo.resumos_contratos?.[0]?.resumo || 'Sem resumo disponível'
    })).join('\n\n');

    const prompt = `Você é um assistente de busca semântica para documentos jurídicos.

Contexto dos documentos disponíveis:
${context}

Query do usuário: "${query}"

Analise o contexto e retorne um JSON com um array de documentos relevantes, ordenados por relevância. Cada item deve ter:
- nome: nome do documento
- relevancia: score de 0 a 1
- razao: breve explicação de por que é relevante

Retorne APENAS o JSON, sem markdown ou explicações adicionais.`;

    const { text: aiResponse } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.2,
    });

    // Parse da resposta da IA
    interface SearchResult {
      nome: string;
      relevancia: number;
      razao: string;
    }
    let results: SearchResult[] = [];
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResponse) as SearchResult[] | { results: SearchResult[] };
      results = Array.isArray(parsed) ? parsed : parsed.results || [];
    } catch {
      // Fallback: busca simples por palavras-chave
      results = arquivos
        .filter((arquivo: ArquivoItem) => {
          const searchableText = `${arquivo.nome} ${arquivo.resumo_ia || ''}`.toLowerCase();
          return query.toLowerCase().split(' ').some((word: string) => searchableText.includes(word));
        })
        .map((arquivo: ArquivoItem) => ({
          nome: arquivo.nome,
          relevancia: 0.7,
          razao: 'Correspondência de palavras-chave'
        }));
    }

    return NextResponse.json({
      results,
      total: results.length
    });
  } catch (error: unknown) {
    console.error('Erro na busca semântica:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro na busca semântica' },
      { status: 500 }
    );
  }
}
