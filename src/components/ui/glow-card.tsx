'use client';

import * as React from "react";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface GlowCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'gradient' | 'subtle' | 'shimmer' | 'pulse';
  style?: React.CSSProperties;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, glowColor = 'primary', variant = 'gradient', style, ...props }, ref) => {
    const glowColors = {
      primary: 'var(--glow-primary)',
      accent: 'var(--glow-accent)',
      success: 'var(--glow-success)',
      warning: 'var(--glow-warning)',
      error: 'var(--glow-error)',
    };

    const baseClasses = "relative rounded-xl border transition-all duration-300";
    const variantClasses = {
      default: "bg-card border-border shadow-glow-sm",
      gradient: "glass-card-gradient",
      subtle: "bg-card/50 backdrop-blur-sm border-border/50",
      shimmer: "bg-card border-border shadow-glow-sm overflow-hidden",
      pulse: "bg-card border-border shadow-glow-sm animate-pulse-glow",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={cn(baseClasses, variantClasses[variant], className)}
        style={{
          ...style,
          ['--glow-color' as string]: glowColors[glowColor],
        } as React.CSSProperties}
        {...(props as Record<string, unknown>)}
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 30px hsl(var(--glow-color) / 0.3)`,
          }}
        />
        
        {/* Shimmer effect */}
        {variant === 'shimmer' && (
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              backgroundPosition: '100% 0',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Bottom accent line */}
        {(variant === 'gradient' || variant === 'shimmer') && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-[1px] rounded-full opacity-50"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                hsl(var(--glow-color) / 0.5) 50%, 
                transparent 100%)`,
            }}
          />
        )}
      </motion.div>
    );
  }
);

GlowCard.displayName = "GlowCard";

export { GlowCard };
