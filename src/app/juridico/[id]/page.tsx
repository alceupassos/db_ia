'use client';

import { useEffect, useState } from 'react';
import { 
  getDemandaById, 
  updateDemanda, 
  getArquivosByDemanda, 
  vincularArquivo,
  deleteDemanda,
  type DemandaJuridica
} from '@/app/actions/juridico';
import { GoogleDrivePicker, FileList } from '@/components/google-drive-picker';
import { AISummaryButton } from '@/components/ai-summary-button';
import { AISearch } from '@/components/ai-search';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Trash2, 
  FileText,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DemandaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const demandaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [demanda, setDemanda] = useState<DemandaJuridica | null>(null);
  const [arquivos, setArquivos] = useState<Array<Record<string, unknown>>>([]);
  const [formData, setFormData] = useState<Partial<DemandaJuridica>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandaId]);

  async function loadData() {
    setLoading(true);
    try {
      const [demandaData, arquivosData] = await Promise.all([
        getDemandaById(demandaId),
        getArquivosByDemanda(demandaId)
      ]);
      setDemanda(demandaData);
      setFormData(demandaData);
      setArquivos(arquivosData as Array<Record<string, unknown>>);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDemanda(demandaId, formData as DemandaJuridica);
      setDemanda(formData as DemandaJuridica);
      setEditing(false);
    } catch (error: unknown) {
      alert('Erro ao salvar: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDemanda(demandaId);
      router.push('/juridico');
    } catch (error: unknown) {
      alert('Erro ao excluir: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleFileSelect = async (file: { name: string; mimeType: string; id: string; url: string }) => {
    try {
      await vincularArquivo(demandaId, {
        nome: file.name,
        tipo: file.mimeType,
        google_drive_id: file.id,
        google_drive_url: file.url,
        mime_type: file.mimeType
      });
      loadData();
    } catch (error: unknown) {
      alert('Erro ao vincular arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONCLUÍDO':
        return <Badge variant="success">Concluído</Badge>;
      case 'EM ANDAMENTO':
        return <Badge variant="warning">Em Andamento</Badge>;
      case 'PENDENTE':
        return <Badge variant="error">Pendente</Badge>;
      case 'Cancelado':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!demanda) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Demanda não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/juridico">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {editing ? (
            <Input
                  value={formData.demanda || ''}
                  onChange={(e) => setFormData({ ...formData, demanda: e.target.value })}
              className="text-2xl font-bold"
            />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">{demanda.demanda}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(demanda.status)}
          {editing ? (
            <>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData(demanda || {});
                }}
                size="sm"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Excluir Demanda</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{demanda.cliente_nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Responsável</Label>
                  <p className="font-medium">{demanda.responsavel}</p>
                </div>
                {demanda.data_solicitacao && (
                  <div>
                    <Label className="text-muted-foreground">Data de Solicitação</Label>
                    <p className="font-medium">
                      {new Date(demanda.data_solicitacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {demanda.prazo && (
                  <div>
                    <Label className="text-muted-foreground">Prazo</Label>
                    <p className="font-medium">
                      {new Date(demanda.prazo).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {demanda.data_entrega && (
                  <div>
                    <Label className="text-muted-foreground">Data de Entrega</Label>
                    <p className="font-medium">
                      {new Date(demanda.data_entrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {demanda.observacoes && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{demanda.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arquivos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Arquivos
                </CardTitle>
                <GoogleDrivePicker onFileSelect={handleFileSelect} />
              </div>
            </CardHeader>
            <CardContent>
              {arquivos.length > 0 ? (
                <FileList files={arquivos.map(a => ({
                  id: String(a.id || ''),
                  nome: String(a.nome || ''),
                  google_drive_url: a.google_drive_url ? String(a.google_drive_url) : undefined,
                  tipo: a.tipo ? String(a.tipo) : undefined
                }))} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum arquivo vinculado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Busca Semântica */}
          <AISearch 
            onSearch={(query, results) => {
              console.log('Busca:', query, results);
            }}
            demandaId={demandaId}
          />

          {/* Resumos de Arquivos */}
          {arquivos.map((arquivo) => (
            <Card key={String(arquivo.id || '')}>
              <CardHeader>
                <CardTitle className="text-base">{String(arquivo.nome || '')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AISummaryButton
                  arquivoId={String(arquivo.id || '')}
                  arquivoNome={String(arquivo.nome || '')}
                  googleDriveUrl={arquivo.google_drive_url ? String(arquivo.google_drive_url) : undefined}
                />
                {(() => {
                  const resumo = arquivo.resumo_ia;
                  return resumo && typeof resumo === 'string' ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{resumo}</p>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
