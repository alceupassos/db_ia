import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DOCUMENSO_URL = process.env.DOCUMENSO_URL || 'http://localhost:3002';
const DOCUMENSO_API_KEY = process.env.DOCUMENSO_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { 
      nomeDocumento, 
      arquivoUrl, 
      signatarios, 
      empresaId,
      contraparteId,
      demandaId,
      templateId 
    } = await req.json();

    // Criar documento no Supabase
    const { data: documento, error: docError } = await supabase
      .from('documentos_assinatura')
      .insert({
        nome_documento: nomeDocumento,
        arquivo_url: arquivoUrl,
        empresa_id: empresaId,
        contraparte_id: contraparteId,
        demanda_id: demandaId,
        template_id: templateId,
        status: 'pendente',
      })
      .select()
      .single();

    if (docError) throw docError;

    // Se Documenso estiver configurado, criar documento la tambem
    if (DOCUMENSO_API_KEY && signatarios) {
      try {
        interface Signatario {
          email: string;
          nome: string;
          tipo: string;
        }
        
        const documensoResponse = await fetch(`${DOCUMENSO_URL}/api/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DOCUMENSO_API_KEY}`,
          },
          body: JSON.stringify({
            title: nomeDocumento,
            recipients: (signatarios as Signatario[]).map((s) => ({
              email: s.email,
              name: s.nome,
              role: s.tipo,
            })),
          }),
        });

        if (documensoResponse.ok) {
          const documensoData = await documensoResponse.json();
          // Atualizar documento com ID do Documenso
          await supabase
            .from('documentos_assinatura')
            .update({ hash_documento: documensoData.id })
            .eq('id', documento.id);
        }
      } catch (err) {
        console.error('Error creating Documenso document:', err);
      }
    }

    // Criar registros de assinatura
    if (signatarios && Array.isArray(signatarios) && signatarios.length > 0) {
      interface Signatario {
        nome: string;
        email: string;
        cpf?: string;
        cargo?: string;
        tipo: string;
      }
      
      await supabase.from('assinaturas').insert(
        (signatarios as Signatario[]).map((s) => ({
          documento_id: documento.id,
          signatario_nome: s.nome,
          signatario_email: s.email,
          signatario_cpf: s.cpf,
          cargo: s.cargo,
          tipo_assinatura: s.tipo,
        }))
      );
    }

    return NextResponse.json(documento);
  } catch (error: unknown) {
    console.error('Error creating documento:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar documento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
