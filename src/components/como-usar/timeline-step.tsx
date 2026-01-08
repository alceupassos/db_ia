'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from './infographic-image';

interface TimelineStepProps {
  step: number;
  title: string;
  description: string;
  icon?: LucideIcon;
  imagePrompt?: string;
  fallbackSrc?: string;
  delay?: number;
}

export function TimelineStep({
  step,
  title,
  description,
  icon: Icon,
  imagePrompt,
  fallbackSrc,
  delay = 0,
}: TimelineStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      {/* Timeline line */}
      {step > 1 && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/20 -translate-y-full" />
      )}

      <div className="flex gap-6">
        {/* Step number and icon */}
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
            {Icon ? (
              <Icon className="h-6 w-6 text-primary-foreground" />
            ) : (
              <span className="text-lg font-semibold text-primary-foreground">{step}</span>
            )}
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 pb-12">
          <GlowCard glowColor="primary" variant="gradient" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium">{title}</h3>
                <span className="text-xs font-medium text-primary/70 bg-primary/10 px-2 py-1 rounded">
                  Passo {step}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
              
              {/* Infographic image */}
              {imagePrompt && fallbackSrc && (
                <div className="mt-4 rounded-lg bg-card/50 border border-border/50 p-4">
                  <p className="text-xs text-muted-foreground mb-2">Infográfico visual:</p>
                  <InfographicImage
                    prompt={imagePrompt}
                    type="card"
                    alt={title}
                    fallbackSrc={fallbackSrc}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
}
