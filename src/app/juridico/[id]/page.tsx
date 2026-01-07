'use client';

import { useEffect, useState } from 'react';
import { 
  getDemandaById, 
  updateDemanda, 
  getArquivosByDemanda, 
  uploadArquivo,
  deleteDemanda,
  updateDemandaField,
  updateArquivo,
  deleteArquivoComStorage,
  type DemandaJuridica
} from '@/app/actions/juridico';
import { FileUpload } from '@/components/file-upload';
import { AISummaryButton } from '@/components/ai-summary-button';
import { AISearch } from '@/components/ai-search';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Trash2, 
  FileText,
  Loader2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EditableRow } from '@/components/editable-row';
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

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadArquivo(demandaId, formData);
    loadData();
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
                <EditableRow
                  label="Cliente"
                  value={demanda.cliente_nome}
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'cliente_nome', value);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Responsável"
                  value={demanda.responsavel}
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'responsavel', value);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Data de Solicitação"
                  value={demanda.data_solicitacao}
                  type="date"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'data_solicitacao', value || null);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Prazo"
                  value={demanda.prazo}
                  type="date"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'prazo', value || null);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Data de Entrega"
                  value={demanda.data_entrega}
                  type="date"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'data_entrega', value || null);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Data de Pagamento"
                  value={demanda.data_pagamento}
                  type="date"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'data_pagamento', value || null);
                    await loadData();
                  }}
                />
                <EditableRow
                  label="Data Fim de Contrato"
                  value={demanda.data_fim_contrato}
                  type="date"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'data_fim_contrato', value || null);
                    await loadData();
                  }}
                />
              </div>

              <div className="pt-4 border-t">
                <EditableRow
                  label="Observações"
                  value={demanda.observacoes}
                  type="textarea"
                  onSave={async (value) => {
                    await updateDemandaField(demandaId, 'observacoes', value || null);
                    await loadData();
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Arquivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload onUpload={handleUpload} maxSize={10} />
              
              {arquivos.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {arquivos.map((arquivo) => (
                    <div key={String(arquivo.id || '')} className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <EditableRow
                            label=""
                            value={String(arquivo.nome || '')}
                            onSave={async (value) => {
                              await updateArquivo(String(arquivo.id || ''), { nome: value });
                              await loadData();
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {typeof arquivo.storage_url === 'string' && arquivo.storage_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(String(arquivo.storage_url), '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja excluir este arquivo?')) {
                                await deleteArquivoComStorage(String(arquivo.id || ''));
                                await loadData();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {(() => {
                        const categoria = typeof arquivo.categoria === 'string' ? arquivo.categoria : null;
                        const descricao = typeof arquivo.descricao_ia === 'string' ? arquivo.descricao_ia : null;
                        return (
                          <>
                            {categoria && (
                              <Badge variant="default" className="w-fit">
                                {categoria}
                              </Badge>
                            )}
                            {descricao && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {descricao}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Arraste arquivos para a área acima para fazer upload
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
                  storageUrl={arquivo.storage_url ? String(arquivo.storage_url) : undefined}
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
