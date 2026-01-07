'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // em MB
}

export function FileUpload({ 
  onUpload, 
  disabled, 
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt',
  maxSize = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);
  }, [disabled, maxSize, onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFile(file);
    
    // Reset input
    e.target.value = '';
  }, [maxSize, onUpload]);

  const processFile = async (file: File) => {
    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
      // Após upload, iniciar estado de análise
      setUploading(false);
      setAnalyzing(true);
      // Resetar estado de análise após 3 segundos (análise acontece em background)
      setTimeout(() => {
        setAnalyzing(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          (uploading || analyzing) && "pointer-events-none"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
          </div>
        ) : analyzing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">Analisando documento com IA...</p>
            <p className="text-xs text-muted-foreground">Categorizando e gerando descrição</p>
          </div>
        ) : (
          <>
            <Upload className={cn(
              "h-10 w-10 mx-auto mb-4",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium mb-1">
              {isDragging ? "Solte o arquivo aqui" : "Arraste e solte um arquivo aqui"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              ou clique para selecionar
            </p>
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, JPG, PNG (máx. {maxSize}MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

interface FileListProps {
  files: Array<{
    id: string;
    nome: string;
    url?: string;
    tipo?: string | null;
    mime_type?: string | null;
  }>;
  onRemove?: (id: string) => void;
  onView?: (file: { id: string; nome: string; url?: string }) => void;
}

export function FileList({ files, onRemove, onView }: FileListProps) {
  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return <File className="h-5 w-5 text-muted-foreground" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-blue-400" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(file.mime_type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.nome}</p>
              {file.tipo && (
                <p className="text-xs text-muted-foreground">{file.tipo}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onView && file.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(file)}
              >
                Ver
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(file.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
