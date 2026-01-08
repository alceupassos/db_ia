'use client';

import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Search, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { GlowCard } from '@/components/ui/glow-card';
import { EmptyState } from '@/components/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  nome: string;
  categoria: string | null;
  mensagem: string;
  variaveis: Record<string, unknown> | null;
  ativo: boolean;
  created_at: string;
}

const CATEGORIAS = ['lembrete', 'notificacao', 'cobranca', 'informacao', 'outro'];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    nome: '',
    categoria: 'informacao',
    mensagem: '',
    ativo: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData(template);
    } else {
      setEditingTemplate(null);
      setFormData({
        nome: '',
        categoria: 'informacao',
        mensagem: '',
        ativo: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('whatsapp_templates')
          .update(formData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_templates')
          .insert(formData);

        if (error) throw error;
      }

      setDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      alert('Erro ao excluir template');
    }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const extractVars = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'all' || t.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagem</h1>
          <p className="text-muted-foreground">Gerencie templates para mensagens do WhatsApp</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <GlowCard variant="gradient" glowColor="accent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIAS.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlowCard>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-16 w-16" />}
          title="Nenhum template encontrado"
          description="Crie templates para agilizar o envio de mensagens"
          action={{
            label: 'Novo Template',
            onClick: () => handleOpenDialog(),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlowCard variant="gradient" glowColor="primary" className="hover:shadow-glow-md transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.nome}</h3>
                        {template.categoria && (
                          <Badge variant="outline" className="mt-1">
                            {template.categoria}
                          </Badge>
                        )}
                      </div>
                      {template.ativo ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.mensagem}
                    </p>

                    {extractVars(template.mensagem).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {extractVars(template.mensagem).map(v => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(template)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog de Edição/Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Use {'{{variavel}}'} para criar variáveis na mensagem
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Template *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria || 'informacao'}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem *</Label>
              <Textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={8}
                placeholder="Olá {{nome}}, sua demanda {{demanda}} está com prazo em {{prazo}} dias."
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variavel}}'} para criar variáveis. Ex: {'{{nome}}'}, {'{{demanda}}'}, {'{{prazo}}'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label>Template ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.nome || !formData.mensagem}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.nome}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{previewTemplate.mensagem}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Variáveis:</p>
                <div className="flex flex-wrap gap-2">
                  {extractVars(previewTemplate.mensagem).length > 0 ? (
                    extractVars(previewTemplate.mensagem).map(v => (
                      <Badge key={v} variant="outline">
                        {`{{${v}}}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma variável</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
