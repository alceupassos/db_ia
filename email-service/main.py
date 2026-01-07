#!/usr/bin/env python3
"""
Servico de Automacao de Emails para Sistema Juridico CEPALAB
Envia lembretes de prazos, resumos semanais e notificacoes de assinaturas
"""

import os
import schedule
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client
import resend

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_SERVICE_KEY", "")
)

resend.api_key = os.getenv("RESEND_API_KEY", "")

def verificar_prazos():
    """Verifica prazos proximos e envia lembretes por email"""
    print(f"[{datetime.now()}] Verificando prazos...")
    
    hoje = datetime.now().date()
    em_7_dias = hoje + timedelta(days=7)
    
    try:
        # Buscar demandas com prazo proximo
        result = supabase.table("demandas_juridicas") \
            .select("*, clientes(email, nome)") \
            .gte("prazo", str(hoje)) \
            .lte("prazo", str(em_7_dias)) \
            .execute()
        
        for demanda in result.data:
            prazo = datetime.fromisoformat(demanda["prazo"].replace('Z', '+00:00')).date()
            dias_restantes = (prazo - hoje).days
            
            if dias_restantes <= 7 and demanda.get("clientes"):
                cliente = demanda["clientes"]
                email = cliente.get("email")
                
                if email:
                    try:
                        resend.Emails.send({
                            "from": "juridico@cepalab.com.br",
                            "to": email,
                            "subject": f"⚠️ Prazo em {dias_restantes} dias: {demanda['demanda']}",
                            "html": f"""
                            <html>
                            <body>
                                <h2>Lembrete de Prazo</h2>
                                <p>Olá {cliente.get('nome', 'Cliente')},</p>
                                <p>A demanda <strong>{demanda['demanda']}</strong> vence em <strong>{dias_restantes} dias</strong>.</p>
                                <p>Prazo: {prazo.strftime('%d/%m/%Y')}</p>
                                <p>Acesse o sistema para mais detalhes.</p>
                            </body>
                            </html>
                            """
                        })
                        print(f"✅ Email enviado para {email} - {dias_restantes} dias restantes")
                    except Exception as e:
                        print(f"❌ Erro ao enviar email para {email}: {e}")
                        
    except Exception as e:
        print(f"❌ Erro ao verificar prazos: {e}")

def enviar_resumo_semanal():
    """Envia resumo semanal para gestores"""
    print(f"[{datetime.now()}] Enviando resumos semanais...")
    
    try:
        # Buscar usuarios gestores
        result = supabase.table("user_profiles") \
            .select("email") \
            .in_("role", ["super_admin", "admin_empresa", "diretor"]) \
            .eq("ativo", True) \
            .execute()
        
        # Buscar estatisticas da semana
        hoje = datetime.now().date()
        semana_passada = hoje - timedelta(days=7)
        
        stats_result = supabase.table("demandas_juridicas") \
            .select("status") \
            .gte("created_at", str(semana_passada)) \
            .execute()
        
        total_novas = len(stats_result.data) if stats_result.data else 0
        
        for gestor in result.data:
            email = gestor.get("email")
            if email:
                try:
                    resend.Emails.send({
                        "from": "relatorios@cepalab.com.br",
                        "to": email,
                        "subject": "📊 Resumo Semanal - Sistema Jurídico",
                        "html": f"""
                        <html>
                        <body>
                            <h2>Resumo Semanal</h2>
                            <p>Período: {semana_passada.strftime('%d/%m/%Y')} a {hoje.strftime('%d/%m/%Y')}</p>
                            <ul>
                                <li>Novas demandas: {total_novas}</li>
                            </ul>
                            <p>Acesse o dashboard para mais detalhes.</p>
                        </body>
                        </html>
                        """
                    })
                    print(f"✅ Resumo enviado para {email}")
                except Exception as e:
                    print(f"❌ Erro ao enviar resumo para {email}: {e}")
                    
    except Exception as e:
        print(f"❌ Erro ao enviar resumos: {e}")

# Agendar tarefas
schedule.every().hour.do(verificar_prazos)
schedule.every().monday.at("08:00").do(enviar_resumo_semanal)

if __name__ == "__main__":
    print("🚀 Serviço de email iniciado...")
    print("📧 Verificando prazos a cada hora")
    print("📊 Enviando resumos semanais às segundas 08:00")
    
    while True:
        schedule.run_pending()
        time.sleep(60)
