'use client';

import { HeroSection } from '@/components/como-usar/hero-section';
import { TimelineStep } from '@/components/como-usar/timeline-step';
import { FAQAccordion } from '@/components/como-usar/faq-accordion';
import { InfographicImage } from '@/components/como-usar/infographic-image';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/ui/glow-card';
import {
  FileText,
  FolderSearch,
  Building2,
  Edit,
  FileCheck,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const templateSteps = [
  {
    step: 1,
    title: 'Acessar Templates Jurídicos',
    description: 'Navegue até a seção "Templates" no menu lateral ou clique no botão abaixo. Você encontrará todos os templates disponíveis organizados por categoria.',
    icon: FileText,
    imagePrompt: 'Professional infographic showing user navigating to legal templates section, purple theme',
    fallbackSrc: '/images/como-usar/step-1-access.png',
  },
  {
    step: 2,
    title: 'Escolher Categoria',
    description: 'Selecione entre as categorias disponíveis: Contratos, Procurações, NDAs, MOUs, Patentes, Licitações, ou outras categorias específicas do seu negócio.',
    icon: FolderSearch,
    imagePrompt: 'Infographic showing different legal document categories as folders, organized layout',
    fallbackSrc: '/images/como-usar/step-2-category.png',
  },
  {
    step: 3,
    title: 'Selecionar Empresa',
    description: 'Escolha a empresa do grupo (CEPALAB ou SIBIONICS). O template será automaticamente personalizado com os dados da empresa selecionada.',
    icon: Building2,
    imagePrompt: 'Infographic showing company logos with selection process, corporate style',
    fallbackSrc: '/images/como-usar/step-3-company.png',
  },
  {
    step: 4,
    title: 'Personalizar Campos',
    description: 'Edite os campos bilingues (PT-BR/EN) conforme necessário. Os templates suportam edição simultânea em ambos os idiomas, mantendo consistência.',
    icon: Edit,
    imagePrompt: 'Infographic showing bilingual text editing interface, side-by-side comparison',
    fallbackSrc: '/images/como-usar/step-4-customize.png',
  },
  {
    step: 5,
    title: 'Exportar ou Assinar',
    description: 'Exporte o documento finalizado em PDF ou envie diretamente para assinatura digital com verificação 2FA. O sistema gerencia todo o fluxo de assinaturas.',
    icon: FileCheck,
    imagePrompt: 'Infographic showing document export and digital signature workflow, step by step',
    fallbackSrc: '/images/como-usar/step-5-export.png',
  },
];

const faqItems = [
  {
    question: 'Posso usar templates em outros idiomas?',
    answer: 'Sim! Todos os templates são bilingues (PT-BR/EN) e você pode editar ambos os idiomas simultaneamente. O sistema mantém a consistência entre as versões.',
  },
  {
    question: 'Como adiciono novos templates?',
    answer: 'Novos templates podem ser adicionados através da área administrativa. Entre em contato com o administrador do sistema para incluir novos modelos específicos da sua necessidade.',
  },
  {
    question: 'Os templates são personalizados por empresa?',
    answer: 'Sim. Ao selecionar uma empresa (CEPALAB ou SIBIONICS), o template é automaticamente preenchido com os dados cadastrais da empresa, incluindo CNPJ, razão social e outras informações relevantes.',
  },
  {
    question: 'Posso assinar documentos diretamente do template?',
    answer: 'Sim! Após personalizar o template, você pode enviá-lo para assinatura digital com verificação 2FA. O sistema gerencia todo o fluxo de aprovações e assinaturas.',
  },
  {
    question: 'Há limite de uso dos templates?',
    answer: 'Não há limite de uso. Você pode criar quantos documentos precisar usando os templates disponíveis. Todos os documentos são salvos e podem ser acessados posteriormente.',
  },
];

const tips = [
  {
    icon: Lightbulb,
    title: 'Dica Pro',
    content: 'Use os filtros de categoria e empresa para encontrar rapidamente o template ideal para sua necessidade.',
  },
  {
    icon: Lightbulb,
    title: 'Edição Rápida',
    content: 'Todos os campos marcados como editáveis podem ser modificados diretamente no template antes da exportação.',
  },
  {
    icon: Lightbulb,
    title: 'Assinaturas em Lote',
    content: 'Envie múltiplos documentos para assinatura simultaneamente, economizando tempo e agilizando processos.',
  },
];

export default function ComoUsarPage() {
  return (
    <div className="flex-1 space-y-12 p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <HeroSection backgroundImage="/images/como-usar/como-usar-hero.png" />

      {/* Main Infographic Section */}
      <GlowCard glowColor="primary" variant="gradient" className="p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light tracking-tight">
              Tutorial: Templates Jurídicos
            </h2>
            <p className="text-muted-foreground">
              Aprenda a usar templates jurídicos em 5 passos simples
            </p>
          </div>

          {/* Overview Infographic */}
          <div className="my-8">
            <InfographicImage
              prompt="Professional 3D isometric masterpiece showing a digital legal workflow sequence, glass panels, purple glowing connections, dark mode"
              type="flowchart"
              alt="Fluxograma do processo de criação de templates jurídicos"
              fallbackSrc="/images/como-usar/overview-full.png"
            />
          </div>

          {/* Timeline Steps */}
          <div className="space-y-8 pt-8">
            {templateSteps.map((step, index) => (
              <TimelineStep
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                icon={step.icon}
                imagePrompt={step.imagePrompt}
                fallbackSrc={step.fallbackSrc}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Tips Section with Infographics */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light tracking-tight">
            Dicas Profissionais
          </h2>
          <p className="text-muted-foreground">
            Aprenda técnicas avançadas para aproveitar ao máximo o sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard glowColor="accent" variant="gradient" className="p-6 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="font-medium">{tip.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{tip.content}</p>

                    {/* Mini infográfico ilustrativo */}
                    <div className="pt-2 border-t border-border/30">
                      <InfographicImage
                        prompt={`Visual illustration: ${tip.content}, professional style, purple theme, minimalist`}
                        type="card"
                        alt={tip.title}
                        fallbackSrc={
                          index === 0 ? '/images/como-usar/tip-filters.png' :
                            index === 1 ? '/images/como-usar/tip-edit.png' :
                              '/images/como-usar/tip-batch.png'
                        }
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Infographics Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light tracking-tight">
            Guias Visuais Detalhados
          </h2>
          <p className="text-muted-foreground">
            Explore processos específicos com infográficos interativos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GlowCard glowColor="primary" variant="gradient" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Processo de Assinatura Digital</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fluxo completo desde a criação do documento até a assinatura com 2FA
            </p>
            <InfographicImage
              prompt="Infographic showing digital signature workflow with 2FA verification, step-by-step process, legal documents, secure authentication, purple theme"
              type="flowchart"
              alt="Fluxograma do processo de assinatura digital com 2FA"
            />
          </GlowCard>

          <GlowCard glowColor="accent" variant="gradient" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Categorização de Documentos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Como organizar e categorizar documentos jurídicos eficientemente
            </p>
            <InfographicImage
              prompt="Infographic showing document categorization system, folders, tags, metadata, organization workflow, professional legal documents, purple theme"
              type="infographic"
              alt="Infográfico de categorização de documentos"
            />
          </GlowCard>
        </div>
      </div>

      {/* FAQ Section */}
      <GlowCard glowColor="primary" variant="gradient" className="p-8">
        <FAQAccordion items={faqItems} />
      </GlowCard>

      {/* CTA Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-6 py-12"
      >
        <div className="space-y-3">
          <h2 className="text-2xl font-light">Pronto para começar?</h2>
          <p className="text-muted-foreground">
            Acesse a seção de Templates e crie seu primeiro documento jurídico
          </p>
        </div>
        <Link href="/juridico/templates">
          <Button size="lg" className="gap-2">
            Ir para Templates
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
