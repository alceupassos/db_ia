'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  ...props 
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted rounded';
  
  const variantStyles = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'w-full',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton variant="rectangular" width="20%" height={40} />
        <Skeleton variant="rectangular" width="30%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="rectangular" width="20%" height={60} />
          <Skeleton variant="rectangular" width="30%" height={60} />
          <Skeleton variant="rectangular" width="25%" height={60} />
          <Skeleton variant="rectangular" width="25%" height={60} />
        </div>
      ))}
    </div>
  );
}
