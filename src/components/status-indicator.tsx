'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'pending' | 'info';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'var(--glow-success)',
  },
  error: {
    icon: XCircle,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    glowColor: 'var(--glow-error)',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'var(--glow-warning)',
  },
  pending: {
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'var(--glow-accent)',
  },
  info: {
    icon: AlertCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'var(--glow-accent)',
  },
};

const sizeConfig = {
  sm: {
    container: 'h-6 w-6',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'h-8 w-8',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'h-10 w-10',
    icon: 'h-5 w-5',
  },
};

export function StatusIndicator({ 
  status, 
  label, 
  pulse = false,
  size = 'md' 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeStyle = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full border',
          config.bgColor,
          config.borderColor,
          sizeStyle.container
        )}
        animate={pulse ? {
          boxShadow: [
            `0 0 15px hsl(${config.glowColor} / 0.4)`,
            `0 0 25px hsl(${config.glowColor} / 0.6)`,
            `0 0 15px hsl(${config.glowColor} / 0.4)`,
          ],
          scale: [1, 1.08, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: pulse ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: pulse ? undefined : `0 0 12px hsl(${config.glowColor} / 0.3)`,
        }}
      >
        <Icon className={cn(config.color, sizeStyle.icon)} />
        
        {/* Pulsing ring effect */}
        {pulse && (
          <motion.span
            className={cn(
              'absolute inset-0 rounded-full border-2',
              config.borderColor
            )}
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        
        {/* Glow ring */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={pulse ? {
            boxShadow: [
              `0 0 8px hsl(${config.glowColor} / 0.3)`,
              `0 0 16px hsl(${config.glowColor} / 0.5)`,
              `0 0 8px hsl(${config.glowColor} / 0.3)`,
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: pulse ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
