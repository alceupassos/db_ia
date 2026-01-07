'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Notificacao {
  id: string;
  tipo: 'prazo' | 'entrega' | 'fim_contrato' | 'pagamento';
  titulo: string;
  descricao: string;
  data: string;
  diasRestantes: number;
  urgencia: 'baixa' | 'media' | 'alta';
}

export function NotificacoesBadge() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotificacoes();
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadNotificacoes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotificacoes() {
    try {
      const response = await fetch('/api/juridico/notificacoes');
      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.notificacoes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'prazo':
        return <Clock className="h-4 w-4" />;
      case 'entrega':
        return <Calendar className="h-4 w-4" />;
      case 'fim_contrato':
        return <AlertCircle className="h-4 w-4" />;
      case 'pagamento':
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getUrgenciaColor = (urgencia: Notificacao['urgencia']) => {
    switch (urgencia) {
      case 'alta':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'media':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'baixa':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const notificacoesUrgentes = notificacoes.filter(n => n.urgencia === 'alta').length;
  const total = notificacoes.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {total > 9 ? '9+' : total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {notificacoesUrgentes > 0 && (
            <p className="text-sm text-muted-foreground">
              {notificacoesUrgentes} urgente{notificacoesUrgentes > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notif) => (
                <Link
                  key={notif.id}
                  href={`/juridico/${notif.id.split('-')[0]}`}
                  onClick={() => setOpen(false)}
                  className="block p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
                      getUrgenciaColor(notif.urgencia)
                    )}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notif.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.descricao}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getUrgenciaColor(notif.urgencia))}
                        >
                          {notif.diasRestantes === 0 
                            ? 'Hoje' 
                            : notif.diasRestantes === 1 
                            ? 'Amanhã' 
                            : `${notif.diasRestantes} dias`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notif.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
