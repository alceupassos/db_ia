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

    // Prompt para categorização e resumo descritivo
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

2. DESCRIÇÃO: Crie um resumo descritivo do documento (3-5 frases) explicando:
   - O que é o documento (tipo e natureza)
   - Qual o seu propósito e objetivo principal
   - Informações relevantes extraídas do nome do arquivo (datas, partes envolvidas, assunto, etc.)
   - Contexto jurídico e importância do documento
   - Se possível, mencione elementos chave que possam ser identificados pelo nome

Nome do documento: ${arquivoNome}
Tipo de arquivo: ${mimeType || 'Não especificado'}
URL: ${storageUrl || 'Não disponível'}

Analise cuidadosamente o nome do arquivo para extrair informações como:
- Datas (se houver no nome)
- Partes envolvidas (empresas, pessoas, órgãos)
- Tipo específico de documento
- Assunto ou tema principal
- Número de processo ou protocolo (se houver)

Responda APENAS no seguinte formato JSON (sem markdown, sem texto adicional):
{
  "categoria": "NomeDaCategoria",
  "descricao": "Resumo descritivo do documento em 3-5 frases, incluindo informações extraídas do nome"
}`;

    const { text } = await generateText({
      model: openai('gpt-5.1'),
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
