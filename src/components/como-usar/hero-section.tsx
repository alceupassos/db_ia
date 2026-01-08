'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Função auxiliar para gerar partículas (fora do componente para evitar problemas com lint)
function generateParticles(count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    });
  }
  return result;
}

const PARTICLES = generateParticles(20);

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function HeroSection({ title = "Como Usar", subtitle, backgroundImage }: HeroSectionProps) {
  // Usar partículas pré-geradas
  const particles = useMemo(() => PARTICLES, []);

  const displaySubtitle = subtitle || "Guias visuais e interativos para aproveitar ao máximo o sistema jurídico CEPALAB";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-12 min-h-[350px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Hero Background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/20" />
        </div>
      )}

      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      )}

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: particle.width,
              height: particle.height,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-light tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          {displaySubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Link href="/juridico/templates">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Começar com Templates
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
