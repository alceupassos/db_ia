'use client';

import { HeroSection } from '@/components/como-usar/hero-section';
import { TimelineStep } from '@/components/como-usar/timeline-step';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from '@/components/como-usar/infographic-image';
import {
    Building2,
    Settings2,
    Users2,
    Globe
} from 'lucide-react';

const companySteps = [
    {
        step: 1,
        title: 'Visualizar Grupo Econômico',
        description: 'Acesse o painel de empresas para ver todas as entidades cadastradas: CEPALAB e SIBIONICS.',
        icon: Building2,
        imagePrompt: 'Infographic showing corporate buildings or logos, purple accent',
        fallbackSrc: '/images/como-usar/step-3-company.png',
    },
    {
        step: 2,
        title: 'Alternar entre Entidades',
        description: 'O sistema adapta automaticamente metadados, assinantes e templates conforme a empresa selecionada.',
        icon: Globe,
        imagePrompt: 'UI transition showing switching between different company profiles',
        fallbackSrc: '/images/como-usar/multi-company-view.svg',
    },
    {
        step: 3,
        title: 'Gerenciar Permissões',
        description: 'Defina quem pode visualizar ou assinar documentos para cada empresa específica do grupo.',
        icon: Users2,
        imagePrompt: 'Security permissions matrix showing users and company access',
        fallbackSrc: '/images/como-usar/notification-alert.png',
    },
    {
        step: 4,
        title: 'Configurar Dados Mestres',
        description: 'Mantenha CNPJs, endereços e representantes legais sempre atualizados em um único lugar.',
        icon: Settings2,
        imagePrompt: 'Settings panel showing company legal data fields, purple highlights',
        fallbackSrc: '/images/como-usar/step-4-customize.png',
    },
];

export default function GestaoEmpresasGuidePage() {
    return (
        <div className="flex-1 space-y-12 p-6 max-w-7xl mx-auto">
            <HeroSection
                title="Gestão Multi-Empresas"
                subtitle="Controle centralizado para todas as suas entidades jurídicas"
            />

            <GlowCard glowColor="primary" variant="gradient" className="p-8">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-light tracking-tight">Arquitetura de Grupo</h2>
                        <p className="text-muted-foreground">Como o Cepalab OS organiza suas empresas</p>
                    </div>

                    <div className="my-10">
                        <InfographicImage
                            prompt="Professional SVG showing multiple company management dashboard, organizational structure, purple theme"
                            type="infographic"
                            alt="Infográfico de Gestão de Empresas"
                            fallbackSrc="/images/como-usar/multi-company-view.png"
                        />
                    </div>

                    <div className="space-y-10">
                        {companySteps.map((step, index) => (
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
