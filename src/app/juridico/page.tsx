'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getDemandas, 
  getKPIs, 
  deleteDemanda,
  type DemandaJuridica,
  type DemandaFilters,
  getEvolucaoMensal
} from '@/app/actions/juridico';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { CalendarioPagamentos } from '@/components/calendario-pagamentos';
import { GradientAreaChart } from '@/components/charts/gradient-area-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Calendar, 
  User,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { ExportButton } from '@/components/export-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function JuridicoDashboard() {
  const router = useRouter();
  const [demandas, setDemandas] = useState<DemandaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DemandaFilters>({});
  const [kpis, setKpis] = useState({ total: 0, pendentes: 0, emAndamento: 0, concluidos: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [demandaToDelete, setDemandaToDelete] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Array<{ name: string; value: number }>>([]);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [demandasData, kpisData, evolucao] = await Promise.all([
        getDemandas(filters),
        getKPIs(),
        getEvolucaoMensal()
      ]);
      setDemandas(demandasData);
      setKpis(kpisData);
      
      // Formatar dados mensais para o gráfico
      const formattedMonthly = evolucao.map(item => ({
        name: new Date(item.mes + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        value: item.criadas
      }));
      setMonthlyData(formattedMonthly);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm || undefined });
  };

  const handleEdit = (demandaId: string) => {
    router.push(`/juridico/${demandaId}`);
  };

  const handleDeleteClick = (demandaId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDemandaToDelete(demandaId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!demandaToDelete) return;
    try {
      await deleteDemanda(demandaToDelete);
      setDemandas(demandas.filter(d => d.id !== demandaToDelete));
      setDeleteDialogOpen(false);
      setDemandaToDelete(null);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir demanda:', error);
      alert('Erro ao excluir demanda');
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


  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das demandas jurídicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <Link href="/juridico/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Demanda
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Demandas"
            value={kpis.total}
            icon={FileText}
            variant="default"
          />
        <KPICard
          title="Pendentes"
          value={kpis.pendentes}
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="Em Andamento"
          value={kpis.emAndamento}
          icon={Clock}
          variant="info"
        />
        <KPICard
          title="Concluídos"
          value={kpis.concluidos}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Charts, Calendar and Progress */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-10">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <GradientAreaChart
                data={monthlyData}
                dataKey="value"
                color="hsl(var(--primary))"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Concluídos</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.concluidos} de {kpis.total} demandas
                  </p>
                </div>
                <ProgressRing 
                  value={kpis.total > 0 ? Math.round((kpis.concluidos / kpis.total) * 100) : 0}
                  color="hsl(var(--success))"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Em Andamento</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.emAndamento} demandas ativas
                  </p>
                </div>
                <ProgressRing 
                  value={kpis.total > 0 ? Math.round((kpis.emAndamento / kpis.total) * 100) : 0}
                  color="hsl(var(--warning))"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Pendentes</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.pendentes} aguardando
                  </p>
                </div>
                <ProgressRing 
                  value={kpis.total > 0 ? Math.round((kpis.pendentes / kpis.total) * 100) : 0}
                  color="hsl(var(--error))"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <CalendarioPagamentos />
        </div>
      </div>

      {/* Demandas List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demandas Recentes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 pl-8"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : demandas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma demanda encontrada</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {demandas.slice(0, 10).map((demanda, index) => {
                const statusColors = {
                  'CONCLUÍDO': 'border-l-emerald-500',
                  'EM ANDAMENTO': 'border-l-amber-500',
                  'PENDENTE': 'border-l-rose-500',
                  'Cancelado': 'border-l-muted',
                };
                const statusColor = statusColors[demanda.status as keyof typeof statusColors] || 'border-l-primary';
                
                return (
                  <motion.div
                    key={demanda.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group relative rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all duration-300",
                      "hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                      "border-l-2",
                      statusColor
                    )}
                  >
                    <Link
                      href={`/juridico/${demanda.id}`}
                      className="flex-1 space-y-3 block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                          {demanda.demanda}
                        </h3>
                        {getStatusBadge(demanda.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {demanda.cliente_nome}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          {demanda.responsavel}
                        </div>
                        {demanda.data_solicitacao && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(demanda.data_solicitacao).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(demanda.id);
                        }}
                        className="h-7 w-7"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(demanda.id, e);
                        }}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
