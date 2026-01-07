'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { StatusIndicator } from '@/components/status-indicator';

interface Documento {
  id: string;
  nome_documento: string;
  status: string;
  security_level: string;
  progresso: {
    total: number;
    assinadas: number;
  };
}

export default function AssinaturasPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentos();
  }, []);

  async function loadDocumentos() {
    try {
      // Simulado - implementar busca real
      setDocumentos([]);
    } catch (error) {
      console.error('Error loading documentos:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusIcons: Record<string, any> = {
    assinado: CheckCircle2,
    pendente: Clock,
    cancelado: XCircle,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas Digitais</h1>
          <p className="text-muted-foreground">
            Gerencie documentos para assinatura digital com verificação 2FA
          </p>
        </div>
        <Button>
          <FileSignature className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : documentos.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="h-12 w-12" />}
          title="Nenhum documento para assinatura"
          description="Comece criando um novo documento para assinatura"
          action={{
            label: 'Criar Documento',
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {doc.nome_documento}
                  </CardTitle>
                  <StatusIndicator 
                    status={doc.status === 'assinado' ? 'success' : doc.status === 'pendente' ? 'pending' : 'error'}
                    size="sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">
                    {doc.progresso.assinadas}/{doc.progresso.total}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(doc.progresso.assinadas / doc.progresso.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Visualizar
                  </Button>
                  <Button size="sm" className="flex-1">
                    Assinar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
