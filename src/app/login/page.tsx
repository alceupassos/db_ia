'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Mail, Loader2, Lock, Eye, EyeOff, FileText, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('juridico@cepalab.com.br');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'magic' | 'password'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('juridico');
  const router = useRouter();

  const handleMagicLinkLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/${selectedArea}`
        }
      });

      if (error) throw error;

      setMessage('Verifique seu email! Enviamos um link mágico para fazer login.');
    } catch (error: unknown) {
      setMessage((error instanceof Error ? error.message : 'Erro ao enviar email. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      router.push(`/${selectedArea}`);
    } catch (error: unknown) {
      setMessage((error instanceof Error ? error.message : 'Email ou senha incorretos. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = loginMode === 'password' ? handlePasswordLogin : handleMagicLinkLogin;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Camada Jurídica</CardTitle>
              <CardDescription>Cepalab</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Seletor de Área */}
          <div className="mb-6">
            <Label className="mb-2 block">Selecione a Área</Label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedArea('juridico')}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selectedArea === 'juridico'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Scale className="h-5 w-5" />
                <span className="text-sm font-medium">Jurídico</span>
              </button>
            </div>
          </div>

          {/* Toggle entre Magic Link e Senha */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'password'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Email e Senha
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('magic');
                setMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'magic'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juridico@cepalab.com.br"
                  disabled={loading}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {loginMode === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    disabled={loading}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('Verifique') || message.includes('sucesso')
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email.trim() || (loginMode === 'password' && !password.trim())}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loginMode === 'password' ? 'Entrando...' : 'Enviando...'}
                </>
              ) : (
                <>
                  {loginMode === 'password' ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Magic Link
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
