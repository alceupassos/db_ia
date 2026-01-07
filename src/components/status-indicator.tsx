'use client';

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
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  pending: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  info: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
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
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border',
          config.bgColor,
          config.borderColor,
          sizeStyle.container,
          pulse && 'animate-pulse'
        )}
      >
        <Icon className={cn(config.color, sizeStyle.icon)} />
        {pulse && (
          <span
            className={cn(
              'absolute inset-0 rounded-full',
              config.bgColor,
              'animate-ping'
            )}
          />
        )}
      </div>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
