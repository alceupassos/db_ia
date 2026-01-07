'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Crown, Scale, Eye, User, Clock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ open, onOpenChange, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState<Array<{ id: string; nome_fantasia: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEmpresas = async () => {
    const { data } = await supabase
      .from('empresas')
      .select('id, nome_fantasia')
      .eq('ativo', true);
    setEmpresas(data || []);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      loadEmpresas();
    } else {
      setEmail('');
      setNome('');
      setRole('');
      setEmpresaId('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  async function handleInvite() {
    if (!email || !nome || !role) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome,
          role,
          empresa_id: empresaId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar convite');
      }

      onSuccess?.();
      handleOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Convidar Usuário</DialogTitle>
          <DialogDescription>
            Envie um convite por email para um novo usuário acessar o sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Nome Completo *</Label>
            <Input
              placeholder="Nome do usuário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <Label>Tipo de Usuário *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_empresa">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">Administrador</p>
                      <p className="text-xs text-muted-foreground">
                        Gerencia usuários e configurações da empresa
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="diretor">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">Diretor</p>
                      <p className="text-xs text-muted-foreground">
                        Assina contratos como representante legal
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="advogado">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Advogado</p>
                      <p className="text-xs text-muted-foreground">
                        Cria e gerencia demandas e contratos
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="testemunha">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Testemunha</p>
                      <p className="text-xs text-muted-foreground">
                        Apenas assina como testemunha
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="parte_integrante">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">Parte Integrante</p>
                      <p className="text-xs text-muted-foreground">
                        Contraparte que assina contratos
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Empresa</Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger>
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

          {error && (
            <div className="p-3 bg-red-500/10 text-red-500 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            <Mail className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Convite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
