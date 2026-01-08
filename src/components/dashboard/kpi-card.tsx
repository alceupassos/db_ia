'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowCard } from '@/components/ui/glow-card';
import { Sparkline } from '@/components/charts/sparkline';
import { useEffect } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  sparklineData?: Array<Record<string, string | number>>;
}

const variantStyles = {
  default: {
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    borderColor: 'border-primary/30',
    glowColor: 'primary' as const,
    iconColor: 'text-primary',
  },
  success: {
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    borderColor: 'border-emerald-500/30',
    glowColor: 'success' as const,
    iconColor: 'text-emerald-400',
  },
  warning: {
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    borderColor: 'border-amber-500/30',
    glowColor: 'warning' as const,
    iconColor: 'text-amber-400',
  },
  info: {
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-blue-500/30',
    glowColor: 'accent' as const,
    iconColor: 'text-blue-400',
  },
  error: {
    gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
    borderColor: 'border-rose-500/30',
    glowColor: 'error' as const,
    iconColor: 'text-rose-400',
  },
};

export function KPICard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  description,
  variant = 'default',
  sparklineData
}: KPICardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/\D/g, '')) || 0;
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 200,
  });
  const displayValue = useTransform(springValue, (latest) => {
    return Math.floor(latest).toLocaleString('pt-BR');
  });

  useEffect(() => {
    motionValue.set(numericValue);
  }, [numericValue, motionValue]);

  const styles = variantStyles[variant];

  return (
    <GlowCard 
      glowColor={styles.glowColor}
      variant="gradient"
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br",
        styles.gradient
      )}
    >
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          {Icon && (
            <div
              className={cn(
                "p-2 rounded-lg bg-background/20 backdrop-blur-sm opacity-80",
                styles.iconColor
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          {typeof value === 'number' ? (
            <motion.div 
              className="text-4xl font-light tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.span>{displayValue}</motion.span>
            </motion.div>
          ) : (
            <motion.div 
              className="text-4xl font-light tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {value}
            </motion.div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-3 -mx-2 opacity-60">
            <Sparkline 
              data={sparklineData} 
              dataKey="value" 
              color={`hsl(var(--glow-${styles.glowColor}))`}
              height={30}
            />
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}

        {/* Bottom accent line - colored by variant */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${variant === 'success' ? 'hsl(var(--success))' : 
                variant === 'warning' ? 'hsl(var(--warning))' : 
                variant === 'error' ? 'hsl(var(--error))' : 
                variant === 'info' ? 'hsl(var(--info))' : 
                'hsl(var(--primary))'} 50%, 
              transparent 100%)`,
            opacity: 0.6,
          }}
        />
      </div>
    </GlowCard>
  );
}
