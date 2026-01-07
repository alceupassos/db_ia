import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const templates = [
  // Contratos Comerciais - Governo
  {
    categoria: 'Contratos Comerciais',
    subcategoria: 'Governo',
    nome_pt: 'Contrato de Fornecimento para SUS',
    nome_en: 'Supply Agreement for Brazilian Public Health System',
    descricao_pt: 'Contrato para fornecimento de medicamentos ao Sistema Único de Saúde',
    descricao_en: 'Agreement for supplying medications to the Brazilian Public Health System',
    conteudo_pt: `CONTRATO DE FORNECIMENTO DE MEDICAMENTOS AO SISTEMA ÚNICO DE SAÚDE

PARTES CONTRATANTES:
{{EMPRESA_NOME}}, inscrita no CNPJ sob o n. {{EMPRESA_CNPJ}}, com sede em {{EMPRESA_ENDERECO}}, doravante denominada FORNECEDORA;
MINISTÉRIO DA SAÚDE, entidade da Administração Pública Federal, doravante denominado CONTRATANTE.

OBJETO:
O presente contrato tem por objeto o fornecimento de medicamentos especificados, em conformidade com as normas e regulamentações da ANVISA e do Ministério da Saúde.

VALOR E FORMA DE PAGAMENTO:
O valor total do contrato é de R$ {{VALOR_TOTAL}}, parcelado conforme cronograma de entrega.

VIGÊNCIA:
Este contrato vigorará pelo prazo de {{PRAZO_VIGENCIA}} meses, contados da data de sua assinatura.

FORO:
Fica eleito o foro da Comarca de Brasília/DF para dirimir questões oriundas do presente contrato.`,
    conteudo_en: `SUPPLY AGREEMENT FOR MEDICATIONS TO THE BRAZILIAN PUBLIC HEALTH SYSTEM

CONTRACTING PARTIES:
{{EMPRESA_NOME_EN}}, registered under CNPJ No. {{EMPRESA_CNPJ}}, with headquarters at {{EMPRESA_ENDERECO_EN}}, hereinafter referred to as SUPPLIER;
MINISTRY OF HEALTH, a Federal Public Administration entity, hereinafter referred to as CONTRACTOR.

OBJECT:
This agreement has as its object the supply of specified medications, in accordance with ANVISA and Ministry of Health regulations.

VALUE AND PAYMENT TERMS:
The total contract value is R$ {{VALOR_TOTAL}}, paid in installments according to the delivery schedule.

TERM:
This agreement shall be valid for a period of {{PRAZO_VIGENCIA}} months, counted from the date of its signature.

JURISDICTION:
The jurisdiction of the District of Brasília/DF is hereby elected to resolve issues arising from this agreement.`,
    orgao_destino: ['MS'],
    empresa: 'CEPALAB',
    variaveis: {
      '{{EMPRESA_NOME}}': 'Nome da empresa',
      '{{EMPRESA_CNPJ}}': 'CNPJ',
      '{{VALOR_TOTAL}}': 'Valor total',
      '{{PRAZO_VIGENCIA}}': 'Prazo em meses',
    },
  },
  
  // NDA
  {
    categoria: 'Acordos de Confidencialidade',
    subcategoria: 'NDA',
    nome_pt: 'Acordo de Confidencialidade Mutua',
    nome_en: 'Mutual Non-Disclosure Agreement',
    descricao_pt: 'NDA bilateral para proteção de informações confidenciais',
    descricao_en: 'Bilateral NDA for protection of confidential information',
    conteudo_pt: `ACORDO DE CONFIDENCIALIDADE MÚTUA

PARTES:
{{EMPRESA_NOME}}, inscrita no CNPJ sob o n. {{EMPRESA_CNPJ}}, doravante denominada PARTE A;
{{CONTRATANTE_NOME}}, inscrita no CNPJ sob o n. {{CONTRATANTE_CNPJ}}, doravante denominada PARTE B.

OBJETO:
As partes se comprometem a manter em estrita confidencialidade todas as informações técnicas, comerciais e estratégicas compartilhadas durante as negociações.`,
    conteudo_en: `MUTUAL NON-DISCLOSURE AGREEMENT

PARTIES:
{{EMPRESA_NOME_EN}}, registered under CNPJ No. {{EMPRESA_CNPJ}}, hereinafter referred to as PARTY A;
{{CONTRATANTE_NOME}}, registered under CNPJ No. {{CONTRATANTE_CNPJ}}, hereinafter referred to as PARTY B.

OBJECT:
The parties agree to maintain strict confidentiality regarding all technical, commercial and strategic information shared during negotiations.`,
    empresa: 'CEPALAB',
    variaveis: {
      '{{EMPRESA_NOME}}': 'Nome da empresa',
      '{{CONTRATANTE_NOME}}': 'Nome da contraparte',
    },
  },
  
  // Procuracao ANVISA
  {
    categoria: 'Procurações',
    subcategoria: 'Regulatória',
    nome_pt: 'Procuração para Representação junto à ANVISA',
    nome_en: 'Power of Attorney for ANVISA Representation',
    descricao_pt: 'Procuração específica para representação em processos junto à ANVISA',
    descricao_en: 'Specific power of attorney for representation in ANVISA processes',
    conteudo_pt: `PROCURAÇÃO PARA REPRESENTAÇÃO JUNTO À AGÊNCIA NACIONAL DE VIGILÂNCIA SANITÁRIA

OUTORGANTE: {{EMPRESA_NOME}}, inscrita no CNPJ sob o n. {{EMPRESA_CNPJ}}

OUTORGADO: {{REPRESENTANTE_NOME}}, {{REPRESENTANTE_CARGO}}, portador do CPF n. {{REPRESENTANTE_CPF}}

PODERES:
Concedo poderes especiais ao outorgado para representar a outorgante perante a ANVISA, incluindo protocolo de processos, acompanhamento de pedidos de registro e licenciamento, e assinatura de documentos necessários.`,
    conteudo_en: `POWER OF ATTORNEY FOR REPRESENTATION BEFORE THE NATIONAL HEALTH SURVEILLANCE AGENCY

GRANTOR: {{EMPRESA_NOME_EN}}, registered under CNPJ No. {{EMPRESA_CNPJ}}

ATTORNEY: {{REPRESENTANTE_NOME}}, {{REPRESENTANTE_CARGO_EN}}, holder of CPF No. {{REPRESENTANTE_CPF}}

POWERS:
I grant special powers to the attorney to represent the grantor before ANVISA, including filing of processes, monitoring of registration and licensing requests, and signing of necessary documents.`,
    orgao_destino: ['ANVISA'],
    empresa: 'CEPALAB',
    variaveis: {
      '{{EMPRESA_NOME}}': 'Nome da empresa',
      '{{REPRESENTANTE_NOME}}': 'Nome do representante',
      '{{REPRESENTANTE_CARGO}}': 'Cargo',
      '{{REPRESENTANTE_CPF}}': 'CPF',
    },
  },
];

async function seed() {
  console.log('🌱 Iniciando seed de templates...');

  for (const template of templates) {
    try {
      const { data, error } = await supabase
        .from('templates_juridicos')
        .upsert(template, {
          onConflict: 'nome_pt',
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        console.error(`❌ Erro ao inserir ${template.nome_pt}:`, error);
      } else {
        console.log(`✅ Template inserido: ${template.nome_pt}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${template.nome_pt}:`, err);
    }
  }

  console.log('✅ Seed concluído!');
}

seed();
