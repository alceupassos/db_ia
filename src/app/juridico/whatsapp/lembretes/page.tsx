'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { supabase } from '@/lib/supabase-client';

interface Lembrete {
  id: string;
  mensagem: string;
  data_envio: string;
  status: string;
}

export default function WhatsAppLembretesPage() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLembretes();
  }, []);

  async function loadLembretes() {
    try {
      const { data } = await supabase
        .from('whatsapp_reminders')
        .select('*')
        .order('data_envio', { ascending: false });
      setLembretes((data as Lembrete[]) || []);
    } catch (error) {
      console.error('Error loading lembretes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lembretes WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure lembretes automáticos para prazos e eventos importantes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : lembretes.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="Nenhum lembrete configurado"
          description="Comece criando um novo lembrete"
          action={{
            label: 'Criar Lembrete',
            onClick: () => {},
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lembretes Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lembretes.map((lembrete) => (
                <div key={lembrete.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lembrete.mensagem}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviar em: {new Date(lembrete.data_envio).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      lembrete.status === 'enviado' ? 'bg-green-500/10 text-green-500' :
                      lembrete.status === 'pendente' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {lembrete.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
