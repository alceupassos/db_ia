'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { DonutChart } from '@/components/charts/donut-chart';
import { GlowBarChart } from '@/components/charts/glow-bar-chart';
import { GradientAreaChart } from '@/components/charts/gradient-area-chart';
import {
  getDemandasPorStatus,
  getDemandasPorCliente,
  getArquivosPorCategoria,
  getEvolucaoMensal,
  getTimelineAtividades,
  getKPIs
} from '@/app/actions/juridico';
import { Loader2, TrendingUp, Users, FileText, Calendar } from 'lucide-react';
import { containerVariants, cardVariants, pageVariants } from '@/lib/animations';
// Removed COLORS constant - using chart components with built-in colors

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
    <motion.div 
      className="flex-1 space-y-6 p-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Dashboard Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Métricas e análises do sistema jurídico
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <KPICard
            title="Total de Demandas"
            value={kpis.total}
            icon={FileText}
            variant="default"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            title="Pendentes"
            value={kpis.pendentes}
            icon={Calendar}
            variant="warning"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            title="Em Andamento"
            value={kpis.emAndamento}
            icon={TrendingUp}
            variant="info"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            title="Concluídas"
            value={kpis.concluidos}
            icon={Users}
            variant="success"
          />
        </motion.div>
      </motion.div>

      {/* Gráficos principais */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Demandas por Status - Donut Chart */}
        <motion.div variants={cardVariants}>
          <GlowCard variant="gradient" glowColor="primary">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Demandas por Status</h3>
              <DonutChart 
                data={statusData.map(item => ({ name: item.status, value: item.count }))}
                showLabel={true}
              />
            </div>
          </GlowCard>
        </motion.div>

        {/* Top Clientes - Bar Chart */}
        <motion.div variants={cardVariants}>
          <GlowCard variant="gradient" glowColor="accent">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top 10 Clientes</h3>
              <GlowBarChart 
                data={clienteData.map(item => ({ name: item.cliente.substring(0, 15), count: item.count }))}
                dataKey="count"
                height={300}
              />
            </div>
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* Evolução Mensal */}
      <motion.div variants={cardVariants}>
        <GlowCard variant="gradient" glowColor="primary">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução Mensal de Demandas</h3>
            {evolucaoData.length > 0 ? (
              <GradientAreaChart
                data={evolucaoData.map(d => ({
                  name: new Date(d.mes + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
                  value: d.criadas,
                }))}
                dataKey="value"
                color="hsl(var(--glow-primary))"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </div>
        </GlowCard>
      </motion.div>

      {/* Arquivos por Categoria */}
      {categoriaData.length > 0 && (
        <motion.div variants={cardVariants}>
          <GlowCard variant="gradient" glowColor="success">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Arquivos por Categoria</h3>
              <GlowBarChart
                data={categoriaData.map(item => ({ name: item.categoria, count: item.count }))}
                dataKey="count"
                height={300}
              />
            </div>
          </GlowCard>
        </motion.div>
      )}

      {/* Timeline de Atividades */}
      <motion.div variants={cardVariants}>
        <GlowCard variant="gradient" glowColor="accent">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Atividades Recentes</h3>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0 group hover:bg-background/30 rounded-lg p-2 -mx-2 transition-all duration-300"
                >
                  <motion.div
                    className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"
                    animate={{
                      boxShadow: [
                        '0 0 8px hsl(var(--glow-primary) / 0.5)',
                        '0 0 12px hsl(var(--glow-primary) / 0.7)',
                        '0 0 8px hsl(var(--glow-primary) / 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.titulo}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.cliente} • {item.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(item.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
