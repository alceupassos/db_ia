import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getDemandas } from '@/app/actions/juridico';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const formato = searchParams.get('formato') || 'excel'; // excel ou pdf
    
    if (formato === 'excel') {
      // Buscar todas as demandas
      const demandas = await getDemandas();
      
      // Preparar dados para Excel
      const dados = demandas.map(d => ({
        'ID': d.id,
        'Demanda': d.demanda,
        'Cliente': d.cliente_nome,
        'Responsável': d.responsavel,
        'Status': d.status,
        'Data Solicitação': d.data_solicitacao ? new Date(d.data_solicitacao).toLocaleDateString('pt-BR') : '',
        'Prazo': d.prazo ? new Date(d.prazo).toLocaleDateString('pt-BR') : '',
        'Data Entrega': d.data_entrega ? new Date(d.data_entrega).toLocaleDateString('pt-BR') : '',
        'Data Pagamento': d.data_pagamento ? new Date(d.data_pagamento).toLocaleDateString('pt-BR') : '',
        'Fim Contrato': d.data_fim_contrato ? new Date(d.data_fim_contrato).toLocaleDateString('pt-BR') : '',
        'Documentos Assinados': d.documentos_assinados,
        'Observações': d.observacoes || '',
      }));
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dados);
      
      // Ajustar larguras das colunas
      const colWidths = [
        { wch: 36 }, // ID
        { wch: 40 }, // Demanda
        { wch: 25 }, // Cliente
        { wch: 20 }, // Responsável
        { wch: 15 }, // Status
        { wch: 15 }, // Data Solicitação
        { wch: 15 }, // Prazo
        { wch: 15 }, // Data Entrega
        { wch: 15 }, // Data Pagamento
        { wch: 15 }, // Fim Contrato
        { wch: 18 }, // Documentos Assinados
        { wch: 50 }, // Observações
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Demandas');
      
      // Gerar buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      // Retornar arquivo
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio-demandas-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
    
    // PDF - por enquanto retorna erro, pode ser implementado depois
    return NextResponse.json(
      { error: 'Formato PDF ainda não implementado' },
      { status: 501 }
    );
  } catch (error: unknown) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
