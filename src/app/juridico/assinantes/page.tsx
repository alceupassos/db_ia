'use client';

import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Search, Loader2, Edit, Trash2, Building2, Mail, Phone, FileText } from 'lucide-react';
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
import { motion } from 'framer-motion';

interface Assinante {
  id: string;
  empresa_id: string;
  nome_completo: string;
  cargo_pt: string;
  cargo_en?: string;
  cpf?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  pode_assinar: boolean;
  tipo_procuracao?: string;
  validade_procuracao?: string;
  ordem_assinatura: number;
  ativo: boolean;
  empresa?: {
    nome_fantasia: string;
    razao_social: string;
  };
}

interface Empresa {
  id: string;
  codigo: string;
  nome_fantasia: string;
  razao_social: string;
}

export default function AssinantesPage() {
  const [assinantes, setAssinantes] = useState<Assinante[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssinante, setEditingAssinante] = useState<Assinante | null>(null);
  const [formData, setFormData] = useState<Partial<Assinante>>({
    nome_completo: '',
    cargo_pt: '',
    cargo_en: '',
    cpf: '',
    rg: '',
    email: '',
    telefone: '',
    pode_assinar: true,
    tipo_procuracao: '',
    ordem_assinatura: 1,
    empresa_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Carregar empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('id, codigo, nome_fantasia, razao_social')
        .eq('ativo', true)
        .order('nome_fantasia');

      if (empresasError) throw empresasError;
      setEmpresas(empresasData || []);

      // Carregar assinantes com empresas
      const { data: assinantesData, error: assinantesError } = await supabase
        .from('assinantes')
        .select(`
          *,
          empresa:empresas(id, nome_fantasia, razao_social)
        `)
        .eq('ativo', true)
        .order('nome_completo');

      if (assinantesError) throw assinantesError;
      setAssinantes(assinantesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (assinante?: Assinante) => {
    if (assinante) {
      setEditingAssinante(assinante);
      setFormData({
        ...assinante,
        empresa_id: assinante.empresa_id,
      });
    } else {
      setEditingAssinante(null);
      setFormData({
        nome_completo: '',
        cargo_pt: '',
        cargo_en: '',
        cpf: '',
        rg: '',
        email: '',
        telefone: '',
        pode_assinar: true,
        tipo_procuracao: '',
        ordem_assinatura: 1,
        empresa_id: empresas[0]?.id || '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingAssinante) {
        // Atualizar
        const { error } = await supabase
          .from('assinantes')
          .update(formData)
          .eq('id', editingAssinante.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('assinantes')
          .insert({
            ...formData,
            ativo: true,
          });

        if (error) throw error;
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar assinante:', error);
      alert('Erro ao salvar assinante');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este assinante?')) return;

    try {
      const { error } = await supabase
        .from('assinantes')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Erro ao excluir assinante:', error);
      alert('Erro ao excluir assinante');
    }
  };

  const filteredAssinantes = assinantes.filter(a => {
    const matchesSearch = 
      a.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cargo_pt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf?.includes(searchTerm);
    const matchesEmpresa = filterEmpresa === 'all' || a.empresa_id === filterEmpresa;
    return matchesSearch && matchesEmpresa;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinantes</h1>
          <p className="text-muted-foreground">
            Gerencie assinantes e representantes legais das empresas
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Assinante
        </Button>
      </div>

      {/* Filters */}
      <GlowCard variant="gradient" glowColor="accent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cargo, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlowCard>

      {/* Assinantes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAssinantes.length === 0 ? (
        <EmptyState
          icon={<Users className="h-16 w-16" />}
          title="Nenhum assinante encontrado"
          description="Cadastre assinantes e representantes legais para as empresas do grupo"
          action={{
            label: 'Novo Assinante',
            onClick: () => handleOpenDialog(),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssinantes.map((assinante, index) => (
            <motion.div
              key={assinante.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlowCard variant="gradient" glowColor="primary" className="hover:shadow-glow-md transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assinante.nome_completo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{assinante.cargo_pt}</p>
                        {assinante.empresa && (
                          <Badge variant="outline" className="mt-2">
                            <Building2 className="h-3 w-3 mr-1" />
                            {assinante.empresa.nome_fantasia}
                          </Badge>
                        )}
                      </div>
                      {assinante.pode_assinar && (
                        <Badge variant="default">
                          <FileText className="h-3 w-3 mr-1" />
                          Pode Assinar
                        </Badge>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 text-sm">
                      {assinante.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{assinante.email}</span>
                        </div>
                      )}
                      {assinante.telefone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{assinante.telefone}</span>
                        </div>
                      )}
                      {assinante.cpf && (
                        <div className="text-xs text-muted-foreground">
                          CPF: {assinante.cpf}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(assinante)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assinante.id)}
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
              {editingAssinante ? 'Editar Assinante' : 'Novo Assinante'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do assinante/representante legal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa *</Label>
              <Select
                value={formData.empresa_id}
                onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
              >
                <SelectTrigger id="empresa_id">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nome_fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo_pt">Cargo (PT) *</Label>
                <Input
                  id="cargo_pt"
                  value={formData.cargo_pt}
                  onChange={(e) => setFormData({ ...formData, cargo_pt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo_en">Cargo (EN)</Label>
                <Input
                  id="cargo_en"
                  value={formData.cargo_en}
                  onChange={(e) => setFormData({ ...formData, cargo_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pode_assinar"
                checked={formData.pode_assinar}
                onChange={(e) => setFormData({ ...formData, pode_assinar: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="pode_assinar">Pode assinar documentos</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.nome_completo || !formData.cargo_pt || !formData.empresa_id}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
