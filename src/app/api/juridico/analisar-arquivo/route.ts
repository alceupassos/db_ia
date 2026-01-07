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

const CATEGORIAS = [
  'Contrato',
  'Procuração',
  'Parecer',
  'Petição',
  'Acordo',
  'Notificação',
  'Certidão',
  'Outros'
];

export async function POST(req: NextRequest) {
  try {
    const { arquivoId, arquivoNome, storageUrl, mimeType } = await req.json();

    if (!arquivoId || !arquivoNome) {
      return NextResponse.json(
        { error: 'Arquivo ID e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Prompt para categorização e descrição
    const prompt = `Você é um assistente jurídico especializado. Analise o seguinte documento jurídico e forneça:

1. CATEGORIA: Classifique o documento em UMA das seguintes categorias (apenas o nome da categoria):
   - Contrato: Contratos de prestação de serviços, compra/venda, locação, etc.
   - Procuração: Procurações, mandatos e instrumentos de representação
   - Parecer: Pareceres jurídicos, técnicos ou consultivos
   - Petição: Petições, peças processuais e documentos judiciais
   - Acordo: Acordos, termos de compromisso, transações
   - Notificação: Notificações extrajudiciais, notificações formais
   - Certidão: Certidões, documentos oficiais e comprovantes
   - Outros: Documentos que não se enquadram nas categorias acima

2. DESCRIÇÃO: Crie uma descrição concisa (2-4 frases) do documento explicando:
   - O tipo de documento
   - Seu propósito principal
   - Informações relevantes identificadas no nome
   - Contexto jurídico aplicável

Nome do documento: ${arquivoNome}
Tipo de arquivo: ${mimeType || 'Não especificado'}
URL: ${storageUrl || 'Não disponível'}

Responda APENAS no seguinte formato JSON (sem markdown, sem texto adicional):
{
  "categoria": "NomeDaCategoria",
  "descricao": "Descrição do documento em 2-4 frases"
}`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.3,
    });

    // Parse do JSON retornado pela IA
    let categoria = 'Outros';
    let descricao = 'Documento jurídico não categorizado.';

    try {
      // Remove markdown code blocks se houver
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      if (parsed.categoria && CATEGORIAS.includes(parsed.categoria)) {
        categoria = parsed.categoria;
      }
      if (parsed.descricao && typeof parsed.descricao === 'string') {
        descricao = parsed.descricao.trim();
      }
    } catch (parseError) {
      // Se falhar o parse, tenta extrair categoria do texto
      console.warn('Erro ao fazer parse do JSON da IA:', parseError);
      const categoriaMatch = text.match(/["']categoria["']\s*:\s*["']([^"']+)["']/i) || 
                            text.match(/categoria["']?\s*:\s*["']?([^"',\n}]+)/i);
      const descricaoMatch = text.match(/["']descricao["']\s*:\s*["']([^"']+)["']/i) ||
                            text.match(/descricao["']?\s*:\s*["']?([^"',\n}]+)/i);
      
      if (categoriaMatch && CATEGORIAS.includes(categoriaMatch[1].trim())) {
        categoria = categoriaMatch[1].trim();
      }
      if (descricaoMatch) {
        descricao = descricaoMatch[1].trim();
      }
    }

    // Atualiza o arquivo com categoria e descrição
    const { error: updateError } = await supabase
      .from('arquivos_demanda')
      .update({
        categoria,
        descricao_ia: descricao
      })
      .eq('id', arquivoId);

    if (updateError) {
      console.error('Erro ao atualizar arquivo:', updateError);
      return NextResponse.json(
        { error: 'Erro ao salvar categoria e descrição' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      categoria,
      descricao
    });
  } catch (error: unknown) {
    console.error('Erro ao analisar arquivo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao analisar arquivo' },
      { status: 500 }
    );
  }
}
