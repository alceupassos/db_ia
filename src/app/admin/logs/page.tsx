'use client';

import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Loader2, Download, Calendar, Activity } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';
import { EmptyState } from '@/components/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase-client';

interface Log {
  id: string;
  usuario_id: string | null;
  acao: string;
  tipo: string;
  descricao: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  usuario?: {
    nome_completo: string;
    email: string;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filterTipo]);

  async function loadLogs() {
    setLoading(true);
    try {
      // Nota: Precisa criar tabela log_acoes se não existir
      // Por enquanto, simulando dados de demandas e outras ações
      const { data: demandas, error } = await supabase
        .from('demandas_juridicas')
        .select('id, demanda, created_at, updated_at, created_by, updated_by')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transformar em logs (simulado)
      const logsData: Log[] = (demandas || []).map(d => ({
        id: d.id,
        usuario_id: d.updated_by || d.created_by,
        acao: 'demanda_atualizada',
        tipo: 'demanda',
        descricao: `Demanda "${d.demanda}" foi atualizada`,
        metadata: null,
        ip_address: null,
        user_agent: null,
        created_at: d.updated_at || d.created_at,
      }));

      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || log.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Acesso</h1>
          <p className="text-muted-foreground">Histórico de ações do sistema</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <GlowCard variant="gradient" glowColor="accent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="demanda">Demandas</SelectItem>
                <SelectItem value="arquivo">Arquivos</SelectItem>
                <SelectItem value="usuario">Usuários</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlowCard>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Nenhum log encontrado"
          description="Os logs de ações aparecerão aqui"
        />
      ) : (
        <GlowCard variant="gradient" glowColor="primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.descricao || log.acao}</span>
                      <Badge variant="outline">{log.tipo}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlowCard>
      )}
    </div>
  );
}
