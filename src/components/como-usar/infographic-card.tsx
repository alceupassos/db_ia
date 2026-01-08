'use client';

import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { InfographicImage } from './infographic-image';
import { cn } from '@/lib/utils';

interface InfographicCardProps {
  title: string;
  description?: string;
  prompt: string;
  fallbackSrc: string; // Obrigatório
  type?: 'infographic' | 'flowchart' | 'card' | 'timeline';
  className?: string;
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
}

export function InfographicCard({
  title,
  description,
  prompt,
  fallbackSrc,
  type = 'infographic',
  className,
  glowColor = 'primary'
}: InfographicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full', className)}
    >
      <GlowCard glowColor={glowColor} variant="gradient" className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="rounded-lg overflow-hidden">
            <InfographicImage
              prompt={prompt}
              type={type}
              alt={title}
              fallbackSrc={fallbackSrc}
              className="w-full"
            />
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}
