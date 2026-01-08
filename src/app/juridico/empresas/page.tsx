'use client';

import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users } from 'lucide-react';
import Link from 'next/link';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { supabase } from '@/lib/supabase-client';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { Badge } from '@/components/ui/badge';

interface Empresa {
  id: string;
  codigo: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  logo_url?: string;
  assinantes_count?: number;
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmpresas();
  }, []);

  async function loadEmpresas() {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          *,
          assinantes:assinantes!inner(count)
        `)
        .eq('ativo', true)
        .order('nome_fantasia');

      if (error) throw error;

      // Processar dados
      interface EmpresaWithCount extends Empresa {
        assinantes?: Array<{ count: number }>;
      }
      
      const processed = (data || []).map((emp: unknown) => {
        const empresa = emp as EmpresaWithCount;
        return {
          ...empresa,
          assinantes_count: empresa.assinantes?.[0]?.count || 0,
        };
      });

      setEmpresas(processed);
    } catch (error) {
      console.error('Error loading empresas:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Empresas do Grupo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie empresas CEPALAB, SIBIONICS e REALTRADE
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={3} />
      ) : empresas.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="Nenhuma empresa cadastrada"
          description="Comece cadastrando uma nova empresa do grupo"
          action={{
            label: 'Cadastrar Empresa',
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa, index) => (
            <motion.div
              key={empresa.id}
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
                  <div className="flex items-center gap-4">
                    {empresa.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={empresa.logo_url}
                        alt={`Logo ${empresa.nome_fantasia || empresa.razao_social}`}
                        className="h-14 w-14 rounded-lg object-contain border border-border/30"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium">{empresa.nome_fantasia}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {empresa.codigo}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
                      <p className="font-mono text-xs">{empresa.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assinantes</p>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium">{empresa.assinantes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Razão Social</p>
                    <p className="text-sm line-clamp-2">{empresa.razao_social}</p>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Link href={`/juridico/empresas/${empresa.id}/assinantes`}>
                      <Button variant="default" size="sm" className="flex-1">
                        Assinantes
                      </Button>
                    </Link>
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
