'use server';

// Função básica para envio de e-mails
// Nota: Para produção, instalar e configurar Resend ou SendGrid
// npm install resend

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  // TODO: Implementar com Resend quando API key estiver configurada
  // Por enquanto, apenas log para desenvolvimento
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email que seria enviado:');
    console.log('Para:', options.to);
    console.log('Assunto:', options.subject);
    console.log('HTML:', options.html);
  }
  
  // Em produção, usar Resend:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@cepalab.com',
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  
  if (error) throw error;
  return data;
  */
  
  return { id: 'mock-email-id', status: 'sent' };
}

export async function sendPrazoNotification(
  email: string,
  demanda: { demanda: string; cliente_nome: string; prazo: string | null }
) {
  if (!demanda.prazo) return;
  
  const prazoDate = new Date(demanda.prazo);
  const diasRestantes = Math.ceil(
    (prazoDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return sendEmail({
    to: email,
    subject: `⚠️ Prazo próximo: ${demanda.demanda}`,
    html: `
      <h2>Lembrete de Prazo</h2>
      <p>A demanda <strong>${demanda.demanda}</strong> do cliente <strong>${demanda.cliente_nome}</strong> 
      tem prazo em <strong>${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}</strong>.</p>
      <p>Data do prazo: ${prazoDate.toLocaleDateString('pt-BR')}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/juridico">Ver demanda</a></p>
    `,
  });
}

export async function sendStatusNotification(
  email: string,
  demanda: { demanda: string; cliente_nome: string; status: string }
) {
  return sendEmail({
    to: email,
    subject: `Status atualizado: ${demanda.demanda}`,
    html: `
      <h2>Status Atualizado</h2>
      <p>A demanda <strong>${demanda.demanda}</strong> do cliente <strong>${demanda.cliente_nome}</strong> 
      teve seu status alterado para <strong>${demanda.status}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/juridico">Ver demanda</a></p>
    `,
  });
}

export async function sendWeeklySummary(
  email: string,
  summary: {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    prazosProximos: number;
  }
) {
  return sendEmail({
    to: email,
    subject: 'Resumo Semanal - Sistema Jurídico',
    html: `
      <h2>Resumo Semanal</h2>
      <h3>Estatísticas de Demandas</h3>
      <ul>
        <li><strong>Total:</strong> ${summary.total}</li>
        <li><strong>Pendentes:</strong> ${summary.pendentes}</li>
        <li><strong>Em Andamento:</strong> ${summary.emAndamento}</li>
        <li><strong>Concluídas:</strong> ${summary.concluidas}</li>
      </ul>
      ${summary.prazosProximos > 0 ? `
        <p><strong>⚠️ Atenção:</strong> ${summary.prazosProximos} demanda(s) com prazo próximo!</p>
      ` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/juridico">Acessar sistema</a></p>
    `,
  });
}
