'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getArquivosPool,
  deletarArquivoPool,
  type ArquivoPool
} from '@/app/actions/juridico';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Loader2, 
  Trash2, 
  Eye,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  FolderOpen,
  Image,
  FileIcon,
  File,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { ArquivoVinculacaoModal } from '@/components/arquivo-vinculacao-modal';
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
import { GlowCard } from '@/components/ui/glow-card';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/empty-state';

export default function PoolArquivosPage() {
  const [arquivos, setArquivos] = useState<ArquivoPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [selectedArquivo, setSelectedArquivo] = useState<ArquivoPool | null>(null);
  const [vinculacaoOpen, setVinculacaoOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArquivosPool({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        categoria: filterCategoria !== 'all' ? filterCategoria : undefined,
        search: searchTerm || undefined,
      });
      setArquivos(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategoria, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (arquivoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo do pool?')) return;
    try {
      await deletarArquivoPool(arquivoId);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analisado':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Analisado
          </Badge>
        );
      case 'vinculado':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            Vinculado
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Aguardando Análise
          </Badge>
        );
    }
  };

  const categorias = Array.from(
    new Set(
      arquivos
        .map(a => a.categoria_usuario || a.categoria)
        .filter((c): c is string => typeof c === 'string' && c.length > 0)
    )
  ).sort();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pool de Arquivos</h1>
          <p className="text-muted-foreground">
            Arquivos não vinculados - Analise e vincule a demandas
          </p>
        </div>
        <Link href="/juridico/arquivos">
          <Button variant="outline">
            Ver Arquivos Vinculados
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <GlowCard variant="gradient" glowColor="accent">
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="aguardando_analise">Aguardando Análise</SelectItem>
                <SelectItem value="analisado">Analisado</SelectItem>
                <SelectItem value="vinculado">Vinculado</SelectItem>
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
      </GlowCard>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : arquivos.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-16 w-16" />}
          title="Nenhum arquivo no pool"
          description="Faça upload de arquivos para que apareçam aqui. Após a análise pela IA, você poderá vincular a demandas."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {arquivos.map((arquivo, index) => (
            <motion.div
              key={arquivo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlowCard variant="gradient" glowColor="primary" className="hover:shadow-glow-md transition-all">
                <CardContent className="pt-6">
                  {/* Cabeçalho: Ícone, Nome e Status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                      {getFileIcon(arquivo.mime_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium truncate flex-1" title={arquivo.nome}>
                          {arquivo.nome}
                        </h3>
                        {getStatusBadge(arquivo.status)}
                      </div>
                      {arquivo.demanda_id && (
                        <Link 
                          href={`/juridico/${arquivo.demanda_id}`}
                          className="text-xs text-primary hover:underline font-medium mt-1 flex items-center gap-1"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Vinculado a demanda
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Categoria e Descrição */}
                  <div className="flex gap-4 mb-3">
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {(arquivo.categoria_usuario || arquivo.categoria) && (
                        <Badge variant="default" className="text-xs w-fit">
                          {arquivo.categoria_usuario || arquivo.categoria}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {arquivo.descricao_ia ? (
                        <p className="text-xs text-muted-foreground line-clamp-3" title={arquivo.descricao_ia}>
                          {arquivo.descricao_ia}
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
                        setVinculacaoOpen(true);
                      }}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Vincular
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedArquivo(arquivo);
                        setViewerOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
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
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Vinculação */}
      <ArquivoVinculacaoModal
        arquivo={selectedArquivo}
        open={vinculacaoOpen}
        onOpenChange={setVinculacaoOpen}
        onSuccess={loadData}
      />

      {/* File Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedArquivo?.nome}</DialogTitle>
          </DialogHeader>
          {selectedArquivo && (
            <FileViewer arquivo={{
              id: selectedArquivo.id,
              nome: selectedArquivo.nome,
              url: selectedArquivo.storage_url || undefined,
              mime_type: selectedArquivo.mime_type ?? null,
              resumo_ia: null
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
            <FileChat arquivo={{
              id: selectedArquivo.id,
              nome: selectedArquivo.nome,
              resumo_ia: selectedArquivo.descricao_ia || null,
              storage_url: selectedArquivo.storage_url || null
            }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
