'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getDemandas,
  getArquivosByDemanda,
  uploadArquivo,
  deleteArquivoComStorage,
  type DemandaJuridica
} from '@/app/actions/juridico';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Search, 
  Loader2, 
  Trash2, 
  Eye,
  MessageSquare,
  FolderOpen,
  Image,
  FileIcon,
  File,
  Download
} from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { FileViewer } from '@/components/file-viewer';
import { FileChat } from '@/components/file-chat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ArquivoComDemanda {
  id: string;
  nome: string;
  tipo: string | null;
  supabase_path: string | null;
  storage_url: string | null;
  mime_type: string | null;
  resumo_ia: string | null;
  categoria: string | null;
  descricao_ia: string | null;
  demanda_id: string;
  demanda_nome?: string;
  created_at: string;
}

export default function ArquivosPage() {
  const [arquivos, setArquivos] = useState<ArquivoComDemanda[]>([]);
  const [demandas, setDemandas] = useState<DemandaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDemanda, setFilterDemanda] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [selectedArquivo, setSelectedArquivo] = useState<ArquivoComDemanda | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadDemandaId, setUploadDemandaId] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const demandasData = await getDemandas();
      setDemandas(demandasData);

      // Carregar arquivos de todas as demandas
      const allArquivos: ArquivoComDemanda[] = [];
      for (const demanda of demandasData) {
        const arquivosData = await getArquivosByDemanda(demanda.id);
        arquivosData.forEach((arq: Record<string, unknown>) => {
          allArquivos.push({
            id: String(arq.id || ''),
            nome: String(arq.nome || ''),
            tipo: arq.tipo ? String(arq.tipo) : null,
            supabase_path: arq.supabase_path ? String(arq.supabase_path) : null,
            storage_url: arq.storage_url ? String(arq.storage_url) : null,
            mime_type: arq.mime_type ? String(arq.mime_type) : null,
            resumo_ia: arq.resumo_ia ? String(arq.resumo_ia) : null,
            categoria: arq.categoria ? String(arq.categoria) : null,
            descricao_ia: arq.descricao_ia ? String(arq.descricao_ia) : null,
            demanda_id: demanda.id,
            demanda_nome: demanda.demanda,
            created_at: String(arq.created_at || ''),
          });
        });
      }
      setArquivos(allArquivos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (file: File) => {
    if (!uploadDemandaId) {
      throw new Error('Selecione uma demanda para vincular o arquivo');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    await uploadArquivo(uploadDemandaId, formData);
    loadData();
  };

  const handleDelete = async (arquivoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    try {
      await deleteArquivoComStorage(arquivoId);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert('Erro ao excluir arquivo');
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileIcon className="h-5 w-5" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-blue-400" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-5 w-5 text-blue-500" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const categorias = Array.from(new Set(arquivos.map(a => a.categoria).filter((c): c is string => typeof c === 'string' && c.length > 0))).sort();

  const filteredArquivos = arquivos.filter(arq => {
    const matchesSearch = arq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arq.demanda_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arq.descricao_ia?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDemanda = filterDemanda === 'all' || arq.demanda_id === filterDemanda;
    const matchesTipo = filterTipo === 'all' || 
      (filterTipo === 'pdf' && arq.mime_type?.includes('pdf')) ||
      (filterTipo === 'image' && arq.mime_type?.includes('image')) ||
      (filterTipo === 'doc' && (arq.mime_type?.includes('word') || arq.mime_type?.includes('document')));
    const matchesCategoria = filterCategoria === 'all' || arq.categoria === filterCategoria;
    return matchesSearch && matchesDemanda && matchesTipo && matchesCategoria;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arquivos</h1>
          <p className="text-muted-foreground">
            Gerencie contratos, documentos e arquivos das demandas
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex-1">
            <Select value={uploadDemandaId} onValueChange={setUploadDemandaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a demanda para vincular o arquivo" />
              </SelectTrigger>
              <SelectContent>
                {demandas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.demanda} - {d.cliente_nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <FileUpload 
            onUpload={handleUpload}
            disabled={!uploadDemandaId}
            maxSize={10}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDemanda} onValueChange={setFilterDemanda}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por demanda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as demandas</SelectItem>
                {demandas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.demanda.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Imagens</SelectItem>
                <SelectItem value="doc">Documentos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArquivos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione uma demanda e arraste um arquivo para fazer upload
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArquivos.map((arquivo) => (
            <Card key={arquivo.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {getFileIcon(arquivo.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={arquivo.nome}>
                      {arquivo.nome}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {arquivo.demanda_nome}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {arquivo.categoria && (
                        <Badge variant="default" className="text-xs">
                          {arquivo.categoria}
                        </Badge>
                      )}
                      {arquivo.tipo && (
                        <Badge variant="outline" className="text-xs">
                          {arquivo.tipo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {arquivo.descricao_ia && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2" title={arquivo.descricao_ia}>
                    {arquivo.descricao_ia}
                  </p>
                )}
                {arquivo.resumo_ia && !arquivo.descricao_ia && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {arquivo.resumo_ia}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedArquivo(arquivo);
                      setViewerOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedArquivo(arquivo);
                      setChatOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Perguntar
                  </Button>
                  {arquivo.storage_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(arquivo.storage_url!, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(arquivo.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* File Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedArquivo?.nome}</DialogTitle>
          </DialogHeader>
          {selectedArquivo && (
            <FileViewer arquivo={{
              ...selectedArquivo,
              url: selectedArquivo.storage_url || undefined
            }} />
          )}
        </DialogContent>
      </Dialog>

      {/* File Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Perguntar sobre: {selectedArquivo?.nome}</DialogTitle>
          </DialogHeader>
          {selectedArquivo && (
            <FileChat arquivo={selectedArquivo} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
