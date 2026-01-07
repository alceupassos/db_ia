'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DemandaJuridica {
  id: string;
  cliente_id: string | null;
  cliente_nome: string;
  demanda: string;
  responsavel: string;
  data_solicitacao: string | null;
  prazo: string | null;
  data_entrega: string | null;
  status: 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'Cancelado';
  observacoes: string | null;
  documentos_assinados: string;
  created_at: string;
  updated_at: string;
}

export interface DemandaFilters {
  status?: string;
  responsavel?: string;
  cliente?: string;
  search?: string;
}

export async function getDemandas(filters?: DemandaFilters) {
  let query = supabase
    .from('demandas_juridicas')
    .select('*')
    .order('data_solicitacao', { ascending: false, nullsFirst: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.responsavel && filters.responsavel !== 'all') {
    query = query.eq('responsavel', filters.responsavel);
  }

  if (filters?.cliente && filters.cliente !== 'all') {
    query = query.eq('cliente_nome', filters.cliente);
  }

  if (filters?.search) {
    query = query.or(
      `demanda.ilike.%${filters.search}%,cliente_nome.ilike.%${filters.search}%,observacoes.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as DemandaJuridica[];
}

export async function getDemandaById(id: string) {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as DemandaJuridica;
}

export async function createDemanda(demanda: Omit<DemandaJuridica, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .insert(demanda)
    .select()
    .single();

  if (error) throw error;
  return data as DemandaJuridica;
}

export async function updateDemanda(id: string, updates: Partial<DemandaJuridica>) {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as DemandaJuridica;
}

export async function deleteDemanda(id: string) {
  const { error } = await supabase
    .from('demandas_juridicas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getKPIs() {
  const { data: all } = await supabase.from('demandas_juridicas').select('status');
  
  if (!all) return { total: 0, pendentes: 0, emAndamento: 0, concluidos: 0 };

  const total = all.length;
  const pendentes = all.filter(d => d.status === 'PENDENTE').length;
  const emAndamento = all.filter(d => d.status === 'EM ANDAMENTO').length;
  const concluidos = all.filter(d => d.status === 'CONCLUÍDO').length;

  return { total, pendentes, emAndamento, concluidos };
}

export async function getUniqueResponsaveis() {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('responsavel')
    .order('responsavel');

  if (error) throw error;
  const unique = [...new Set(data.map(d => d.responsavel))];
  return unique.filter(Boolean);
}

export async function getUniqueClientes() {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('cliente_nome')
    .order('cliente_nome');

  if (error) throw error;
  const unique = [...new Set(data.map(d => d.cliente_nome))];
  return unique.filter(Boolean);
}

export async function getArquivosByDemanda(demandaId: string) {
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .select('*')
    .eq('demanda_id', demandaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function vincularArquivo(demandaId: string, arquivo: {
  nome: string;
  tipo?: string;
  google_drive_id?: string;
  google_drive_url?: string;
  supabase_path?: string;
  mime_type?: string;
}) {
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .insert({
      demanda_id: demandaId,
      ...arquivo
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
