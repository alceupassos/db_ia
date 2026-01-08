'use client';

import { HeroSection } from '@/components/como-usar/hero-section';
import { TimelineStep } from '@/components/como-usar/timeline-step';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from '@/components/como-usar/infographic-image';
import { Button } from '@/components/ui/button';
import {
    FileCheck,
    PenTool,
    ShieldCheck,
    Mail,
    Smartphone
} from 'lucide-react';
import Link from 'next/link';

const signatureSteps = [
    {
        step: 1,
        title: 'Preparar Documento',
        description: 'Após finalizar a edição do template, clique no botão "Enviar para Assinatura". O documento será convertido e preparado para o fluxo digital.',
        icon: FileCheck,
        imagePrompt: 'Professional SVG showing document being prepared for digital signature, purple theme',
        fallbackSrc: '/images/como-usar/signature-workflow.png',
    },
    {
        step: 2,
        title: 'Adicionar Assinantes',
        description: 'Insira o nome e e-mail dos signatários. Você pode definir uma ordem de assinatura ou enviar para todos simultaneamente.',
        icon: Mail,
        imagePrompt: 'Infographic showing list of signers with email icons, clean UI',
        fallbackSrc: '/images/como-usar/step-3-company.png',
    },
    {
        step: 3,
        title: 'Verificação 2FA (SMS)',
        description: 'Para garantir a segurança, cada assinante receberá um código único via SMS ou E-mail para validar sua identidade antes de assinar.',
        icon: Smartphone,
        imagePrompt: 'Infographic showing 2FA verification process on a smartphone screen',
        fallbackSrc: '/images/como-usar/notification-alert.png',
    },
    {
        step: 4,
        title: 'Assinar Digitalmente',
        description: 'O assinante pode usar uma assinatura desenhada ou um certificado digital. O processo é rápido e legalmente válido.',
        icon: PenTool,
        imagePrompt: 'Infographic showing a hand signing on a digital tablet with a stylus',
        fallbackSrc: '/images/como-usar/signatures-manual.png',
    },
    {
        step: 5,
        title: 'Conclusão e Registro',
        description: 'Uma vez assinado por todos, o documento recebe um selo de integridade e é armazenado com trilha de auditoria completa.',
        icon: ShieldCheck,
        imagePrompt: 'Infographic showing finished document with a security seal and lock icon',
        fallbackSrc: '/images/como-usar/step-5-export.png',
    },
];

export default function AssinaturasGuidePage() {
    return (
        <div className="flex-1 space-y-12 p-6 max-w-7xl mx-auto">
            <HeroSection
                title="Guia de Assinaturas"
                subtitle="Entenda como funciona o fluxo seguro de assinaturas digitais"
            />

            <GlowCard glowColor="primary" variant="gradient" className="p-8">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-light tracking-tight">O Fluxo de Assinatura</h2>
                        <p className="text-muted-foreground">Segurança e validade jurídica em cada passo</p>
                    </div>

                    <div className="my-8">
                        <InfographicImage
                            prompt="Detailed digital signature flowchart, specialized legal tech style, purple and dark theme"
                            type="flowchart"
                            alt="Fluxograma de Assinatura"
                            fallbackSrc="/images/como-usar/signature-workflow.png"
                        />
                    </div>

                    <div className="space-y-8 pt-8">
                        {signatureSteps.map((step, index) => (
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

            <div className="text-center py-12">
                <Link href="/juridico/como-usar">
                    <Button variant="outline" className="gap-2">
                        Voltar ao Guia Geral
                    </Button>
                </Link>
            </div>
        </div>
    );
}
