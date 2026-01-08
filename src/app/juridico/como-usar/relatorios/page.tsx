'use client';

import { HeroSection } from '@/components/como-usar/hero-section';
import { TimelineStep } from '@/components/como-usar/timeline-step';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from '@/components/como-usar/infographic-image';
import {
    BarChart3,
    Filter,
    FileSpreadsheet,
    PieChart
} from 'lucide-react';

const reportSteps = [
    {
        step: 1,
        title: 'Acessar Painel de BI',
        description: 'No menu lateral, selecione "Relatórios". Você verá uma visão geral de todos os documentos e seus status atuais.',
        icon: BarChart3,
        imagePrompt: 'Professional dashboard with charts and data viz, purple theme',
        fallbackSrc: '/images/como-usar/step-1-access.svg',
    },
    {
        step: 2,
        title: 'Aplicar Filtros Inteligentes',
        description: 'Filtre por empresa, período, categoria ou status da assinatura para encontrar exatamente o que procura.',
        icon: Filter,
        imagePrompt: 'UI showing advanced filtering options with purple highlights',
        fallbackSrc: '/images/como-usar/tip-filters.svg',
    },
    {
        step: 3,
        title: 'Visualizar Métricas',
        description: 'Analise o tempo médio de assinatura, volume de contratos por mês e distribuição por empresa.',
        icon: PieChart,
        imagePrompt: 'Specialized charts showing legal metrics, dark theme',
        fallbackSrc: '/images/como-usar/document-categories.svg',
    },
    {
        step: 4,
        title: 'Exportar Dados',
        description: 'Gere arquivos Excel ou PDF com a listagem completa e os metadados dos seus documentos para auditoria externa.',
        icon: FileSpreadsheet,
        imagePrompt: 'Animated SVG showing data being exported to a spreadsheet',
        fallbackSrc: '/images/como-usar/report-export.svg',
    },
];

export default function RelatoriosGuidePage() {
    return (
        <div className="flex-1 space-y-12 p-6 max-w-7xl mx-auto">
            <HeroSection
                title="Relatórios e Inteligência"
                subtitle="Analise seus dados jurídicos com precisão e facilidade"
            />

            <GlowCard glowColor="accent" variant="gradient" className="p-8">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-light tracking-tight">Extraindo Insights</h2>
                        <p className="text-muted-foreground">Como utilizar o painel de relatórios do Cepalab OS</p>
                    </div>

                    <div className="my-10">
                        <InfographicImage
                            prompt="Professional SVG showing financial and legal reports export process, charts and data visualization"
                            type="infographic"
                            alt="Infográfico de Relatórios"
                            fallbackSrc="/images/como-usar/report-export.png"
                        />
                    </div>

                    <div className="grid gap-8">
                        {reportSteps.map((step, index) => (
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
        </div>
    );
}
