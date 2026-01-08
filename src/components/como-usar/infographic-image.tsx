'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfographicImageProps {
  prompt: string;
  type?: 'infographic' | 'flowchart' | 'card' | 'timeline';
  alt: string;
  className?: string;
  fallbackSrc?: string; // Opcional
}

export function InfographicImage({ 
  prompt, 
  type = 'infographic',
  alt,
  className,
  fallbackSrc 
}: InfographicImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function generateImage() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const data = await response.json();

        if (mounted) {
          if (data.url) {
            setImageUrl(data.url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error generating image:', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    generateImage();

    return () => {
      mounted = false;
    };
  }, [prompt, type]);

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-card/50 rounded-xl border border-border/50',
          'min-h-[300px]',
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Gerando infográfico...</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    // Mostrar fallback se fornecido, caso contrário mostrar placeholder
    if (fallbackSrc) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('relative rounded-xl overflow-hidden', className)}
        >
          <Image
            src={fallbackSrc}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-auto rounded-xl"
            loading="lazy"
          />
          {/* Overlay indicando que é fallback */}
          {error && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-muted-foreground">
              Usando imagem de referência
            </div>
          )}
        </motion.div>
      );
    }
    
    // Sem fallback, mostrar placeholder
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex items-center justify-center bg-card/50 rounded-xl border border-border/50',
          'min-h-[300px]',
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-center p-6">
          <p className="text-sm">Infográfico em breve</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('relative rounded-xl overflow-hidden', className)}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto rounded-xl"
        loading="lazy"
      />
    </motion.div>
  );
}
