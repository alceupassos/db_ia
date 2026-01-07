'use client';

import { useState, useEffect } from 'react';
import { createDemanda, getUniqueClientes, getUniqueResponsaveis } from '@/app/actions/juridico';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function NovaDemandaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    demanda: '',
    responsavel: '',
    data_solicitacao: new Date().toISOString().split('T')[0],
    prazo: '',
    data_entrega: '',
    status: 'PENDENTE' as const,
    observacoes: '',
    documentos_assinados: 'EM ANDAMENTO' as const
  });
  const [clienteSuggestions, setClienteSuggestions] = useState<string[]>([]);
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);

  useEffect(() => {
    loadAutocompleteData();
  }, []);

  async function loadAutocompleteData() {
    try {
      const [clientesData, responsaveisData] = await Promise.all([
        getUniqueClientes(),
        getUniqueResponsaveis()
      ]);
      setClientes(clientesData);
      setResponsaveis(responsaveisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  const handleClienteChange = (value: string) => {
    setFormData({ ...formData, cliente_nome: value });
    
    if (value.length > 0) {
      const filtered = clientes.filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      setClienteSuggestions(filtered.slice(0, 5));
      setShowClienteSuggestions(true);
    } else {
      setShowClienteSuggestions(false);
    }
  };

  const selectCliente = (cliente: string) => {
    setFormData({ ...formData, cliente_nome: cliente });
    setShowClienteSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDemanda({
        ...formData,
        data_solicitacao: formData.data_solicitacao || null,
        prazo: formData.prazo || null,
        data_entrega: formData.data_entrega || null,
        observacoes: formData.observacoes || null,
        cliente_id: null
      });

      router.push('/juridico');
    } catch (error: unknown) {
      console.error('Erro ao criar demanda:', error);
      alert('Erro ao criar demanda: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/juridico">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Demanda Jurídica</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para criar uma nova demanda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Demanda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <div className="relative">
                <Input
                  id="cliente"
                  type="text"
                  value={formData.cliente_nome}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowClienteSuggestions(false), 200)}
                  placeholder="Digite o nome do cliente"
                  required
                />
                {showClienteSuggestions && clienteSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden">
                    {clienteSuggestions.map((cliente) => (
                      <button
                        key={cliente}
                        type="button"
                        onClick={() => selectCliente(cliente)}
                        className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                      >
                        {cliente}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Demanda */}
            <div className="space-y-2">
              <Label htmlFor="demanda">Demanda *</Label>
              <textarea
                id="demanda"
                value={formData.demanda}
                onChange={(e) => setFormData({ ...formData, demanda: e.target.value })}
                placeholder="Descreva a demanda jurídica"
                required
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Select
                value={formData.responsavel}
                onValueChange={(value) => {
                  if (value === '__new__') {
                    setFormData({ ...formData, responsavel: '' });
                  } else {
                    setFormData({ ...formData, responsavel: value });
                  }
                }}
                required
              >
                <SelectTrigger id="responsavel">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Adicionar novo</SelectItem>
                </SelectContent>
              </Select>
              {formData.responsavel === '' && (
                <Input
                  placeholder="Nome do novo responsável"
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              )}
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_solicitacao">Data de Solicitação</Label>
                <Input
                  id="data_solicitacao"
                  type="date"
                  value={formData.data_solicitacao}
                  onChange={(e) => setFormData({ ...formData, data_solicitacao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_entrega">Data de Entrega</Label>
                <Input
                  id="data_entrega"
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value as typeof formData.status })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUÍDO">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Documentos Assinados */}
            <div className="space-y-2">
              <Label htmlFor="documentos_assinados">Documentos Assinados</Label>
              <Select
                value={formData.documentos_assinados}
                onValueChange={(value: string) => setFormData({ ...formData, documentos_assinados: value as typeof formData.documentos_assinados })}
              >
                <SelectTrigger id="documentos_assinados">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUÍDO">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Demanda
                  </>
                )}
              </Button>
              <Link href="/juridico">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
