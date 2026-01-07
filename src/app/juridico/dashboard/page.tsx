'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/dashboard/area-chart';
import { KPICard } from '@/components/dashboard/kpi-card';
import {
  getDemandasPorStatus,
  getDemandasPorCliente,
  getArquivosPorCategoria,
  getEvolucaoMensal,
  getTimelineAtividades,
  getKPIs
} from '@/app/actions/juridico';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Loader2, TrendingUp, Users, FileText, Calendar } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<Array<{ status: string; count: number }>>([]);
  const [clienteData, setClienteData] = useState<Array<{ cliente: string; count: number }>>([]);
  const [categoriaData, setCategoriaData] = useState<Array<{ categoria: string; count: number }>>([]);
  const [evolucaoData, setEvolucaoData] = useState<Array<{ mes: string; criadas: number; concluidas: number }>>([]);
  const [timeline, setTimeline] = useState<Array<{ id: string; tipo: string; titulo: string; cliente: string; status: string; data: string; descricao: string }>>([]);
  const [kpis, setKpis] = useState({ total: 0, pendentes: 0, emAndamento: 0, concluidos: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [status, clientes, categorias, evolucao, atividades, kpiData] = await Promise.all([
        getDemandasPorStatus(),
        getDemandasPorCliente(),
        getArquivosPorCategoria(),
        getEvolucaoMensal(),
        getTimelineAtividades(),
        getKPIs()
      ]);

      setStatusData(status);
      setClienteData(clientes);
      setCategoriaData(categorias);
      setEvolucaoData(evolucao);
      setTimeline(atividades);
      setKpis(kpiData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h1>
        <p className="text-muted-foreground">
          Métricas e análises do sistema jurídico
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Demandas"
          value={kpis.total}
          icon={<FileText className="h-4 w-4" />}
        />
        <KPICard
          title="Pendentes"
          value={kpis.pendentes}
          icon={<Calendar className="h-4 w-4" />}
        />
        <KPICard
          title="Em Andamento"
          value={kpis.emAndamento}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Concluídas"
          value={kpis.concluidos}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Demandas por Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demandas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: { status?: string; count?: number; percent?: number }) => {
                    const status = entry.status || '';
                    const percent = entry.percent || 0;
                    return `${status}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clientes - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clienteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="cliente" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal de Demandas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucaoData.map(d => ({
              name: d.mes,
              criadas: d.criadas,
              concluidas: d.concluidas
            }))}>
              <defs>
                <linearGradient id="gradient-criadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradient-concluidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="criadas" stroke="#8884d8" fill="url(#gradient-criadas)" name="Criadas" />
              <Area type="monotone" dataKey="concluidas" stroke="#82ca9d" fill="url(#gradient-concluidas)" name="Concluídas" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Arquivos por Categoria */}
      {categoriaData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoriaData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.cliente} • {item.descricao}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.data).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
