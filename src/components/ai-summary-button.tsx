'use client';

import { useState } from 'react';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

interface AISummaryButtonProps {
  arquivoId: string;
  arquivoNome: string;
  googleDriveUrl?: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function AISummaryButton({ arquivoId, arquivoNome, googleDriveUrl, onSummaryGenerated }: AISummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/juridico/resumir-contrato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arquivoId,
          arquivoNome,
          googleDriveUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar resumo');
      }

      const data = await response.json();
      setSummary(data.resumo);
      if (onSummaryGenerated) {
        onSummaryGenerated(data.resumo);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar resumo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateSummary}
        disabled={loading || !googleDriveUrl}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Resumir com IA
          </>
        )}
      </Button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Resumo Gerado pela IA</h4>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
