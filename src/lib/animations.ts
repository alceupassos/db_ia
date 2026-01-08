import { Variants } from 'framer-motion';

/**
 * Container variants for staggered children animations
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Card variants - Fade + scale + blur
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // cubic-bezier
    },
  },
};

/**
 * Glow variants - Pulsing glow effect
 */
export const glowVariants: Variants = {
  initial: {
    opacity: 0.5,
    scale: 1,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Hover variants - Elevation + glow
 */
export const hoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px hsl(var(--glow-primary) / 0.3)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Page transition variants
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade in variants
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide in from bottom variants
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Scale in variants
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Icon pulse variants
 */
export const iconPulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
  },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
