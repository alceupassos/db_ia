'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  const handleExport = async (formato: 'excel' | 'pdf') => {
    setLoading(true);
    setLoadingFormat(formato);
    
    try {
      const response = await fetch(`/api/juridico/relatorios?formato=${formato}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao exportar relatório');
      }
      
      // Obter o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `relatorio-${formato === 'excel' ? 'demandas.xlsx' : 'demandas.pdf'}`;
      
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert(error instanceof Error ? error.message : 'Erro ao exportar relatório');
    } finally {
      setLoading(false);
      setLoadingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={loading}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {loadingFormat === 'excel' ? 'Exportando...' : 'Exportar para Excel'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={loading}
          className="opacity-50 cursor-not-allowed"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar para PDF (Em breve)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
