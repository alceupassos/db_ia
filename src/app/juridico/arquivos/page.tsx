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
  Download,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/file-upload';
import { FileViewer } from '@/components/file-viewer';
import { FileChat } from '@/components/file-chat';
import { ArquivoVinculacaoModal } from '@/components/arquivo-vinculacao-modal';
import { uploadArquivoParaPool, getArquivosPool, type ArquivoPool } from '@/app/actions/juridico';
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
  const [uploadMode, setUploadMode] = useState<'demanda' | 'pool'>('pool'); // Modo padrão: pool
  const [arquivoPoolParaVinculacao, setArquivoPoolParaVinculacao] = useState<ArquivoPool | null>(null);
  const [vinculacaoModalOpen, setVinculacaoModalOpen] = useState(false);

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
    if (uploadMode === 'demanda') {
      if (!uploadDemandaId) {
        throw new Error('Selecione uma demanda para vincular o arquivo');
      }
      const formData = new FormData();
      formData.append('file', file);
      await uploadArquivo(uploadDemandaId, formData);
      loadData();
    } else {
      // Modo pool
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadArquivoParaPool(formData);
        // Não recarregar dados aqui, modal será aberto após análise
        return result;
      } catch (error) {
        console.error('Erro ao fazer upload para pool:', error);
        
        // Verificar diferentes tipos de erro relacionados à tabela pool
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes('arquivos_pool') || 
          errorMessage.includes('PGRST205') ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('not found')
        ) {
          throw new Error('Funcionalidade de pool não disponível. Execute a migration 014_arquivos_pool.sql no Supabase ou entre em contato com o administrador.');
        }
        
        // Re-throw outros erros para serem tratados pelo componente
        throw error;
      }
    }
  };

  const handleAnalysisComplete = async (arquivoId: string) => {
    // Buscar arquivo do pool para abrir modal de vinculação
    try {
      const arquivosPool = await getArquivosPool();
      if (arquivosPool && arquivosPool.length > 0) {
        const arquivo = arquivosPool.find(a => a.id === arquivoId);
        if (arquivo) {
          setArquivoPoolParaVinculacao(arquivo);
          setVinculacaoModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar arquivo do pool:', error);
      // Se a tabela não existe, não mostrar erro ao usuário, apenas logar
      // O arquivo já foi feito upload no storage, apenas não foi salvo no pool
      // Usuário pode usar o modo "Vincular Direto a Demanda" como alternativa
    }
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
    if (!mimeType) return <FileIcon className="h-5 w-5" aria-label="Arquivo" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" aria-label="PDF" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-blue-400" aria-label="Imagem" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-5 w-5 text-blue-500" aria-label="Documento" />;
    return <FileIcon className="h-5 w-5" aria-label="Arquivo" />;
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
          {/* Modo de Upload */}
          <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => {
                setUploadMode('pool');
                setUploadDemandaId('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                uploadMode === 'pool'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload para Pool (Recomendado)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('demanda')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                uploadMode === 'demanda'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vincular Direto a Demanda
            </button>
          </div>

          {uploadMode === 'demanda' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Modo Pool:</strong> O arquivo será analisado pela IA e você poderá escolher a categoria e vincular a demanda depois.
                </p>
              </div>
              <FileUpload 
                onUpload={handleUpload}
                disabled={false}
                maxSize={10}
                usePool={true}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Link para Pool */}
      <Card>
        <CardContent className="pt-6">
          <Link href="/juridico/arquivos/pool">
            <Button variant="outline" className="w-full">
              <FolderOpen className="h-4 w-4 mr-2" />
              Ver Pool de Arquivos Não Vinculados
            </Button>
          </Link>
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
                {/* Cabeçalho: Ícone, Nome e Badge Incluído */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                    {getFileIcon(arquivo.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium truncate flex-1" title={arquivo.nome}>
                        {arquivo.nome}
                      </h3>
                      {arquivo.descricao_ia && (
                        <Badge variant="default" className="text-xs flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Incluído
                        </Badge>
                      )}
                    </div>
                    {/* Demanda vinculada destacada */}
                    {arquivo.demanda_nome && (
                      <Link 
                        href={`/juridico/${arquivo.demanda_id}`}
                        className="text-xs text-primary hover:underline font-medium mt-1 flex items-center gap-1 group"
                      >
                        <LinkIcon className="h-3 w-3" />
                        <span className="truncate">{arquivo.demanda_nome}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Layout horizontal: Categoria/Tipo à esquerda, Descrição à direita */}
                <div className="flex gap-4 mb-3">
                  {/* Coluna esquerda: Badges de categoria e tipo */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {arquivo.categoria && (
                      <Badge variant="default" className="text-xs w-fit">
                        {arquivo.categoria}
                      </Badge>
                    )}
                    {arquivo.tipo && (
                      <Badge variant="outline" className="text-xs w-fit">
                        {arquivo.tipo}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Coluna direita: Descrição */}
                  <div className="flex-1 min-w-0">
                    {arquivo.descricao_ia ? (
                      <p className="text-xs text-muted-foreground line-clamp-3" title={arquivo.descricao_ia}>
                        {arquivo.descricao_ia}
                      </p>
                    ) : arquivo.resumo_ia ? (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {arquivo.resumo_ia}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Aguardando análise...
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 pt-3 border-t">
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

      {/* Modal de Vinculação (para arquivos do pool) */}
      <ArquivoVinculacaoModal
        arquivo={arquivoPoolParaVinculacao}
        open={vinculacaoModalOpen}
        onOpenChange={setVinculacaoModalOpen}
        onSuccess={() => {
          loadData();
          setArquivoPoolParaVinculacao(null);
        }}
      />
    </div>
  );
}
