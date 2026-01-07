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

const SYSTEM_PROMPT = `Você é a Cepalab IA, assistente jurídica inteligente especializada em análise de documentos.

Você está analisando um arquivo/documento específico. Use o contexto fornecido para responder às perguntas do usuário sobre este documento.

CAPACIDADES:
- Resumir o conteúdo do documento
- Identificar pontos principais e cláusulas importantes
- Detectar riscos, problemas ou inconsistências
- Extrair datas, valores e informações relevantes
- Explicar termos jurídicos de forma acessível
- Sugerir melhorias ou pontos de atenção

RESTRIÇÕES:
- Baseie suas respostas apenas no conteúdo do documento fornecido
- Se não tiver informação suficiente, indique claramente
- Não invente informações que não estão no documento
- Recomende consulta a advogado para decisões importantes`;

export async function POST(req: NextRequest) {
  try {
    const { message, arquivoId, arquivoNome, resumoIA, googleDriveId } = await req.json();

    if (!message || !arquivoId) {
      return NextResponse.json(
        { error: 'Mensagem e ID do arquivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar informações adicionais do arquivo se necessário
    let contexto = '';

    if (resumoIA) {
      contexto += `\n\nRESUMO DO DOCUMENTO (gerado anteriormente pela IA):\n${resumoIA}`;
    }

    // Buscar resumo de contrato se existir
    const { data: resumoContrato } = await supabase
      .from('resumos_contratos')
      .select('resumo, pontos_principais, clausulas_importantes')
      .eq('arquivo_id', arquivoId)
      .single();

    if (resumoContrato) {
      contexto += `\n\nRESUMO DETALHADO DO CONTRATO:\n${resumoContrato.resumo}`;
      if (resumoContrato.pontos_principais) {
        contexto += `\n\nPONTOS PRINCIPAIS:\n${JSON.stringify(resumoContrato.pontos_principais, null, 2)}`;
      }
      if (resumoContrato.clausulas_importantes) {
        contexto += `\n\nCLÁUSULAS IMPORTANTES:\n${JSON.stringify(resumoContrato.clausulas_importantes, null, 2)}`;
      }
    }

    // Buscar demanda associada
    const { data: arquivo } = await supabase
      .from('arquivos_demanda')
      .select('demanda_id')
      .eq('id', arquivoId)
      .single();

    if (arquivo?.demanda_id) {
      const { data: demanda } = await supabase
        .from('demandas_juridicas')
        .select('demanda, cliente_nome, status, observacoes')
        .eq('id', arquivo.demanda_id)
        .single();

      if (demanda) {
        contexto += `\n\nCONTEXTO DA DEMANDA ASSOCIADA:`;
        contexto += `\nDemanda: ${demanda.demanda}`;
        contexto += `\nCliente: ${demanda.cliente_nome}`;
        contexto += `\nStatus: ${demanda.status}`;
        if (demanda.observacoes) {
          contexto += `\nObservações: ${demanda.observacoes}`;
        }
      }
    }

    const prompt = `${SYSTEM_PROMPT}

ARQUIVO SENDO ANALISADO:
Nome: ${arquivoNome}
ID: ${arquivoId}
${googleDriveId ? `Google Drive ID: ${googleDriveId}` : ''}
${contexto}

PERGUNTA DO USUÁRIO:
${message}

Responda de forma clara e útil, baseando-se no contexto fornecido sobre o documento.`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    console.error('Erro no chat de arquivo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar pergunta' },
      { status: 500 }
    );
  }
}
