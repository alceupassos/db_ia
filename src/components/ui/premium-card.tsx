'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PremiumCardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
  children?: React.ReactNode;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = 'default', glowColor = 'primary', children }, ref) => {
    const glowColors = {
      primary: 'hsl(var(--glow-primary))',
      accent: 'hsl(var(--glow-accent))',
      success: 'hsl(var(--glow-success))',
      warning: 'hsl(var(--glow-warning))',
      error: 'hsl(var(--glow-error))',
    };

    const variants = {
      default: 'bg-card/50 backdrop-blur-sm border border-border/50',
      elevated: 'bg-card/80 backdrop-blur-md border border-border/60 shadow-lg shadow-primary/5',
      outlined: 'bg-transparent border border-border/40',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          y: -2,
          transition: { duration: 0.2 },
        }}
        className={cn(
          'relative rounded-xl overflow-hidden transition-all duration-300',
          variants[variant],
          className
        )}
      >
        {/* Subtle border glow on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 0 1px ${glowColors[glowColor]}40`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Bottom accent line - subtle */}
        {variant !== 'outlined' && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] rounded-full opacity-30"
            style={{
              background: `linear-gradient(90deg,
                transparent 0%,
                ${glowColors[glowColor]}50 50%,
                transparent 100%)`,
            }}
          />
        )}
      </motion.div>
    );
  }
);

PremiumCard.displayName = 'PremiumCard';

export { PremiumCard };
