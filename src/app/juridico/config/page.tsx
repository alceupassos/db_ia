'use client';

import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Brain, MessageSquare, Save, Loader2 } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ConfigPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // Preferências
    tema: 'dark',
    idioma: 'pt-BR',
    notificacoes_email: true,
    notificacoes_push: false,
    
    // Notificações
    notificar_prazo_vencendo: true,
    dias_antecedencia_prazo: 7,
    notificar_nova_demanda: true,
    notificar_arquivo_analisado: true,
    
    // Integração IA
    modelo_ia_padrao: 'gpt-5.1',
    temperatura_ia: 0.3,
    max_tokens: 2000,
    analisar_arquivos_automaticamente: true,
    
    // WhatsApp
    wpp_session_name: 'cepalab-juridico',
    wpp_auto_responder: true,
    wpp_templates_ativo: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Aqui seria salvar no banco ou localStorage
    setTimeout(() => {
      setSaving(false);
      alert('Configurações salvas com sucesso!');
    }, 1000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema jurídico
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="preferencias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferencias">
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="ia">
            <Brain className="h-4 w-4 mr-2" />
            Integração IA
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Preferências */}
        <TabsContent value="preferencias">
          <GlowCard variant="gradient" glowColor="primary">
            <CardHeader>
              <CardTitle>Preferências Gerais</CardTitle>
              <CardDescription>Configurações de aparência e comportamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <select
                  id="tema"
                  value={config.tema}
                  onChange={(e) => setConfig({ ...config, tema: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <select
                  id="idioma"
                  value={config.idioma}
                  onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={config.notificacoes_email}
                  onCheckedChange={(checked) => setConfig({ ...config, notificacoes_email: checked })}
                />
              </div>
            </CardContent>
          </GlowCard>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes">
          <GlowCard variant="gradient" glowColor="accent">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure quando e como receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Prazo Vencendo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas quando prazos estão próximos de vencer
                  </p>
                </div>
                <Switch
                  checked={config.notificar_prazo_vencendo}
                  onCheckedChange={(checked) => setConfig({ ...config, notificar_prazo_vencendo: checked })}
                />
              </div>
              {config.notificar_prazo_vencendo && (
                <div className="space-y-2">
                  <Label htmlFor="dias_antecedencia">Dias de Antecedência</Label>
                  <Input
                    id="dias_antecedencia"
                    type="number"
                    min="1"
                    max="30"
                    value={config.dias_antecedencia_prazo}
                    onChange={(e) => setConfig({ ...config, dias_antecedencia_prazo: parseInt(e.target.value) || 7 })}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Nova Demanda</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificação quando nova demanda for criada
                  </p>
                </div>
                <Switch
                  checked={config.notificar_nova_demanda}
                  onCheckedChange={(checked) => setConfig({ ...config, notificar_nova_demanda: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Arquivo Analisado</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificação quando IA terminar análise de arquivo
                  </p>
                </div>
                <Switch
                  checked={config.notificar_arquivo_analisado}
                  onCheckedChange={(checked) => setConfig({ ...config, notificar_arquivo_analisado: checked })}
                />
              </div>
            </CardContent>
          </GlowCard>
        </TabsContent>

        {/* Integração IA */}
        <TabsContent value="ia">
          <GlowCard variant="gradient" glowColor="success">
            <CardHeader>
              <CardTitle>Integração com IA</CardTitle>
              <CardDescription>Configure parâmetros da análise de documentos por IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelo_ia">Modelo de IA Padrão</Label>
                <select
                  id="modelo_ia"
                  value={config.modelo_ia_padrao}
                  onChange={(e) => setConfig({ ...config, modelo_ia_padrao: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="gpt-5.1">GPT-5.1</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatura">Temperatura (0.0 - 1.0)</Label>
                <Input
                  id="temperatura"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperatura_ia}
                  onChange={(e) => setConfig({ ...config, temperatura_ia: parseFloat(e.target.value) || 0.3 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analisar Arquivos Automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Iniciar análise de arquivos automaticamente após upload
                  </p>
                </div>
                <Switch
                  checked={config.analisar_arquivos_automaticamente}
                  onCheckedChange={(checked) => setConfig({ ...config, analisar_arquivos_automaticamente: checked })}
                />
              </div>
            </CardContent>
          </GlowCard>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <GlowCard variant="gradient" glowColor="warning">
            <CardHeader>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Configurações da integração com WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wpp_session">Nome da Sessão</Label>
                <Input
                  id="wpp_session"
                  value={config.wpp_session_name}
                  onChange={(e) => setConfig({ ...config, wpp_session_name: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Responder</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar respostas automáticas para mensagens recebidas
                  </p>
                </div>
                <Switch
                  checked={config.wpp_auto_responder}
                  onCheckedChange={(checked) => setConfig({ ...config, wpp_auto_responder: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Templates de Mensagem</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar templates pré-configurados para mensagens
                  </p>
                </div>
                <Switch
                  checked={config.wpp_templates_ativo}
                  onCheckedChange={(checked) => setConfig({ ...config, wpp_templates_ativo: checked })}
                />
              </div>
            </CardContent>
          </GlowCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
