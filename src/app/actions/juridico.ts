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
  data_pagamento: string | null;
  data_fim_contrato: string | null;
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

export async function updateDemandaField(id: string, field: keyof DemandaJuridica, value: unknown) {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .update({ [field]: value })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as DemandaJuridica;
}

export async function deleteArquivo(arquivoId: string) {
  const { error } = await supabase
    .from('arquivos_demanda')
    .delete()
    .eq('id', arquivoId);

  if (error) throw error;
}

export async function updateArquivo(arquivoId: string, updates: {
  nome?: string;
  tipo?: string;
}) {
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .update(updates)
    .eq('id', arquivoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadArquivo(demandaId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('Nenhum arquivo enviado');

  const fileName = `${demandaId}/${Date.now()}-${file.name}`;
  
  // Upload para Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('arquivos-juridico')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Obter URL pública
  const { data: urlData } = supabase
    .storage
    .from('arquivos-juridico')
    .getPublicUrl(fileName);

  // Salvar referência no banco
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .insert({
      demanda_id: demandaId,
      nome: file.name,
      tipo: file.type.split('/')[1]?.toUpperCase() || 'ARQUIVO',
      mime_type: file.type,
      supabase_path: uploadData.path,
      storage_url: urlData.publicUrl
    })
    .select()
    .single();

  if (error) throw error;

  // Analisar arquivo com IA automaticamente (em background, não bloqueia)
  try {
    // Em server action, podemos fazer chamada HTTP interna
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/juridico/analisar-arquivo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        arquivoId: data.id,
        arquivoNome: file.name,
        storageUrl: urlData.publicUrl,
        mimeType: file.type,
      }),
    });

    if (!response.ok) {
      console.warn('Análise de arquivo retornou erro:', response.status);
    }
  } catch (analysisError) {
    // Não falha o upload se a análise der erro
    console.error('Erro ao analisar arquivo com IA:', analysisError);
  }

  return data;
}

export async function deleteArquivoComStorage(arquivoId: string) {
  // Buscar arquivo para pegar o path
  const { data: arquivo, error: fetchError } = await supabase
    .from('arquivos_demanda')
    .select('supabase_path')
    .eq('id', arquivoId)
    .single();

  if (fetchError) throw fetchError;

  // Deletar do storage se existir
  if (arquivo?.supabase_path) {
    await supabase
      .storage
      .from('arquivos-juridico')
      .remove([arquivo.supabase_path]);
  }

  // Deletar do banco
  const { error } = await supabase
    .from('arquivos_demanda')
    .delete()
    .eq('id', arquivoId);

  if (error) throw error;
}

// Analytics functions
export async function getDemandasPorStatus() {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('status');
  
  if (error) throw error;
  
  const statusCount = {
    'PENDENTE': 0,
    'EM ANDAMENTO': 0,
    'CONCLUÍDO': 0,
    'Cancelado': 0
  };
  
  data?.forEach(d => {
    if (d.status in statusCount) {
      statusCount[d.status as keyof typeof statusCount]++;
    }
  });
  
  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count
  }));
}

export async function getDemandasPorCliente() {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('cliente_nome');
  
  if (error) throw error;
  
  const clienteCount: Record<string, number> = {};
  data?.forEach(d => {
    const cliente = d.cliente_nome || 'Sem cliente';
    clienteCount[cliente] = (clienteCount[cliente] || 0) + 1;
  });
  
  return Object.entries(clienteCount)
    .map(([cliente, count]) => ({ cliente, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function getArquivosPorCategoria() {
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .select('categoria');
  
  if (error) throw error;
  
  const categoriaCount: Record<string, number> = {};
  data?.forEach(a => {
    const categoria = a.categoria || 'Sem categoria';
    categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1;
  });
  
  return Object.entries(categoriaCount)
    .map(([categoria, count]) => ({ categoria, count }));
}

export async function getEvolucaoMensal() {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('created_at, status')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  const monthlyData: Record<string, { criadas: number; concluidas: number }> = {};
  
  data?.forEach(d => {
    if (!d.created_at) return;
    const date = new Date(d.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { criadas: 0, concluidas: 0 };
    }
    
    monthlyData[monthKey].criadas++;
    if (d.status === 'CONCLUÍDO') {
      monthlyData[monthKey].concluidas++;
    }
  });
  
  return Object.entries(monthlyData)
    .map(([mes, valores]) => ({
      mes,
      ...valores
    }))
    .slice(-12);
}

export async function getTimelineAtividades(limit = 20) {
  const { data, error } = await supabase
    .from('demandas_juridicas')
    .select('id, demanda, status, created_at, updated_at, cliente_nome')
    .order('updated_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return data?.map(d => ({
    id: d.id,
    tipo: 'demanda' as const,
    titulo: d.demanda,
    cliente: d.cliente_nome,
    status: d.status,
    data: d.updated_at || d.created_at,
    descricao: `Status: ${d.status}`
  })) || [];
}

export async function getNotificacoesPrazos() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const { data: demandas, error } = await supabase
    .from('demandas_juridicas')
    .select('id, demanda, cliente_nome, prazo, data_entrega, data_fim_contrato, data_pagamento')
    .or('prazo.not.is.null,data_entrega.not.is.null,data_fim_contrato.not.is.null,data_pagamento.not.is.null');
  
  if (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
  
  const notificacoes: Array<{
    id: string;
    tipo: 'prazo' | 'entrega' | 'fim_contrato' | 'pagamento';
    titulo: string;
    descricao: string;
    data: string;
    diasRestantes: number;
    urgencia: 'baixa' | 'media' | 'alta';
  }> = [];
  
  demandas?.forEach(d => {
    const checkDate = (campo: 'prazo' | 'data_entrega' | 'data_fim_contrato' | 'data_pagamento', tipo: typeof notificacoes[0]['tipo'], label: string) => {
      const data = d[campo];
      if (!data) return;
      
      const dataObj = new Date(data);
      dataObj.setHours(0, 0, 0, 0);
      
      if (dataObj >= hoje) {
        const diffTime = dataObj.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          let urgencia: 'baixa' | 'media' | 'alta' = 'baixa';
          if (diffDays <= 1) urgencia = 'alta';
          else if (diffDays <= 3) urgencia = 'media';
          
          notificacoes.push({
            id: `${d.id}-${campo}`,
            tipo,
            titulo: `${label}: ${d.demanda}`,
            descricao: `Cliente: ${d.cliente_nome}`,
            data: data,
            diasRestantes: diffDays,
            urgencia
          });
        }
      }
    };
    
    checkDate('prazo', 'prazo', 'Prazo');
    checkDate('data_entrega', 'entrega', 'Data de Entrega');
    checkDate('data_fim_contrato', 'fim_contrato', 'Fim de Contrato');
    checkDate('data_pagamento', 'pagamento', 'Data de Pagamento');
  });
  
  return notificacoes.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// Workflow functions
export async function aprovarArquivo(
  arquivoId: string, 
  status: 'APROVADO' | 'REJEITADO',
  comentario?: string,
  userId?: string
) {
  const { data: arquivo } = await supabase
    .from('arquivos_demanda')
    .select('status_aprovacao')
    .eq('id', arquivoId)
    .single();

  const statusAnterior = arquivo?.status_aprovacao || 'RASCUNHO';

  const { data: updated, error } = await supabase
    .from('arquivos_demanda')
    .update({
      status_aprovacao: status,
      aprovado_por: userId || null,
      aprovado_em: new Date().toISOString(),
      comentarios_aprovacao: comentario || null,
    })
    .eq('id', arquivoId)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('historico_aprovacoes')
    .insert({
      arquivo_id: arquivoId,
      status_anterior: statusAnterior,
      status_novo: status,
      comentario: comentario || null,
      aprovado_por: userId || null,
    });

  return updated;
}

export async function enviarParaRevisao(arquivoId: string) {
  const { data, error } = await supabase
    .from('arquivos_demanda')
    .update({
      status_aprovacao: 'EM_REVISAO',
    })
    .eq('id', arquivoId)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('historico_aprovacoes')
    .insert({
      arquivo_id: arquivoId,
      status_anterior: 'RASCUNHO',
      status_novo: 'EM_REVISAO',
    });

  return data;
}

export async function getHistoricoAprovacao(arquivoId: string) {
  const { data, error } = await supabase
    .from('historico_aprovacoes')
    .select('*')
    .eq('arquivo_id', arquivoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Pool de Arquivos - Funções para arquivos não vinculados
export interface ArquivoPool {
  id: string;
  nome: string;
  storage_url: string | null;
  supabase_path: string | null;
  mime_type: string | null;
  tamanho: number | null;
  categoria: string | null;
  descricao_ia: string | null;
  categoria_usuario: string | null;
  resumo_ia: string | null;
  status: 'aguardando_analise' | 'analisado' | 'vinculado';
  demanda_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function uploadArquivoParaPool(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('Nenhum arquivo enviado');

  const fileName = `pool/${Date.now()}-${file.name}`;
  
  // Upload para Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('arquivos-juridico')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Obter URL pública
  const { data: urlData } = supabase
    .storage
    .from('arquivos-juridico')
    .getPublicUrl(fileName);

  // Salvar no pool com tratamento de erro robusto
  try {
    const { data, error } = await supabase
      .from('arquivos_pool')
      .insert({
        nome: file.name,
        tipo: file.type.split('/')[1]?.toUpperCase() || 'ARQUIVO',
        mime_type: file.type,
        tamanho: file.size,
        supabase_path: uploadData.path,
        storage_url: urlData.publicUrl,
        status: 'aguardando_analise'
      })
      .select()
      .single();

    if (error) {
      // Verificar diferentes códigos de erro relacionados à tabela não existente
      if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('does not exist')) {
        throw new Error('Tabela arquivos_pool não encontrada. Execute a migration 014_arquivos_pool.sql no Supabase.');
      }
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao salvar arquivo no pool');
    }

    // Continuar com análise de IA se bem-sucedido
    // Analisar arquivo com IA automaticamente
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                      'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/juridico/analisar-arquivo-pool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arquivoId: data.id,
          arquivoNome: file.name,
          storageUrl: urlData.publicUrl,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        console.warn('Análise de arquivo do pool retornou erro:', response.status);
      }
    } catch (analysisError) {
      console.error('Erro ao analisar arquivo do pool com IA:', analysisError);
      // Não falhar o upload se a análise falhar
    }

    return data;
  } catch (poolError) {
    // Se falhar ao salvar no pool, ainda retornar informações básicas
    // para que o usuário possa tentar vincular manualmente
    console.error('Erro ao salvar no pool, mas arquivo foi feito upload:', poolError);
    throw poolError;
  }
}

export async function getArquivosPool(filters?: {
  status?: string;
  categoria?: string;
  search?: string;
}) {
  try {
    let query = supabase
      .from('arquivos_pool')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.categoria && filters.categoria !== 'all') {
      query = query.eq('categoria_usuario', filters.categoria).or(`categoria.eq.${filters.categoria}`);
    }

    if (filters?.search) {
      query = query.or(`nome.ilike.%${filters.search}%,descricao_ia.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      // Se a tabela não existe, retorna array vazio
      if (error.code === 'PGRST205') {
        console.warn('Tabela arquivos_pool não encontrada. Execute a migration 014_arquivos_pool.sql');
        return [];
      }
      throw error;
    }
    return data as ArquivoPool[];
  } catch (error) {
    console.error('Erro ao buscar arquivos do pool:', error);
    return [];
  }
}

export async function atualizarArquivoPool(
  arquivoId: string,
  updates: {
    categoria_usuario?: string;
    descricao_ia?: string;
    categoria?: string;
  }
) {
  const { data, error } = await supabase
    .from('arquivos_pool')
    .update(updates)
    .eq('id', arquivoId)
    .select()
    .single();

  if (error) throw error;
  return data as ArquivoPool;
}

export async function vincularArquivoPoolADemanda(
  arquivoId: string,
  demandaId: string
) {
  // Buscar arquivo do pool
  const { data: arquivoPool, error: fetchError } = await supabase
    .from('arquivos_pool')
    .select('*')
    .eq('id', arquivoId)
    .single();

  if (fetchError) throw fetchError;

  // Criar entrada em arquivos_demanda
  const { data: arquivoDemanda, error: insertError } = await supabase
    .from('arquivos_demanda')
    .insert({
      demanda_id: demandaId,
      nome: arquivoPool.nome,
      tipo: arquivoPool.mime_type?.split('/')[1]?.toUpperCase() || 'ARQUIVO',
      tamanho: arquivoPool.tamanho,
      supabase_path: arquivoPool.supabase_path,
      mime_type: arquivoPool.mime_type,
      storage_url: arquivoPool.storage_url,
      categoria: arquivoPool.categoria_usuario || arquivoPool.categoria,
      descricao_ia: arquivoPool.descricao_ia,
      resumo_ia: arquivoPool.resumo_ia || arquivoPool.descricao_ia
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Atualizar status do arquivo no pool
  await supabase
    .from('arquivos_pool')
    .update({
      status: 'vinculado',
      demanda_id: demandaId
    })
    .eq('id', arquivoId);

  return arquivoDemanda;
}

export async function deletarArquivoPool(arquivoId: string) {
  // Buscar arquivo para pegar o path
  const { data: arquivo, error: fetchError } = await supabase
    .from('arquivos_pool')
    .select('supabase_path')
    .eq('id', arquivoId)
    .single();

  if (fetchError) throw fetchError;

  // Deletar do storage se existir
  if (arquivo?.supabase_path) {
    await supabase
      .storage
      .from('arquivos-juridico')
      .remove([arquivo.supabase_path]);
  }

  // Deletar do banco
  const { error } = await supabase
    .from('arquivos_pool')
    .delete()
    .eq('id', arquivoId);

  if (error) throw error;
}
