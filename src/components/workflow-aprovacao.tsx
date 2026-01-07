'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  aprovarArquivo,
  enviarParaRevisao,
  getHistoricoAprovacao,
} from '@/app/actions/juridico';

interface WorkflowAprovacaoProps {
  arquivoId: string;
  statusAprovacao?: string | null;
  onStatusChange?: () => void;
}

export function WorkflowAprovacao({ arquivoId, statusAprovacao, onStatusChange }: WorkflowAprovacaoProps) {
  const [status, setStatus] = useState(statusAprovacao || 'RASCUNHO');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'aprovar' | 'rejeitar' | 'revisao'>('aprovar');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<Array<{
    id: string;
    status_anterior: string;
    status_novo: string;
    comentario: string | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    setStatus(statusAprovacao || 'RASCUNHO');
  }, [statusAprovacao]);

  useEffect(() => {
    loadHistorico();
  }, [arquivoId]);

  async function loadHistorico() {
    try {
      const hist = await getHistoricoAprovacao(arquivoId);
      setHistorico(hist || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  const handleAction = async () => {
    setLoading(true);
    try {
      if (dialogAction === 'revisao') {
        await enviarParaRevisao(arquivoId);
        setStatus('EM_REVISAO');
      } else {
        await aprovarArquivo(
          arquivoId,
          dialogAction === 'aprovar' ? 'APROVADO' : 'REJEITADO',
          comentario || undefined
        );
        setStatus(dialogAction === 'aprovar' ? 'APROVADO' : 'REJEITADO');
      }
      
      setDialogOpen(false);
      setComentario('');
      await loadHistorico();
      onStatusChange?.();
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      alert('Erro ao processar ação');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'RASCUNHO':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'EM_REVISAO':
        return <Badge variant="default" className="bg-yellow-500">Em Revisão</Badge>;
      case 'APROVADO':
        return <Badge variant="default" className="bg-green-500">Aprovado</Badge>;
      case 'REJEITADO':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Status de Aprovação:</span>
          {getStatusBadge()}
        </div>
        
        {status === 'RASCUNHO' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDialogAction('revisao');
              setDialogOpen(true);
            }}
          >
            <Clock className="h-4 w-4 mr-1" />
            Enviar para Revisão
          </Button>
        )}
        
        {status === 'EM_REVISAO' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setDialogAction('aprovar');
                setDialogOpen(true);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setDialogAction('rejeitar');
                setDialogOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}
      </div>

      {historico.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Histórico de Aprovações
          </h4>
          <div className="space-y-2 border rounded-lg p-3">
            {historico.map((item) => (
              <div key={item.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {item.status_anterior} → {item.status_novo}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {item.comentario && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.comentario}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'aprovar' && 'Aprovar Documento'}
              {dialogAction === 'rejeitar' && 'Rejeitar Documento'}
              {dialogAction === 'revisao' && 'Enviar para Revisão'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'aprovar' && 'Confirme a aprovação deste documento.'}
              {dialogAction === 'rejeitar' && 'Informe o motivo da rejeição.'}
              {dialogAction === 'revisao' && 'Enviar este documento para revisão.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(dialogAction === 'aprovar' || dialogAction === 'rejeitar') && (
              <div>
                <label className="text-sm font-medium">Comentário (opcional)</label>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder={
                    dialogAction === 'aprovar'
                      ? 'Adicione observações sobre a aprovação...'
                      : 'Informe o motivo da rejeição...'
                  }
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              variant={dialogAction === 'rejeitar' ? 'destructive' : 'default'}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
