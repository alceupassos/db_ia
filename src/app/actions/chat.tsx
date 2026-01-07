'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { streamUI } from '@ai-sdk/rsc';
import { z } from 'zod';
import { KpiCard } from '@/components/kpi-card';
import { BIChart } from '@/components/bi-charts';
import { GlassTable } from '@/components/glass-table';
import { createClient } from '@supabase/supabase-js';

import { SyncStatusCard } from '@/components/sync-status';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function askCepalab(input: string, model: 'flash' | 'pro' = 'flash') {
    const modelId = 'gpt-4o';

    // Fetch knowledge base info to give context to the AI
    const { data: knowledge } = await supabase
        .from('ai_known_queries')
        .select('name, business_domain, explanation');

    const knowledgeContext = knowledge?.map(k =>
        `- [${k.business_domain}] ${k.name}: ${k.explanation}`
    ).join('\n') || 'Nenhum conhecimento prévio carregado.';

    const result = await streamUI({
        model: openai(modelId),
        prompt: input,
        system: `
      Você é o CEPALAB OS, a interface de comando do ERP SUPRA.
      
      INSTRUÇÕES CRÍTICAS:
      - Você NÃO deve gerar textos explicativos ou responder com código.
      - Sua única função é EXECUTAR ferramentas visuais (tools).
      - Use 'render_sync_status' para status/sync.
      - Use 'render_chart' para gráficos de BI.
      - NUNCA escreva algo como "render_chart(...)" no chat. Chame a função internamente.
      
      CONHECIMENTO ATUAL:
      ${knowledgeContext}
      `,
        toolChoice: 'required',
        text: ({ content, done }) => (
            <div className="text-white/70 font-mono text-sm tracking-wide max-w-xl">
                {content}
                {!done && <span className="animate-pulse">_</span>}
            </div>
        ),
        tools: {
            render_kpi: {
                description: 'COMMAND: Render a visual financial KPI card. Use this when the user asks for single metrics like revenue, total, or specific values.',
                inputSchema: z.object({
                    title: z.string().describe('Nome da métrica'),
                    value: z.number().describe('Valor numérico'),
                    trend: z.number().describe('Tendência percentual'),
                    isPositive: z.boolean().describe('Se a tendência é boa')
                }),
                generate: async (props: { title: string; value: number; trend: number; isPositive: boolean }) => <KpiCard {...props} />
            },
            render_chart: {
                description: 'COMMAND: Render BI charts (line, bar, area). Use this for historical data or comparisons.',
                inputSchema: z.object({
                    title: z.string().describe('Título do gráfico'),
                    type: z.enum(['line', 'bar', 'area']),
                    data: z.array(z.object({
                        name: z.string().describe('Label do eixo X (ex: data, categoria)'),
                        value: z.number().describe('Valor numérico')
                    }))
                }),
                generate: async (props: { title: string; type: 'line' | 'bar' | 'area'; data: { name: string; value: number }[] }) => <BIChart {...props} />
            },
            render_table: {
                description: 'COMMAND: Render a premium data table. Use this for lists of transactions, items, or detailed records.',
                inputSchema: z.object({
                    title: z.string().describe('Título da tabela'),
                    columns: z.array(z.object({
                        header: z.string(),
                        accessor: z.string()
                    })),
                    data: z.array(z.record(z.string(), z.unknown()))
                }),
                generate: async (props: { title: string; columns: { header: string; accessor: string }[]; data: Record<string, unknown>[] }) => <GlassTable {...props} />
            },
            render_sync_status: {
                description: 'COMMAND: Visualize ERP module synchronization status. Use this ONLY when the user asks for status, sync, or infrastructure health.',
                inputSchema: z.object({
                    modules: z.array(z.object({
                        name: z.string(),
                        status: z.enum(['pending', 'syncing', 'completed']),
                        progress: z.number()
                    })),
                    latency: z.number(),
                    lastScan: z.string()
                }),
                generate: async (props: { modules: { name: string; status: 'pending' | 'syncing' | 'completed'; progress: number }[]; latency: number; lastScan: string }) => <SyncStatusCard {...props} />
            },
            sync_erp_data: {
                description: 'COMMAND: Trigger a real-time ERP data sync bridge.',
                inputSchema: z.object({
                    module_name: z.string().describe('O nome da query/módulo (ex: agrc_conta_pagar)')
                }),
                generate: async ({ module_name }: { module_name: string }) => {
                    await supabase.from('sync_jobs').insert({ query_name: module_name, status: 'pending' });
                    return (
                        <div className="flex items-center gap-3 p-4 bg-neon/10 border border-neon/20 rounded-2xl animate-pulse">
                            <div className="w-2 h-2 bg-neon rounded-full" />
                            <span className="text-xs font-mono text-neon uppercase tracking-widest">
                                Ponte de Dados Ativa: Sincronizando {module_name}...
                            </span>
                        </div>
                    );
                }
            }
        }
    });

    return result.value;
}
