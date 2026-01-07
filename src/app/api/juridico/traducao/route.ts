import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { text, targetLanguage = 'en', sourceLanguage = 'pt-BR' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto e obrigatorio' }, { status: 400 });
    }

    // Verificar cache
    const cacheKey = `traducao:${sourceLanguage}:${targetLanguage}:${Buffer.from(text).toString('base64').slice(0, 50)}`;
    
    // Gerar traducao com contexto juridico
    const { text: translatedText } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Você é um tradutor jurídico especializado em documentos legais brasileiros e internacionais. 
      
Traduza o seguinte texto do ${sourceLanguage} para ${targetLanguage}, mantendo:
- Terminologia jurídica precisa
- Formatação original (parágrafos, listas, etc)
- Tom formal e profissional
- Referências a leis e órgãos reguladores devem ser mantidas quando apropriado

Texto a traduzir:

${text}

Tradução:`,
      temperature: 0.3,
    });

    // Salvar no cache (opcional - implementar tabela de cache se necessário)
    
    return NextResponse.json({
      original: text,
      translated: translatedText,
      sourceLanguage,
      targetLanguage,
    });
  } catch (error: unknown) {
    console.error('Error translating:', error);
    const message = error instanceof Error ? error.message : 'Erro ao traduzir';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
