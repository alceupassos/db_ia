'use client';

import { useState } from 'react';
import { Loader2, Download, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileViewerProps {
  arquivo: {
    id: string;
    nome: string;
    url?: string;
    mime_type: string | null;
    resumo_ia: string | null;
  };
}

export function FileViewer({ arquivo }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf = arquivo.mime_type?.includes('pdf');
  const isImage = arquivo.mime_type?.includes('image');
  const isDoc = arquivo.mime_type?.includes('word') || arquivo.mime_type?.includes('document');

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      <div className="relative min-h-[400px] border rounded-lg overflow-hidden bg-muted">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {arquivo.url && !error ? (
          <>
            {isImage ? (
              <img
                src={arquivo.url}
                alt={arquivo.nome}
                className="w-full h-auto max-h-[500px] object-contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : isPdf ? (
              <iframe
                src={arquivo.url}
                className="w-full h-[500px]"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]">
                {isDoc && <File className="h-16 w-16 text-blue-500 mb-4" />}
                {!isDoc && <File className="h-16 w-16 text-muted-foreground mb-4" />}
                <p className="text-muted-foreground">Preview não disponível para este tipo de arquivo</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.open(arquivo.url!, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Arquivo
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px]">
            {isPdf && <FileText className="h-16 w-16 text-red-400 mb-4" />}
            {isImage && <Image className="h-16 w-16 text-blue-400 mb-4" />}
            {isDoc && <File className="h-16 w-16 text-blue-500 mb-4" />}
            {!isPdf && !isImage && !isDoc && <File className="h-16 w-16 text-muted-foreground mb-4" />}
            <p className="text-muted-foreground">
              {error ? 'Erro ao carregar arquivo' : 'Preview não disponível'}
            </p>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{arquivo.nome}</p>
          <p className="text-xs text-muted-foreground">
            {arquivo.mime_type || 'Tipo desconhecido'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {arquivo.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(arquivo.url!, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {arquivo.resumo_ia && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Resumo da IA</p>
          <ScrollArea className="h-[150px]">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {arquivo.resumo_ia}
            </p>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
