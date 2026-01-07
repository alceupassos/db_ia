'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Shield, Mail } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import { PermissionGuard } from '@/components/permission-guard';
import { InviteUserModal } from '@/components/invite-user-modal';
import { supabase } from '@/lib/supabase-client';

interface UserProfile {
  id: string;
  email: string;
  nome_completo: string;
  role: string;
  empresa_id: string;
  ativo: boolean;
  empresas?: {
    nome_fantasia: string;
  };
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          empresas:nome_fantasia
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin_empresa: 'Admin Empresa',
    diretor: 'Diretor',
    advogado: 'Advogado',
    testemunha: 'Testemunha',
    parte_integrante: 'Parte Integrante',
    convidado_unico: 'Convidado Único',
  };

  return (
    <PermissionGuard permission="admin.usuarios">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administração de Usuários</h1>
            <p className="text-muted-foreground">Gerencie usuários, permissões e convites</p>
          </div>
          <Button onClick={() => setInviteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.ativo).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} />
            ) : users.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="Nenhum usuário encontrado"
                description="Comece convidando um novo usuário para o sistema"
                action={{
                  label: 'Convidar Usuário',
                  onClick: () => setInviteModalOpen(true),
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Nome</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Função</th>
                      <th className="text-left p-4">Empresa</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">{user.nome_completo}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.empresas?.nome_fantasia || '-'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            user.ativo 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <InviteUserModal 
          open={inviteModalOpen} 
          onOpenChange={setInviteModalOpen}
          onSuccess={loadUsers}
        />
      </div>
    </PermissionGuard>
  );
}
