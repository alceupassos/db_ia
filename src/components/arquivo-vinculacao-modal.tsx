'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ArquivoPool } from '@/app/actions/juridico';
import { getDemandas, type DemandaJuridica } from '@/app/actions/juridico';
import { atualizarArquivoPool, vincularArquivoPoolADemanda } from '@/app/actions/juridico';

const CATEGORIAS = [
  'Contrato',
  'Procuração',
  'Parecer',
  'Petição',
  'Acordo',
  'Notificação',
  'Certidão',
  'Outros'
];

interface ArquivoVinculacaoModalProps {
  arquivo: ArquivoPool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ArquivoVinculacaoModal({
  arquivo,
  open,
  onOpenChange,
  onSuccess
}: ArquivoVinculacaoModalProps) {
  const [demandas, setDemandas] = useState<DemandaJuridica[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoria, setCategoria] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [demandaId, setDemandaId] = useState<string>('');

  useEffect(() => {
    if (open && arquivo) {
      // Carregar demandas
      loadDemandas();
      
      // Preencher campos com dados do arquivo
      setCategoria(arquivo.categoria_usuario || arquivo.categoria || '');
      setDescricao(arquivo.descricao_ia || '');
      setDemandaId(arquivo.demanda_id || '');
    }
  }, [open, arquivo]);

  const loadDemandas = async () => {
    setLoading(true);
    try {
      const data = await getDemandas();
      setDemandas(data);
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!arquivo) return;

    setSaving(true);
    try {
      // Atualizar categoria e descrição se necessário
      if (categoria !== arquivo.categoria_usuario || descricao !== arquivo.descricao_ia) {
        await atualizarArquivoPool(arquivo.id, {
          categoria_usuario: categoria || undefined,
          descricao_ia: descricao || undefined,
        });
      }

      // Vincular a demanda se selecionada
      if (demandaId && demandaId !== arquivo.demanda_id) {
        await vincularArquivoPoolADemanda(arquivo.id, demandaId);
        onSuccess?.();
        onOpenChange(false);
      } else if (!demandaId && categoria) {
        // Apenas salvar categoria sem vincular
        onSuccess?.();
        onOpenChange(false);
      } else {
        // Sem mudanças ou sem categoria selecionada
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  if (!arquivo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Vincular Arquivo</span>
            {arquivo.status === 'analisado' && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Analisado
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure a categoria e vincule este arquivo a uma demanda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do arquivo */}
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="font-medium">{arquivo.nome}</p>
              {arquivo.mime_type && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tipo: {arquivo.mime_type}
                </p>
              )}
            </div>
          </div>

          {/* Categoria sugerida pela IA */}
          {arquivo.categoria && (
            <div className="space-y-2">
              <Label>Categoria Sugerida pela IA</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{arquivo.categoria}</Badge>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Você pode editar abaixo
                </span>
              </div>
            </div>
          )}

          {/* Seleção de categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A categoria ajuda a organizar e buscar documentos
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do documento (gerada automaticamente pela IA)"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Você pode editar a descrição gerada pela IA
            </p>
          </div>

          {/* Vincular a demanda */}
          <div className="space-y-2">
            <Label htmlFor="demanda">Vincular a Demanda (Opcional)</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={demandaId} onValueChange={setDemandaId}>
                <SelectTrigger id="demanda">
                  <SelectValue placeholder="Selecione uma demanda ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (manter no pool)</SelectItem>
                  {demandas.map((demanda) => (
                    <SelectItem key={demanda.id} value={demanda.id}>
                      {demanda.demanda} - {demanda.cliente_nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Se não vincular agora, o arquivo permanecerá no pool para vincular depois
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !categoria}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : demandaId ? (
              'Salvar e Vincular'
            ) : (
              'Salvar Categoria'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
