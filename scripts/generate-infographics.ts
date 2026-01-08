import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/como-usar');
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Garantir que o diretório existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('📁 Diretório criado:', OUTPUT_DIR);
}

interface InfographicConfig {
  filename: string;
  prompt: string;
  description: string;
  fallbackSVG: () => string;
}

// Configurações dos infográficos
const infographics: InfographicConfig[] = [
  {
    filename: 'step-1-access.svg',
    description: 'Navegação para templates jurídicos',
    prompt: `Create a professional SVG infographic showing a user navigating to a legal templates section. Show a sidebar navigation menu on the left with an arrow pointing to a templates folder/icon on the right. Use a dark theme with purple (#8B5CF6, #A78BFA) and dark backgrounds (#0D0A14, #1a1625). Include minimal, clean design with modern UI elements. Output ONLY the raw SVG code, no markdown, no explanations.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1625;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d0a14;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg1)"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Acessar Templates</text>
</svg>`
  },
  {
    filename: 'step-2-category.svg',
    description: 'Categorias de documentos jurídicos',
    prompt: `Create a professional SVG infographic showing different legal document categories organized as folders. Display folders for: Contracts, Powers of Attorney, NDAs, MOUs, Patents, Bids. Use a grid layout with purple accents (#8B5CF6, #A78BFA) and dark background (#0D0A14). Modern, clean design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Escolher Categoria</text>
</svg>`
  },
  {
    filename: 'step-3-company.svg',
    description: 'Seleção de empresas do grupo',
    prompt: `Create a professional SVG infographic showing three company selection cards for CEPALAB, SIBIONICS, and REALTRADE. One card should be highlighted/selected with a purple glow. Use dark theme with purple accents. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Selecionar Empresa</text>
</svg>`
  },
  {
    filename: 'step-4-customize.svg',
    description: 'Edição bilingue de campos',
    prompt: `Create a professional SVG infographic showing a bilingual text editing interface. Display two side-by-side panels (Portuguese PT-BR on left, English EN on right) with synchronized text fields. Show the connection between fields. Use dark theme with purple accents. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Personalizar Campos</text>
</svg>`
  },
  {
    filename: 'step-5-export.svg',
    description: 'Exportação e assinatura digital',
    prompt: `Create a professional SVG infographic showing document export and digital signature workflow. Show a document on the left with arrows pointing to two options: PDF export and digital signature with 2FA. Use dark theme with purple accents. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Exportar ou Assinar</text>
</svg>`
  },
  {
    filename: 'tip-filters.svg',
    description: 'Dica sobre filtros',
    prompt: `Create a professional SVG icon/illustration showing filtering functionality. Show filter lines or a filter icon with purple accents. Dark theme, minimal design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#2a1f3d" rx="12"/>
  <text x="200" y="150" font-family="Arial" font-size="18" fill="#8B5CF6" text-anchor="middle">Filtros</text>
</svg>`
  },
  {
    filename: 'tip-edit.svg',
    description: 'Dica sobre edição rápida',
    prompt: `Create a professional SVG icon showing quick editing with a pen/pencil icon. Use purple accents on dark background. Minimal, modern design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#2a1f3d" rx="12"/>
  <text x="200" y="150" font-family="Arial" font-size="18" fill="#8B5CF6" text-anchor="middle">Edição Rápida</text>
</svg>`
  },
  {
    filename: 'tip-batch.svg',
    description: 'Dica sobre lote',
    prompt: `Create a professional SVG icon showing batch processing with multiple stacked documents. Use purple accents on dark background. Minimal design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#2a1f3d" rx="12"/>
  <text x="200" y="150" font-family="Arial" font-size="18" fill="#8B5CF6" text-anchor="middle">Assinaturas em Lote</text>
</svg>`
  },
  {
    filename: 'signature-workflow.svg',
    description: 'Fluxograma de assinatura digital',
    prompt: `Create a professional SVG flowchart showing the digital signature workflow process: Create Document -> Send for Signature -> 2FA Verification -> Sign. Use boxes connected with arrows, purple accents (#8B5CF6, #A78BFA), dark background (#0D0A14). Modern, clean flowchart design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Processo de Assinatura Digital</text>
</svg>`
  },
  {
    filename: 'document-categories.svg',
    description: 'Sistema de categorização',
    prompt: `Create a professional SVG tree diagram or hierarchical structure showing document categorization system. Show main categories branching into subcategories. Use purple accents, dark background. Clean, modern design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0d0a14"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Categorização de Documentos</text>
</svg>`
  },
  {
    filename: 'signatures-manual.svg',
    description: 'Guia de assinatura manual',
    prompt: `Create a professional SVG infographic showing a manual signature process on a digital tablet. Show a hand holding a stylus signing a document. Use purple gradients (#8B5CF6, #7c3aed) and a dark background (#0D0A14). Modern glassmorphism style. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#0D0A14"/><text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Assinatura Manual</text></svg>`
  },
  {
    filename: 'report-export.svg',
    description: 'Exportação de relatórios financeiros',
    prompt: `Create a professional SVG infographic showing a financial report being exported to Excel and PDF. Show charts and spreadsheets with arrows pointing to download icons. Use purple accents, dark background, clean lines. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#0D0A14"/><text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Exportação de Relatórios</text></svg>`
  },
  {
    filename: 'multi-company-view.svg',
    description: 'Gestão multi-empresas',
    prompt: `Create a professional SVG infographic showing a dashboard with multiple company logos (CEPALAB, SIBIONICS, REALTRADE) in a grid view. Use purple highlight around the active company. Dark theme, modern UI components. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#0D0A14"/><text x="400" y="300" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">Multi-Empresas</text></svg>`
  },
  {
    filename: 'notification-alert.svg',
    description: 'Sistema de notificações e alertas',
    prompt: `Create a professional SVG icon/illustration showing a bell icon with a purple glow and notification badges. Show an overlay panel with signature alerts. Use purple accents (#8B5CF6), dark background. Minimal design. Output ONLY the raw SVG code.`,
    fallbackSVG: () => `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#0D0A14" rx="12"/><text x="200" y="150" font-family="Arial" font-size="18" fill="#8B5CF6" text-anchor="middle">Notificações</text></svg>`
  }
];

// Função para extrair SVG da resposta do Gemini
function extractSVGFromResponse(text: string): string {
  // Tentar encontrar código SVG na resposta
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  }

  // Se tiver markdown code block, extrair
  const codeBlockMatch = text.match(/```(?:svg|xml)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.includes('<svg')) {
      const svgInContent = content.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgInContent) return svgInContent[0];
      return content;
    }
  }

  // Se a resposta inteira parece ser SVG
  if (text.trim().startsWith('<svg') || text.trim().startsWith('<?xml')) {
    return text.trim();
  }

  return '';
}

// Função para gerar SVG com Gemini AI
async function generateSVGWithAI(prompt: string, config: InfographicConfig): Promise<string | null> {
  if (!API_KEY) {
    console.log('⚠️  GEMINI_API_KEY não encontrada. Usando fallback.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usar o modelo mais recente disponível
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const fullPrompt = `${prompt}

IMPORTANT: Return ONLY the SVG code, no explanations, no markdown formatting, just the raw SVG XML.`;

    console.log(`🤖 Gerando ${config.filename} com Gemini 3.0 Nano Banana Pro...`);

    let attempts = 0;
    const maxAttempts = 5; // Mais tentativas devido ao rate limit agressivo

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        const svgCode = extractSVGFromResponse(text);

        if (svgCode && svgCode.length > 50) {
          console.log(`✅ SVG gerado com sucesso (${svgCode.length} caracteres)`);
          return svgCode;
        } else {
          console.log('⚠️  Resposta da IA não contém SVG válido. Usando fallback.');
          return null;
        }
      } catch (err: unknown) {
        attempts++;
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Verificar se é rate limit (429)
        if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
          console.log(`⏳ Rate limit atingido (Tentativa ${attempts}/${maxAttempts}). Aguardando 45s...`);
          await new Promise(resolve => setTimeout(resolve, 45000)); // Esperar 45 segundos
          continue;
        }

        throw err;
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ Erro ao gerar com IA:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// Verificar se deve forçar regeneração
const FORCE_REGENERATE = process.argv.includes('--force') || process.argv.includes('-f');

// Função principal

// Função principal (modificada para suportar --force)
async function generateInfographics() {
  console.log('🎨 Iniciando geração de infográficos com Gemini 3.0 Nano Banana Pro...\n');

  if (FORCE_REGENERATE) {
    console.log('🔄 Modo FORÇA ativado: Regenerando todas as imagens com IA.\n');
  }

  if (!API_KEY) {
    console.log('⚠️  AVISO: GEMINI_API_KEY não configurada.');
    console.log('   Usando GOOGLE_API_KEY como alternativa.\n');
  }

  let created = 0;
  let skipped = 0;
  let aiGenerated = 0;
  let fallbackUsed = 0;
  let regenerated = 0;

  for (const infographic of infographics) {
    const filePath = path.join(OUTPUT_DIR, infographic.filename);
    const exists = fs.existsSync(filePath);

    if (exists && !FORCE_REGENERATE) {
      console.log(`⏭️  ${infographic.filename} - Já existe, pulando...`);
      skipped++;
      continue;
    }

    if (exists && FORCE_REGENERATE) {
      console.log(`🔄 ${infographic.filename} - Regenerando com IA...`);
    }

    try {
      // Tentar gerar com IA primeiro
      let svgContent: string | null = null;

      if (API_KEY) {
        svgContent = await generateSVGWithAI(infographic.prompt, infographic);
        if (svgContent) {
          aiGenerated++;
          if (exists) regenerated++;
        }
      }

      // Se IA não funcionou, usar fallback
      if (!svgContent) {
        svgContent = infographic.fallbackSVG();
        fallbackUsed++;
      }

      // Salvar arquivo
      fs.writeFileSync(filePath, svgContent, 'utf-8');
      console.log(`✅ ${infographic.filename} - ${exists ? 'Regenerado' : 'Criado'} com sucesso`);
      console.log(`   ${infographic.description}`);
      created++;

      // Pequeno delay para não exceder rate limits
      if (API_KEY && aiGenerated > 0) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${infographic.filename}:`, error);
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Criados/Regenerados: ${created}`);
  console.log(`   ⏭️  Pulados (já existem): ${skipped}`);
  console.log(`   🤖 Gerados com IA: ${aiGenerated}`);
  console.log(`   🔄 Regenerados: ${regenerated}`);
  console.log(`   📝 Usando fallback: ${fallbackUsed}`);
  console.log(`   📁 Total: ${infographics.length}`);
}

// Função para gerar HTML de preview
function generatePreviewHTML() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Infográficos Gemini 3.0 Pro Preview</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0D0A14; color: #fff; padding: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .card { background: #1a1625; border-radius: 12px; padding: 1rem; border: 1px solid #2a1f3d; }
    .card h3 { margin-top: 0; color: #A78BFA; font-size: 0.9rem; }
    .card p { color: #888; font-size: 0.8rem; margin-bottom: 1rem; }
    .preview { background: #0D0A14; border-radius: 8px; overflow: hidden; padding: 1rem; display: flex; align-items: center; justify-content: center; }
    img { max-width: 100%; height: auto; }
    .header { margin-bottom: 2rem; border-bottom: 1px solid #2a1f3d; padding-bottom: 1rem; }
    .badge { background: #7c3aed; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
      <h1>Infográficos Gerados</h1>
      <span class="badge">Gemini 3.0 Pro</span>
    </div>
    <p>Galeria de assets SVG gerados via IA</p>
  </div>
  
  <div class="grid">
    ${infographics.map(info => `
      <div class="card">
        <h3>${info.filename}</h3>
        <p>${info.description}</p>
        <div class="preview">
          <img src="./${info.filename}" alt="${info.description}">
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  const previewPath = path.join(OUTPUT_DIR, 'index.html');
  fs.writeFileSync(previewPath, htmlContent, 'utf-8');
  console.log(`\n✨ Preview HTML gerado em: ${previewPath}`);
}

// Executar
generateInfographics()
  .then(() => {
    generatePreviewHTML();
  })
  .catch(console.error);
