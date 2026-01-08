'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageGeneratorProps {
  prompt: string;
  type?: 'infographic' | 'flowchart' | 'card' | 'timeline';
  onImageGenerated?: (url: string) => void;
  className?: string;
}

export function ImageGenerator({
  prompt,
  type = 'infographic',
  onImageGenerated,
  className
}: ImageGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();

      if (data.url) {
        setImageUrl(data.url);
        onImageGenerated?.(data.url);
      } else {
        setError('No image URL returned from API');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, type]);

  return (
    <div className={cn('relative w-full', className)}>
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-card/50 rounded-lg border border-border/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Gerando infográfico...</p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[300px] bg-card/50 rounded-lg border border-destructive/20 p-6"
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-destructive mb-4 text-center">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={generateImage}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </motion.div>
      )}

      {imageUrl && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-lg overflow-hidden"
        >
          <Image
            src={imageUrl}
            alt={prompt}
            width={1200}
            height={800}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={generateImage}
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              title="Regenerar imagem"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
