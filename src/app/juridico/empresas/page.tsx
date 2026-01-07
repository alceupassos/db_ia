'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users } from 'lucide-react';
import Link from 'next/link';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { supabase } from '@/lib/supabase-client';

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
      const processed = (data || []).map((emp: any) => ({
        ...emp,
        assinantes_count: emp.assinantes?.[0]?.count || 0,
      }));

      setEmpresas(processed);
    } catch (error) {
      console.error('Error loading empresas:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas do Grupo</h1>
          <p className="text-muted-foreground">Gerencie empresas CEPALAB, SIBIONICS e REALTRADE</p>
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
          {empresas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {empresa.logo_url ? (
                    <img
                      src={empresa.logo_url}
                      alt={empresa.nome_fantasia}
                      className="h-12 w-12 rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{empresa.nome_fantasia}</CardTitle>
                    <p className="text-sm text-muted-foreground">{empresa.codigo}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-mono text-sm">{empresa.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Razão Social</p>
                  <p className="text-sm">{empresa.razao_social}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.assinantes_count || 0} assinantes ativos</span>
                </div>
                <div className="flex gap-2 pt-2">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
