'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { Mail, Loader2, Lock, Eye, EyeOff, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowCard } from '@/components/ui/glow-card';
import { Label } from '@/components/ui/label';
import { pageVariants } from '@/lib/animations';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Aurora Background - Roxo */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, hsl(270 100% 65% / 0.2) 0px, transparent 50%),
            radial-gradient(circle at 100% 0%, hsl(280 100% 70% / 0.15) 0px, transparent 50%),
            radial-gradient(circle at 100% 100%, hsl(270 100% 65% / 0.15) 0px, transparent 50%),
            radial-gradient(circle at 0% 100%, hsl(280 100% 70% / 0.1) 0px, transparent 50%),
            hsl(var(--background))
          `,
        }}
      />
      
      {/* Animated gradient overlay - Roxo Premium */}
      <motion.div
        className="absolute inset-0 opacity-60"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(270 100% 65% / 0.1) 0%,
              transparent 30%,
              transparent 70%,
              hsl(280 100% 70% / 0.08) 100%
            ),
            linear-gradient(225deg, 
              transparent 0%,
              hsl(270 100% 65% / 0.05) 50%,
              transparent 100%
            )
          `,
          backgroundSize: '200% 200%',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        <GlowCard 
          glowColor="primary"
          variant="gradient"
          className="w-full backdrop-blur-[40px] bg-gradient-to-br from-card/90 via-card/80 to-card/90 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_hsl(var(--glow-primary)/0.2)]"
        >
          <div className="p-8">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 25px hsl(var(--glow-primary) / 0.5)',
                    '0 0 40px hsl(var(--glow-primary) / 0.7)',
                    '0 0 25px hsl(var(--glow-primary) / 0.5)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shadow-[0_0_30px_hsl(var(--glow-primary)/0.6)]"
              >
                <Scale className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
                  Camada Jurídica
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Cepalab</p>
              </div>
            </motion.div>
            {/* Seletor de Área */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Label className="mb-2 block text-sm font-medium">Selecione a Área</Label>
              <div className="grid grid-cols-1 gap-2">
                <motion.button
                  type="button"
                  onClick={() => setSelectedArea('juridico')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                    selectedArea === 'juridico'
                      ? 'border-primary/60 bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.4)]'
                      : 'border-border/50 bg-background/40 text-muted-foreground hover:bg-background/60 hover:border-primary/30 hover:text-foreground hover:shadow-[0_0_10px_hsl(var(--glow-primary)/0.2)]'
                  }`}
                >
                  <Scale className="h-5 w-5" />
                  <span className="text-sm font-medium">Jurídico</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Toggle entre Magic Link e Senha */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 mb-6 p-1 bg-background/40 backdrop-blur-md rounded-lg border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]"
            >
              <motion.button
                type="button"
                onClick={() => {
                  setLoginMode('password');
                  setMessage('');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  loginMode === 'password'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_20px_hsl(var(--glow-primary)/0.5)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                Email e Senha
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setLoginMode('magic');
                  setMessage('');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  loginMode === 'magic'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_20px_hsl(var(--glow-primary)/0.5)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                Magic Link
              </motion.button>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleLogin} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juridico@cepalab.com.br"
                    disabled={loading}
                    className="pl-9 bg-background/40 backdrop-blur-md border-white/20"
                    required
                  />
                </div>
              </div>

              {loginMode === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      disabled={loading}
                      className="pl-9 pr-9 bg-background/40 backdrop-blur-md border-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm border backdrop-blur-sm ${
                    message.includes('Verifique') || message.includes('sucesso')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_hsl(var(--glow-success)/0.2)]' 
                      : 'bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_15px_hsl(var(--glow-error)/0.2)]'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  variant="glow"
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
              </motion.div>
            </motion.form>
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}
