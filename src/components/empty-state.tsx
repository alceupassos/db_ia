'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeInVariants, scaleInVariants } from '@/lib/animations';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      {icon && (
        <motion.div 
          className="mb-6 relative"
          variants={scaleInVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Glow effect behind icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(20px)',
            }}
          >
            <div className="text-primary/30" style={{ fontSize: '80px' }}>
              {icon}
            </div>
          </motion.div>
          
          {/* Icon */}
          <div className="relative text-muted-foreground/60 text-6xl">
            {icon}
          </div>
        </motion.div>
      )}
      
      <motion.h3 
        className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={action.onClick}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)]"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
