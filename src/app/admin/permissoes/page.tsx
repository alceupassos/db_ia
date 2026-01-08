'use client';

import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { GlowCard } from '@/components/ui/glow-card';
import { Switch } from '@/components/ui/switch';

type UserRole = 'super_admin' | 'admin_empresa' | 'diretor' | 'advogado' | 'testemunha' | 'parte_integrante' | 'convidado_unico';

interface Permissao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
}

interface RolePermissao {
  role: UserRole;
  permissao_id: string;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin_empresa', label: 'Admin Empresa' },
  { value: 'diretor', label: 'Diretor' },
  { value: 'advogado', label: 'Advogado' },
  { value: 'testemunha', label: 'Testemunha' },
  { value: 'parte_integrante', label: 'Parte Integrante' },
  { value: 'convidado_unico', label: 'Convidado Único' },
];

export default function PermissoesPage() {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [rolePermissoes, setRolePermissoes] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: perms, error: permsError } = await supabase
        .from('permissoes')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (permsError) throw permsError;
      setPermissoes(perms || []);

      const { data: rps, error: rpsError } = await supabase
        .from('role_permissoes')
        .select('*');

      if (rpsError) throw rpsError;

      const map = new Map<string, Set<string>>();
      ROLES.forEach(r => map.set(r.value, new Set()));
      rps?.forEach(rp => {
        const set = map.get(rp.role);
        if (set) set.add(rp.permissao_id);
      });
      setRolePermissoes(map);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  }

  const togglePermissao = async (role: UserRole, permissaoId: string) => {
    const currentSet = rolePermissoes.get(role) || new Set();
    const hasPermission = currentSet.has(permissaoId);
    
    setSaving(true);
    try {
      if (hasPermission) {
        await supabase
          .from('role_permissoes')
          .delete()
          .eq('role', role)
          .eq('permissao_id', permissaoId);
      } else {
        await supabase
          .from('role_permissoes')
          .insert({ role, permissao_id: permissaoId });
      }
      
      // Atualizar estado local
      const newMap = new Map(rolePermissoes);
      const newSet = new Set(currentSet);
      if (hasPermission) {
        newSet.delete(permissaoId);
      } else {
        newSet.add(permissaoId);
      }
      newMap.set(role, newSet);
      setRolePermissoes(newMap);
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      alert('Erro ao atualizar permissão');
    } finally {
      setSaving(false);
    }
  };

  const categorias = Array.from(new Set(permissoes.map(p => p.categoria).filter(Boolean)));

  const filteredPermissoes = permissoes.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
        <p className="text-muted-foreground">Gerencie permissões por role</p>
      </div>

      <GlowCard variant="gradient" glowColor="accent">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar permissões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </GlowCard>

      <div className="overflow-x-auto">
        <GlowCard variant="gradient" glowColor="primary">
          <CardHeader>
            <CardTitle>Matriz de Permissões</CardTitle>
            <CardDescription>Ative ou desative permissões para cada role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categorias.map(categoria => {
                const permsCategoria = filteredPermissoes.filter(p => p.categoria === categoria);
                if (permsCategoria.length === 0) return null;

                return (
                  <div key={categoria} className="space-y-3">
                    <h3 className="font-semibold text-lg capitalize">{categoria}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Permissão</th>
                            {ROLES.map(role => (
                              <th key={role.value} className="text-center p-2 font-medium min-w-[120px]">
                                {role.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {permsCategoria.map(perm => (
                            <tr key={perm.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{perm.nome}</div>
                                  <div className="text-xs text-muted-foreground">{perm.codigo}</div>
                                </div>
                              </td>
                              {ROLES.map(role => {
                                const hasPermission = rolePermissoes.get(role.value)?.has(perm.id) || false;
                                return (
                                  <td key={role.value} className="p-3 text-center">
                                    <Switch
                                      checked={hasPermission}
                                      onCheckedChange={() => togglePermissao(role.value, perm.id)}
                                      disabled={saving}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}
