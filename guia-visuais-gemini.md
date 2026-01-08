# 🎨 Guia de Geração de Visuais - Gemini 3.0 Nano Banana Pro

Este guia contém os prompts otimizados para substituir os SVGs básicos por imagens de alta fidelidade (PNG/JPG) geradas pela IA.

## Identidade Visual Sugerida

**Estilo:** "Executive Deep Purple Glassmorphism"
**Cores:** Fundo ultra-escuro (#0D0A14), detalhes em Roxo Neon (#8B5CF6), texturas de vidro translúcido, iluminação volumétrica.

***

## 🔝 Destaques (Hero & Overview)

### A. Imagem Hero Principal (`como-usar-hero.png`)

Esta imagem representa a área Jurídica e as duas empresas do grupo (CEPALAB e SIBIONICS) com o mesmo estilo de cristal roxo.

> **Prompt:** `Ultimate high-fidelity 3D cinematic Hero banner for a premium legal-tech platform. Centerpiece: A majestic "Scales of Justice" (balança jurídica) sculpted from translucent glowing purple crystal glass. Floating symmetrically on each side are two elegant 3D holographic logos encased in spherical glass bubbles: 1) A logo inspired by "CEPALAB" (abstract elliptical orbits/loops) and 2) A logo inspired by "SIBIONICS" (circular leaf with neural circuitry/tech patterns). Everything follows the "Deep Purple Glassmorphism" aesthetic: Pitch-black #0D0A14 backgrounds, intense #8B5CF6 neon glow accents, refractive glass textures with light-bending properties. Cinematic lighting, volumetric purple aura, dust particles in the air, 8k resolution, photorealistic render.`
> **Local p/ salvar:** `public/images/como-usar/como-usar-hero.png`

### B. Infográfico de Fluxo Completo (`overview-full.png`)

Resumo visual do processo completo, de ponta a ponta.

> **Prompt:** `Professional 3D isometric masterpiece showing a digital legal workflow. A sequence of floating glass panels interconnected by glowing neon purple energy lines. The flow starts with a dashboard icon and ends with a glowing digital signature seal. Minimalist design, dark scheme, high-end finishing, crisp purple #A78BFA lighting. 8k, Octane render style.`
> **Local p/ salvar:** `public/images/como-usar/overview-full.png`

***

## 📌 Prompts de Imagens Individuais (Passo-a-Passo)

### 1. Instruções para o Gemini

Copie e cole os prompts individuais abaixo na interface do Gemini 3.0 Nano Banana Pro. Peça para gerar em formato **16:9** ou **4:3**.

***

### 2. Biblioteca de Prompts

#### A. Acesso aos Templates (`step-1-access.png`)

> **Prompt:** `Create a photorealistic, high-fidelity 3D interface render of a professional legal dashboard in dark mode. Show a sleek sidebar navigation with a "Templates" icon highlighted with a glowing purple aura and glassmorphism effect. The background is a clean, dark corporate office environment with violet ambient lighting. 8k resolution, cinematic depth of field.`
> **Local p/ salvar:** `public/images/como-usar/step-1-access.png`

#### B. Organização e Categorias (`step-2-category.png`)

> **Prompt:** `3D visualization of floating digital documents gracefully organizing themselves into glowing purple glass folders. The folders have elegant labels: "Contratos", "Procurações". Dark void background with subtle purple mist. Scientific and clean aesthetic, sharp edges, premium lighting.`
> **Local p/ salvar:** `public/images/como-usar/step-2-category.png`

#### C. Entidades Corporativas (`step-3-company.png`)

> **Prompt:** `A cinematic wide shot of three futuristic corporate logos or glass buildings (CEPALAB, SIBIONICS, REALTRADE) interconnected by digital purple data streams. Cyberpunk corporate headquarters style at night. Deep purple and navy blue color palette, volumetric light rays, hyper-detailed.`
> **Local p/ salvar:** `public/images/como-usar/step-3-company.png`

#### D. Edição e Customização (`step-4-customize.png`)

> **Prompt:** `Close-up macro shot of a hand using a futuristic glowing stylus to edit a digital holographic document on a transparent glass screen. Purple sparks of data emerge from the pen tip. Technical, high-precision feel. Minimalist dark background.`
> **Local p/ salvar:** `public/images/como-usar/step-4-customize.png`

#### E. Assinatura e Exportação (`step-5-export.png`)

> **Prompt:** `A glowing digital certificate with an intricate security seal pulsing with purple light. A large "Export Successful" checkmark in neon violet. Digital particles and encryption nodes in the background. Symbolizes trust, legality, and completion.`
> **Local p/ salvar:** `public/images/como-usar/step-5-export.png`

#### F. Fluxo de Assinatura Complexo (`signature-workflow.png`)

> **Prompt:** `An abstract 3D flowchart made of connecting glowing purple crystal nodes and glass panels. Each panel shows a step of a legal signing process. Elegant lines, floating in a dark vacuum, premium executive style.`
> **Local p/ salvar:** `public/images/como-usar/signature-workflow.png`

***

## 🚀 Como Implementar no Código

Após gerar e salvar as imagens na pasta `public/images/como-usar/`, atualize as referências no arquivo `src/app/juridico/como-usar/page.tsx` (e sub-páginas) alterando a extensão de `.svg` para `.png`.

Exemplo:

```tsx
// De:
fallbackSrc: '/images/como-usar/step-1-access.svg'
// Para:
fallbackSrc: '/images/como-usar/step-1-access.png'
```
