'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';

export default function WhatsAppContatosPage() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContatos();
  }, []);

  async function loadContatos() {
    try {
      const response = await fetch('/api/whatsapp/contacts');
      const data = await response.json();
      setContatos(data || []);
    } catch (error) {
      console.error('Error loading contatos:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie contatos para envio de mensagens e lembretes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : contatos.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Nenhum contato cadastrado"
          description="Comece adicionando um novo contato"
          action={{
            label: 'Adicionar Contato',
            onClick: () => {},
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-left p-4">Telefone</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contatos.map((contato: any) => (
                    <tr key={contato.id} className="border-b">
                      <td className="p-4">{contato.nome}</td>
                      <td className="p-4 font-mono">{contato.telefone}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {contato.tipo}
                        </span>
                      </td>
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
