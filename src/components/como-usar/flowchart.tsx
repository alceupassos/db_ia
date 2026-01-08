'use client';

import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from './infographic-image';
import { cn } from '@/lib/utils';

interface FlowchartProps {
  title?: string;
  prompt: string;
  fallbackSrc: string; // Obrigatório
  steps?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  className?: string;
}

export function Flowchart({
  title = 'Fluxograma do Processo',
  prompt,
  fallbackSrc,
  steps,
  className
}: FlowchartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full', className)}
    >
      <GlowCard glowColor="primary" variant="gradient" className="p-6">
        <div className="space-y-6">
          {title && (
            <div>
              <h3 className="text-2xl font-light tracking-tight mb-2">{title}</h3>
            </div>
          )}
          
          {/* Infográfico gerado */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border/50">
            <InfographicImage
              prompt={prompt}
              type="flowchart"
              alt={title}
              fallbackSrc={fallbackSrc}
              className="w-full"
            />
          </div>

          {/* Lista de passos (opcional, como fallback ou complemento) */}
          {steps && steps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-border/50">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-card/30 rounded-lg border border-border/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{step.label}</h4>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </motion.div>
  );
}
