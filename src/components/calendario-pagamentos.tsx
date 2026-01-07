'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getDemandas, type DemandaJuridica } from '@/app/actions/juridico';

interface Evento {
  id: string;
  data: Date;
  tipo: 'pagamento' | 'fim_contrato' | 'entrega';
  demanda: string;
  cliente: string;
}

export function CalendarioPagamentos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [demandas, setDemandas] = useState<DemandaJuridica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDemandas() {
      try {
        const data = await getDemandas();
        setDemandas(data);
      } catch (error) {
        console.error('Erro ao carregar demandas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDemandas();
  }, []);

  const eventos = useMemo<Evento[]>(() => {
    const eventosList: Evento[] = [];
    
    demandas.forEach((demanda) => {
      if (demanda.data_pagamento) {
        eventosList.push({
          id: `${demanda.id}-pagamento`,
          data: new Date(demanda.data_pagamento),
          tipo: 'pagamento',
          demanda: demanda.demanda,
          cliente: demanda.cliente_nome,
        });
      }
      if (demanda.data_fim_contrato) {
        eventosList.push({
          id: `${demanda.id}-fim`,
          data: new Date(demanda.data_fim_contrato),
          tipo: 'fim_contrato',
          demanda: demanda.demanda,
          cliente: demanda.cliente_nome,
        });
      }
      if (demanda.data_entrega) {
        eventosList.push({
          id: `${demanda.id}-entrega`,
          data: new Date(demanda.data_entrega),
          tipo: 'entrega',
          demanda: demanda.demanda,
          cliente: demanda.cliente_nome,
        });
      }
    });
    
    return eventosList;
  }, [demandas]);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startingDayOfWeek = monthStart.getDay();

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventosForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return eventos.filter(evento => {
      return evento.data.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (tipo: Evento['tipo']) => {
    switch (tipo) {
      case 'pagamento':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'fim_contrato':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'entrega':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
    }
  };

  const getEventLabel = (tipo: Evento['tipo']) => {
    switch (tipo) {
      case 'pagamento':
        return 'Pagamento';
      case 'fim_contrato':
        return 'Fim Contrato';
      case 'entrega':
        return 'Entrega';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Pagamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-40 text-center capitalize">{monthName}</span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Dias do mês */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEventos = getEventosForDay(day);
              const isToday = 
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square border border-border rounded-lg p-1 relative cursor-pointer hover:bg-accent transition-colors',
                    isToday && 'ring-2 ring-primary'
                  )}
                  title={dayEventos.map(e => `${getEventLabel(e.tipo)}: ${e.demanda}`).join('\n')}
                >
                  <div className="text-xs font-medium mb-1">{day}</div>
                  <div className="space-y-0.5">
                    {dayEventos.slice(0, 2).map((evento) => (
                      <div
                        key={evento.id}
                        className={cn(
                          'text-[10px] px-1 py-0.5 rounded border truncate',
                          getEventColor(evento.tipo)
                        )}
                        title={`${getEventLabel(evento.tipo)}: ${evento.demanda} - ${evento.cliente}`}
                      >
                        {getEventLabel(evento.tipo)}
                      </div>
                    ))}
                    {dayEventos.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEventos.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50" />
              <span className="text-xs text-muted-foreground">Pagamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
              <span className="text-xs text-muted-foreground">Fim Contrato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
              <span className="text-xs text-muted-foreground">Entrega</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
