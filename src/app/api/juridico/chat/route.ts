import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Você é a Cepalab IA, assistente jurídica inteligente da Cepalab.

IDENTIDADE:
- Especialista em direito empresarial e contratos
- Conhecimento profundo sobre Cepalab e Sibionics
- Tom profissional mas acessível

CAPACIDADES:
- Resumir contratos e documentos jurídicos
- Analisar cláusulas e identificar riscos
- Ajudar a redigir textos jurídicos
- Responder dúvidas sobre demandas cadastradas
- Consultar arquivos e cadastros do sistema
- Informar sobre datas de pagamentos e prazos

RESTRIÇÕES:
- Falar APENAS sobre assuntos relacionados a Cepalab, Sibionics e questões jurídicas
- Não fornecer aconselhamento jurídico definitivo
- Recomendar consulta a advogado para decisões importantes

Use o contexto fornecido sobre demandas, arquivos e resumos para responder às perguntas do usuário de forma precisa e útil.`;

export async function POST(req: NextRequest) {
  try {
    const { message, messageHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar contexto relevante das demandas
    const { data: demandas } = await supabase
      .from('demandas_juridicas')
      .select('id, demanda, cliente_nome, status, data_solicitacao, data_pagamento, data_fim_contrato, data_entrega, observacoes')
      .limit(20);

    // Buscar arquivos recentes
    const { data: arquivos } = await supabase
      .from('arquivos_demanda')
      .select('id, nome, demanda_id, resumo_ia')
      .order('created_at', { ascending: false })
      .limit(10);

    // Buscar resumos de contratos
    const { data: resumos } = await supabase
      .from('resumos_contratos')
      .select('id, resumo, pontos_principais, arquivo_id')
      .order('created_at', { ascending: false })
      .limit(10);

    // Construir contexto
    let contexto = '';

    if (demandas && demandas.length > 0) {
      contexto += '\n\nDEMANDAS JURÍDICAS CADASTRADAS:\n';
      demandas.forEach((d) => {
        contexto += `- ID: ${d.id}\n`;
        contexto += `  Demanda: ${d.demanda}\n`;
        contexto += `  Cliente: ${d.cliente_nome}\n`;
        contexto += `  Status: ${d.status}\n`;
        if (d.data_solicitacao) contexto += `  Data Solicitação: ${new Date(d.data_solicitacao).toLocaleDateString('pt-BR')}\n`;
        if (d.data_pagamento) contexto += `  Data Pagamento: ${new Date(d.data_pagamento).toLocaleDateString('pt-BR')}\n`;
        if (d.data_fim_contrato) contexto += `  Data Fim Contrato: ${new Date(d.data_fim_contrato).toLocaleDateString('pt-BR')}\n`;
        if (d.data_entrega) contexto += `  Data Entrega: ${new Date(d.data_entrega).toLocaleDateString('pt-BR')}\n`;
        if (d.observacoes) contexto += `  Observações: ${d.observacoes.substring(0, 200)}...\n`;
        contexto += '\n';
      });
    }

    if (arquivos && arquivos.length > 0) {
      contexto += '\n\nARQUIVOS VINCULADOS:\n';
      arquivos.forEach((a) => {
        contexto += `- Nome: ${a.nome}\n`;
        contexto += `  ID: ${a.id}\n`;
        if (a.resumo_ia) {
          contexto += `  Resumo IA: ${a.resumo_ia.substring(0, 300)}...\n`;
        }
        contexto += '\n';
      });
    }

    if (resumos && resumos.length > 0) {
      contexto += '\n\nRESUMOS DE CONTRATOS:\n';
      resumos.forEach((r) => {
        contexto += `- Resumo: ${r.resumo.substring(0, 400)}...\n`;
        if (r.pontos_principais) {
          contexto += `  Pontos Principais: ${JSON.stringify(r.pontos_principais)}\n`;
        }
        contexto += '\n';
      });
    }

    // Construir histórico de mensagens
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT + contexto },
      ...messageHistory.slice(-10), // Últimas 10 mensagens
      { role: 'user' as const, content: message }
    ];

    // Gerar resposta com streaming
    const result = await streamText({
      model: openai('gpt-5.1'),
      messages,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error('Erro no chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao processar mensagem' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
