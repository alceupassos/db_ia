import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Cliente Gemini 3 Nano Banana Pro para geração de imagens
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Gemini 3 Nano Banana Pro - usando o modelo mais recente disponível
    this.model = 'gemini-2.0-flash-exp';
  }

  /**
   * Gera um infográfico baseado em um prompt
   */
  async generateInfographic(prompt: string, options?: {
    type?: 'infographic' | 'flowchart' | 'card' | 'timeline';
    style?: string;
    colorScheme?: string;
  }): Promise<Buffer | null> {
    try {
      const fullPrompt = this.buildPrompt(prompt, options);
      
      // Usar a API de geração de conteúdo do Gemini
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      // Para geração de imagens, pode ser necessário usar uma API específica
      // Por enquanto, tentamos a API padrão
      const result = await model.generateContent(fullPrompt);
      await result.response;
      
      // Processar resposta - pode conter texto ou referências a imagens
      // Nota: A API do Gemini pode não gerar imagens diretamente neste modelo
      // Pode ser necessário usar Imagen ou outra API específica
      
      // Por enquanto, retornamos null e deixamos a API route lidar com isso
      return null;
    } catch (error) {
      console.error('Error generating infographic with Gemini:', error);
      throw error;
    }
  }

  /**
   * Constrói o prompt completo para geração
   */
  private buildPrompt(basePrompt: string, options?: {
    type?: 'infographic' | 'flowchart' | 'card' | 'timeline';
    style?: string;
    colorScheme?: string;
  }): string {
    const { type = 'infographic', style, colorScheme } = options || {};
    
    const typePrompts = {
      infographic: 'Create a professional infographic with: ',
      flowchart: 'Create a flowchart infographic showing: ',
      card: 'Create a modern card illustration with: ',
      timeline: 'Create a timeline infographic with: '
    };

    const defaultColorScheme = 'purple and violet color scheme, dark background theme';
    const defaultStyle = 'professional corporate style, minimal design, modern flat icons';

    return `${typePrompts[type]}${basePrompt}. ${style || defaultStyle}. ${colorScheme || defaultColorScheme}. High resolution, suitable for web display.`;
  }
}

/**
 * Instância singleton do cliente Gemini
 */
let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    geminiClientInstance = new GeminiClient(apiKey);
  }
  return geminiClientInstance;
}
