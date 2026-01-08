import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
// import { getGeminiClient } from '@/lib/gemini'; // Not used

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Criar hash do prompt para usar como identificador de cache
function createPromptHash(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = 'infographic' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Verificar cache primeiro
    const promptHash = createPromptHash(prompt);
    const cachePath = `infographics/${promptHash}.png`;
    
    // Verificar se a pasta infographics existe, se não, criar
    try {
      await supabase
        .storage
        .from('arquivos-juridico')
        .list('infographics');
      
      // Se a pasta não existe, será criada automaticamente no primeiro upload
    } catch {
      // Ignorar erro se pasta não existir ainda
    }

    // Tentar baixar o arquivo do cache
    const { data: cachedFile, error: cacheError } = await supabase
      .storage
      .from('arquivos-juridico')
      .download(cachePath);

    // Se já existe no cache, retornar URL pública
    if (cachedFile && !cacheError) {
      const { data: urlData } = supabase
        .storage
        .from('arquivos-juridico')
        .getPublicUrl(cachePath);

      return NextResponse.json({
        url: urlData.publicUrl,
        cached: true
      });
    }

    // Gerar imagem usando Gemini 3 Nano Banana Pro
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Construir prompt completo baseado no tipo
    const fullPrompt = buildPrompt(prompt, type);

    try {
      // Usar o modelo de geração de imagens do Gemini
      // Nota: A API pode variar, mas geralmente é assim
      genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp' // ou o modelo apropriado para imagens
      });

      // Para geração de imagens, precisamos usar a API de imagem
      // Como o Gemini pode não ter geração direta de imagens, vamos usar uma abordagem alternativa
      // Ou podemos usar Imagen API se disponível
      
      // Por enquanto, vamos simular ou usar uma API alternativa
      // Verificar se há uma API específica para Nano Banana Pro
      
      // TODO: Implementar chamada real à API de geração de imagens do Gemini
      // Por enquanto, retornar uma URL placeholder ou usar serviço externo
      
      // Alternativa: usar fetch direto para a API do Gemini se disponível
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Processar resposta da API do Gemini
      // Nota: A estrutura da resposta pode variar dependendo da API
      // Para Gemini 3 Nano Banana Pro, verificar documentação oficial
      
      // Por enquanto, vamos implementar um sistema que funciona com a estrutura esperada
      // Quando a API real estiver disponível, apenas ajustar o processamento abaixo
      
      let imageData: Buffer | null = null;
      
      // Tentar extrair imagem da resposta
      // Formato esperado pode ser base64 ou URL
      if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        // Imagem em base64
        const base64Data = data.candidates[0].content.parts[0].inlineData.data;
        imageData = Buffer.from(base64Data, 'base64');
      } else if (data.imageUrl) {
        // URL da imagem gerada
        const imageResponse = await fetch(data.imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageData = Buffer.from(arrayBuffer);
      }

      // Se conseguimos gerar a imagem, salvar no cache
      if (imageData) {
        const { error: uploadError } = await supabase
          .storage
          .from('arquivos-juridico')
          .upload(cachePath, imageData, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError) {
          const { data: urlData } = supabase
            .storage
            .from('arquivos-juridico')
            .getPublicUrl(cachePath);

          return NextResponse.json({
            url: urlData.publicUrl,
            cached: false
          });
        }
      }

      // Se chegou aqui, a API ainda não retornou formato esperado
      // Retornar informação de que precisa implementar o formato específico
      return NextResponse.json({
        url: null,
        cached: false,
        error: 'Image generation response format not yet implemented. Please check Gemini 3 Nano Banana Pro API documentation.',
        debug: 'Response structure may vary. Check data structure from Gemini API.'
      }, { status: 501 });

    } catch (apiError: unknown) {
      console.error('Gemini API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate image',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error in generate-image route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildPrompt(basePrompt: string, type: string): string {
  const stylePrompts = {
    infographic: 'Create a professional infographic with: ',
    flowchart: 'Create a flowchart infographic showing: ',
    card: 'Create a modern card illustration with: ',
    timeline: 'Create a timeline infographic with: '
  };

  const colorScheme = 'purple and violet color scheme, dark background theme';
  const style = 'professional corporate style, minimal design, modern flat icons';

  return `${stylePrompts[type as keyof typeof stylePrompts] || stylePrompts.infographic}${basePrompt}. ${style}. ${colorScheme}. High resolution, suitable for web display.`;
}
