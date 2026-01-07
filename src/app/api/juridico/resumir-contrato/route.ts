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
    const { arquivoId, arquivoNome, googleDriveUrl } = await req.json();

    if (!arquivoId || !arquivoNome) {
      return NextResponse.json(
        { error: 'Arquivo ID e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o conteúdo do arquivo (se estiver no Google Drive, pode precisar de download)
    // Por enquanto, vamos criar um resumo baseado no nome e contexto
    // Em produção, você pode usar a API do Google Drive para extrair texto
    
    const prompt = `Você é um assistente jurídico especializado. Analise o seguinte documento e crie um resumo estruturado.

Nome do documento: ${arquivoNome}
URL: ${googleDriveUrl || 'Não disponível'}

Por favor, forneça:
1. Um resumo executivo do documento (2-3 parágrafos)
2. Pontos principais identificados (lista com 5-10 itens)
3. Cláusulas importantes ou termos relevantes
4. Sugestões de próximos passos ou ações recomendadas

Se não houver acesso ao conteúdo completo, forneça um resumo baseado no nome do documento e contexto jurídico típico.`;

    const { text: resumo } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.3,
    });

    // Salva o resumo no banco
    const { data: resumoData, error: dbError } = await supabase
      .from('resumos_contratos')
      .insert({
        arquivo_id: arquivoId,
        resumo: resumo,
        pontos_principais: extractPoints(resumo),
        clausulas_importantes: [],
        sugestoes_proximos_passos: []
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar resumo:', dbError);
    }

    // Atualiza o arquivo com o resumo
    await supabase
      .from('arquivos_demanda')
      .update({ resumo_ia: resumo })
      .eq('id', arquivoId);

    return NextResponse.json({
      resumo,
      resumoId: resumoData?.id
    });
  } catch (error: unknown) {
    console.error('Erro ao gerar resumo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar resumo' },
      { status: 500 }
    );
  }
}

function extractPoints(text: string): string[] {
  // Extrai pontos principais do texto (busca por listas numeradas ou com bullets)
  const lines = text.split('\n');
  const points: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Busca por linhas que começam com número ou bullet
    if (/^\d+\.\s/.test(trimmed) || /^[-•]\s/.test(trimmed) || /^-\s/.test(trimmed)) {
      points.push(trimmed.replace(/^\d+\.\s/, '').replace(/^[-•]\s/, '').replace(/^-\s/, ''));
    }
  }
  
  return points.slice(0, 10); // Limita a 10 pontos
}
