'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export function ProgressRing({ 
  value, 
  size = 80, 
  strokeWidth = 8,
  className,
  color = 'hsl(var(--primary))'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animatedValue / 100) * circumference;
  
  // Extract color values for gradient
  const gradientId = `progress-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />
        {/* Progress circle with animation */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: offset,
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
          }}
          style={{
            filter: `drop-shadow(0 0 4px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-sm font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(animatedValue)}%
        </motion.span>
      </div>
    </div>
  );
}
