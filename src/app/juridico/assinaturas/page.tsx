'use client';

import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { StatusIndicator } from '@/components/status-indicator';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';

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

  // Status icons are used in StatusIndicator component

  return (
    <div className="flex-1 space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Assinaturas Digitais
          </h1>
          <p className="text-muted-foreground mt-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentos.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlowCard
                glowColor="primary"
                variant="gradient"
                className="h-full flex flex-col group hover:scale-[1.02] transition-transform duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-medium line-clamp-2 flex-1">
                      {doc.nome_documento}
                    </CardTitle>
                    <StatusIndicator 
                      status={doc.status === 'assinado' ? 'success' : doc.status === 'pendente' ? 'pending' : 'error'}
                      size="sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {doc.progresso.assinadas}/{doc.progresso.total}
                    </span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(doc.progresso.assinadas / doc.progresso.total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Visualizar
                    </Button>
                    <Button size="sm" className="flex-1">
                      Assinar
                    </Button>
                  </div>
                </CardContent>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
