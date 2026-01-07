'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { supabase } from '@/lib/supabase-client';

interface Contraparte {
  id: string;
  tipo: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj_cpf?: string;
  representante_nome?: string;
  email?: string;
}

export default function ContrapartesPage() {
  const [contrapartes, setContrapartes] = useState<Contraparte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContrapartes();
  }, []);

  async function loadContrapartes() {
    try {
      const { data, error } = await supabase
        .from('contrapartes')
        .select('*')
        .eq('ativo', true)
        .order('razao_social');

      if (error) throw error;
      setContrapartes(data || []);
    } catch (error) {
      console.error('Error loading contrapartes:', error);
    } finally {
      setLoading(false);
    }
  }

  const tipoLabels: Record<string, string> = {
    cliente: 'Cliente',
    fornecedor: 'Fornecedor',
    parceiro: 'Parceiro',
    governo: 'Governo',
    outro: 'Outro',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contrapartes</h1>
          <p className="text-muted-foreground">
            Gerencie clientes, fornecedores, parceiros e outras contrapartes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Contraparte
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : contrapartes.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="Nenhuma contraparte cadastrada"
          description="Comece cadastrando uma nova contraparte"
          action={{
            label: 'Cadastrar Contraparte',
            onClick: () => {},
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contrapartes Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Razão Social</th>
                    <th className="text-left p-4">CNPJ/CPF</th>
                    <th className="text-left p-4">Representante</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contrapartes.map((cont) => (
                    <tr key={cont.id} className="border-b">
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {tipoLabels[cont.tipo] || cont.tipo}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{cont.razao_social}</td>
                      <td className="p-4 font-mono text-sm">
                        {cont.cnpj_cpf || '-'}
                      </td>
                      <td className="p-4">{cont.representante_nome || '-'}</td>
                      <td className="p-4">{cont.email || '-'}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">Editar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
