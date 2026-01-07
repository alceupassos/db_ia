'use client';

import { useEffect, useState } from 'react';
import { 
  getDemandas, 
  getKPIs, 
  getUniqueResponsaveis, 
  getUniqueClientes,
  type DemandaJuridica,
  type DemandaFilters 
} from '@/app/actions/juridico';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AreaChartComponent } from '@/components/dashboard/area-chart';
import { ProgressRing } from '@/components/dashboard/progress-ring';
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
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function JuridicoDashboard() {
  const [demandas, setDemandas] = useState<DemandaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DemandaFilters>({});
  const [kpis, setKpis] = useState({ total: 0, pendentes: 0, emAndamento: 0, concluidos: 0 });
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    try {
      const [demandasData, kpisData, respData, clientesData] = await Promise.all([
        getDemandas(filters),
        getKPIs(),
        getUniqueResponsaveis(),
        getUniqueClientes()
      ]);
      setDemandas(demandasData);
      setKpis(kpisData);
      setResponsaveis(respData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm || undefined });
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

  // Dados mockados para gráficos (substituir com dados reais)
  const monthlyData = [
    { name: 'Jan', value: 45 },
    { name: 'Fev', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Abr', value: 61 },
    { name: 'Mai', value: 55 },
    { name: 'Jun', value: 67 },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das demandas jurídicas
          </p>
        </div>
        <Link href="/juridico/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Demanda
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Demandas"
          value={kpis.total}
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Pendentes"
          value={kpis.pendentes}
          icon={<AlertCircle className="h-4 w-4" />}
          trend={{ value: -5, isPositive: false }}
        />
        <KPICard
          title="Em Andamento"
          value={kpis.emAndamento}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Concluídos"
          value={kpis.concluidos}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts and Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChartComponent data={monthlyData} title="" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
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
            <div className="space-y-4">
              {demandas.slice(0, 10).map((demanda) => (
                <Link
                  key={demanda.id}
                  href={`/juridico/${demanda.id}`}
                  className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{demanda.demanda}</h3>
                        {getStatusBadge(demanda.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {demanda.cliente_nome}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {demanda.responsavel}
                        </div>
                        {demanda.data_solicitacao && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(demanda.data_solicitacao).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
