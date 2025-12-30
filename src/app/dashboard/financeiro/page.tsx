'use client';

import { KpiCard } from '@/components/kpi-card';
import { BIChart } from '@/components/bi-charts';
import { GlassTable } from '@/components/glass-table';
import { LayoutDashboard, Filter, Download } from 'lucide-react';

const MOCK_DATA = [
    { name: 'Jan', value: 450000 },
    { name: 'Fev', value: 520000 },
    { name: 'Mar', value: 480000 },
    { name: 'Abr', value: 610000 },
    { name: 'Mai', value: 590000 },
    { name: 'Jun', value: 720000 },
];

const TABLE_DATA = [
    { id: 1, fornecedor: 'AWS Cloud Services', valor: 12500, status: 'Pago', data: '2025-12-28' },
    { id: 2, fornecedor: 'Google Workspace', valor: 4200, status: 'Pendente', data: '2025-12-29' },
    { id: 3, fornecedor: 'Microsoft Azure', valor: 8900, status: 'Aguardando', data: '2025-12-30' },
    { id: 4, fornecedor: 'Oracle Cloud', valor: 15600, status: 'Pago', data: '2025-12-25' },
];

export default function FinanceiroPage() {
    return (
        <div className="min-h-screen bg-void text-white p-8">
            {/* Header Section */}
            <header className="flex justify-between items-end mb-12">
                <div>
                    <div className="flex items-center gap-2 text-neon mb-2">
                        <LayoutDashboard size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Dashboard Alpha</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter">Financeiro <span className="text-white/30">/ Overview</span></h1>
                </div>

                <div className="flex gap-4">
                    <button className="bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-2 transition-all font-bold text-sm">
                        <Filter size={16} /> Filtros
                    </button>
                    <button className="bg-neon text-white px-6 py-2.5 rounded-full flex items-center gap-2 transition-all font-bold text-sm neon-glow">
                        <Download size={16} /> Exportar
                    </button>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <KpiCard title="Faturamento Bruto" value={1284500} trend={12.4} isPositive={true} />
                <KpiCard title="Despesas Operacionais" value={452300} trend={-3.2} isPositive={true} />
                <KpiCard title="Lucro Líquido" value={832200} trend={8.7} isPositive={true} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <BIChart
                        title="Fluxo de Receita (Mensal)"
                        type="area"
                        data={MOCK_DATA}
                        color="#a855f7"
                    />
                    <BIChart
                        title="Distribuição de Custos"
                        type="bar"
                        data={[
                            { name: 'Infra', value: 35000 },
                            { name: 'Salários', value: 85000 },
                            { name: 'Mkt', value: 12000 },
                            { name: 'Geral', value: 18000 },
                        ]}
                        color="#3b82f6"
                    />
                </div>

                <div className="flex flex-col">
                    <GlassTable
                        title="Contas a Pagar Recentes"
                        columns={[
                            { header: 'Fornecedor', accessor: 'fornecedor' },
                            { header: 'Valor', accessor: 'valor' },
                            { header: 'Status', accessor: 'status' },
                            { header: 'Vencimento', accessor: 'data' },
                        ]}
                        data={TABLE_DATA}
                    />
                </div>
            </div>
        </div>
    );
}
