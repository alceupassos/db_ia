'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  ChevronDown,
  ChevronRight,
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  Scale,
  Sparkles,
  MessageSquare,
  Users,
  Building2,
  FileSignature,
  Languages,
  Shield,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const juridicoSubItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/juridico/dashboard' },
  { icon: FileText, label: 'Demandas', href: '/juridico' },
  { icon: FolderOpen, label: 'Arquivos', href: '/juridico/arquivos' },
  { icon: FolderOpen, label: 'Pool de Arquivos', href: '/juridico/arquivos/pool' },
  { icon: BarChart3, label: 'Relatórios', href: '/juridico/relatorios' },
  { icon: HelpCircle, label: 'Como Usar', href: '/juridico/como-usar' },
  { icon: Sparkles, label: 'Cepalab IA', href: '#', isAction: true },
];

const contratosSubItems = [
  { icon: Briefcase, label: 'Templates', href: '/juridico/templates' },
  { icon: Languages, label: 'Tradução Bicolunar', href: '/juridico/traducao' },
  { icon: FileSignature, label: 'Assinaturas Digitais', href: '/juridico/assinaturas' },
];

const cadastrosSubItems = [
  { icon: Building2, label: 'Empresas do Grupo', href: '/juridico/empresas' },
  { icon: Users, label: 'Assinantes', href: '/juridico/assinantes' },
  { icon: Briefcase, label: 'Contrapartes', href: '/juridico/contrapartes' },
];

const whatsappSubItems = [
  { icon: MessageSquare, label: 'Chat', href: '/juridico/whatsapp' },
  { icon: Users, label: 'Contatos', href: '/juridico/whatsapp/contatos' },
  { icon: FileText, label: 'Lembretes', href: '/juridico/whatsapp/lembretes' },
  { icon: Briefcase, label: 'Templates de Mensagem', href: '/juridico/whatsapp/templates' },
];

const adminSubItems = [
  { icon: Users, label: 'Usuários', href: '/admin/usuarios' },
  { icon: Shield, label: 'Permissões', href: '/admin/permissoes' },
  { icon: FileText, label: 'Logs de Acesso', href: '/admin/logs' },
];

const accountItems = [
  { icon: Settings, label: 'Configurações', href: '/juridico/config' },
];

function SidebarContent({ 
  pathname, 
  isJuridicoOpen, 
  setIsJuridicoOpen,
  isContratosOpen,
  setIsContratosOpen,
  isCadastrosOpen,
  setIsCadastrosOpen,
  isWhatsAppOpen,
  setIsWhatsAppOpen,
  isAdminOpen,
  setIsAdminOpen,
  setMobileOpen, 
  signOut,
  onChatOpen
}: { 
  pathname: string | null;
  isJuridicoOpen: boolean;
  setIsJuridicoOpen: (open: boolean) => void;
  isContratosOpen: boolean;
  setIsContratosOpen: (open: boolean) => void;
  isCadastrosOpen: boolean;
  setIsCadastrosOpen: (open: boolean) => void;
  isWhatsAppOpen: boolean;
  setIsWhatsAppOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  setMobileOpen?: (open: boolean) => void;
  signOut: () => void;
  onChatOpen?: () => void;
}) {
  // Verificar se algum subitem do menu Jurídico está ativo
  const isJuridicoActive = useMemo(() => {
    return juridicoSubItems.some(item => {
      if (item.href === '/juridico' && item.label === 'Demandas') {
        // Para Demandas, verifica se está em /juridico mas não em subrotas específicas
        return pathname === '/juridico' || pathname?.startsWith('/juridico/');
      }
      return pathname === item.href || pathname?.startsWith(item.href + '/');
    });
  }, [pathname]);

  return (
    <div className="flex h-full flex-col relative">
      {/* Premium Glassmorphism Background */}
      <div 
        className="absolute inset-0 backdrop-blur-[40px]"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(270 50% 4% / 0.95) 0%,
              hsl(270 45% 5% / 0.98) 50%,
              hsl(270 50% 4% / 0.95) 100%
            ),
            radial-gradient(circle at 0% 0%, hsl(var(--glow-primary) / 0.08) 0px, transparent 50%),
            radial-gradient(circle at 100% 100%, hsl(var(--glow-accent) / 0.06) 0px, transparent 50%)
          `,
        }}
      />
      
      {/* Glass border overlay */}
      <div className="absolute inset-0 border-r border-white/5 pointer-events-none" />
      
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6 relative z-10 backdrop-blur-sm bg-background/30">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px hsl(var(--glow-primary) / 0.4)',
                '0 0 35px hsl(var(--glow-primary) / 0.6)',
                '0 0 20px hsl(var(--glow-primary) / 0.4)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent/80 to-primary shadow-lg"
          >
            <Scale className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Camada Jurídica</span>
            <span className="text-xs text-muted-foreground font-medium">Cepalab</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 relative z-10">
        <nav className="space-y-1 p-4">
          <Collapsible open={isJuridicoOpen} onOpenChange={setIsJuridicoOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group",
                isJuridicoActive
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5" />
                <span>Jurídico</span>
              </div>
              {isJuridicoOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {juridicoSubItems.map((item) => {
                const Icon = item.icon;
                // Lógica de detecção de item ativo
                let isActive = false;
                if (item.href === '/juridico') {
                  // Para itens que apontam para /juridico, verificar se não é uma subrota específica
                  if (item.label === 'Dashboard') {
                    // Dashboard ativo apenas na página exata
                    isActive = pathname === '/juridico';
                  } else if (item.label === 'Demandas') {
                    // Demandas ativo em /juridico ou subrotas que não sejam outras seções
                    isActive = pathname === '/juridico' || 
                      (!!pathname && pathname.startsWith('/juridico/') && 
                       !pathname.startsWith('/juridico/arquivos') && 
                       !pathname.startsWith('/juridico/relatorios') &&
                       !pathname.startsWith('/juridico/config'));
                  } else {
                    isActive = pathname === item.href;
                  }
                } else {
                  isActive = pathname === item.href || !!pathname && pathname.startsWith(item.href + '/');
                }
                
                // Se for ação (como Cepalab IA), não usa Link
                if ((item as { isAction?: boolean }).isAction && onChatOpen) {
                  return (
                    <button
                      key={`${item.href}-${item.label}`}
                      onClick={() => {
                        onChatOpen();
                        setMobileOpen?.(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-colors w-full text-left",
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                }
                
                return (
                  <motion.div
                    key={`${item.href}-${item.label}`}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-all duration-300 relative group",
                        isActive
                          ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_12px_hsl(var(--glow-primary)/0.2)]"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-[0_0_8px_hsl(var(--glow-accent)/0.1)] hover:border-l-2 hover:border-accent/30"
                      )}
                    >
                      {/* Glow indicator for active */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            boxShadow: [
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                              '0 0 12px hsl(var(--glow-primary) / 1)',
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Contratos */}
          <Collapsible open={isContratosOpen} onOpenChange={setIsContratosOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group",
                pathname?.startsWith('/juridico/templates') || 
                pathname?.startsWith('/juridico/traducao') ||
                pathname?.startsWith('/juridico/assinaturas')
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5" />
                <span>Contratos</span>
              </div>
              {isContratosOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {contratosSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || !!pathname && pathname.startsWith(item.href + '/');
                
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-all duration-300 relative group",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_18px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            boxShadow: [
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                              '0 0 12px hsl(var(--glow-primary) / 1)',
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Cadastros */}
          <Collapsible open={isCadastrosOpen} onOpenChange={setIsCadastrosOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group",
                pathname?.startsWith('/juridico/empresas') || 
                pathname?.startsWith('/juridico/assinantes') ||
                pathname?.startsWith('/juridico/contrapartes')
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                <span>Cadastros</span>
              </div>
              {isCadastrosOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {cadastrosSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || !!pathname && pathname.startsWith(item.href + '/');
                
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-all duration-300 relative group",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_18px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            boxShadow: [
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                              '0 0 12px hsl(var(--glow-primary) / 1)',
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* WhatsApp */}
          <Collapsible open={isWhatsAppOpen} onOpenChange={setIsWhatsAppOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group",
                pathname?.startsWith('/juridico/whatsapp')
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span>WhatsApp</span>
              </div>
              {isWhatsAppOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {whatsappSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || !!pathname && pathname.startsWith(item.href + '/');
                
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-all duration-300 relative group",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_18px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            boxShadow: [
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                              '0 0 12px hsl(var(--glow-primary) / 1)',
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Administração */}
          <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group",
                pathname?.startsWith('/admin')
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <span>Administração</span>
              </div>
              {isAdminOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {adminSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || !!pathname && pathname.startsWith(item.href + '/');
                
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-all duration-300 relative group",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_18px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            boxShadow: [
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                              '0 0 12px hsl(var(--glow-primary) / 1)',
                              '0 0 8px hsl(var(--glow-primary) / 0.8)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>

      <Separator className="relative z-10 border-white/10" />

      {/* Account Section */}
      <div className="p-4 relative z-10 backdrop-blur-sm bg-background/30 border-t border-white/10">
        <div className="space-y-1">
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 relative group",
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary shadow-[0_0_18px_hsl(var(--glow-primary)/0.3)] backdrop-blur-sm"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--glow-primary)/0.15)] hover:border-l-2 hover:border-primary/30"
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary to-accent"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: [
                          '0 0 8px hsl(var(--glow-primary) / 0.8)',
                          '0 0 12px hsl(var(--glow-primary) / 1)',
                          '0 0 8px hsl(var(--glow-primary) / 0.8)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-l-2 hover:border-destructive/30 transition-all duration-300"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export function Sidebar({ 
  mobileOpen, 
  setMobileOpen, 
  onChatOpen 
}: { 
  mobileOpen?: boolean; 
  setMobileOpen?: (open: boolean) => void;
  onChatOpen?: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Calcular se algum subitem está ativo para expandir automaticamente
  const shouldBeOpen = useMemo(() => {
    return juridicoSubItems.some(item => {
      if (item.href === '/juridico') {
        return pathname === '/juridico' || pathname?.startsWith('/juridico/');
      }
      return pathname === item.href || pathname?.startsWith(item.href + '/');
    });
  }, [pathname]);

  const [isJuridicoOpen, setIsJuridicoOpen] = useState(shouldBeOpen);
  const [isContratosOpen, setIsContratosOpen] = useState(pathname?.startsWith('/juridico/templates') || pathname?.startsWith('/juridico/traducao') || pathname?.startsWith('/juridico/assinaturas') || false);
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(pathname?.startsWith('/juridico/empresas') || pathname?.startsWith('/juridico/assinantes') || pathname?.startsWith('/juridico/contrapartes') || false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(pathname?.startsWith('/juridico/whatsapp') || false);
  const [isAdminOpen, setIsAdminOpen] = useState(pathname?.startsWith('/admin') || false);
  const prevShouldBeOpenRef = useRef(shouldBeOpen);

  // Sincronizar apenas quando shouldBeOpen mudar para true (expandir automaticamente)
  // Usar ref para comparar e evitar setState desnecessário durante render
  // Esta é uma sincronização legítima com estado externo (pathname), não um padrão anti-pattern
  useEffect(() => {
    if (shouldBeOpen && !prevShouldBeOpenRef.current && !isJuridicoOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsJuridicoOpen(true);
    }
    prevShouldBeOpenRef.current = shouldBeOpen;
  }, [shouldBeOpen, isJuridicoOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[280px] border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent 
          pathname={pathname}
          isJuridicoOpen={isJuridicoOpen}
          setIsJuridicoOpen={setIsJuridicoOpen}
          isContratosOpen={isContratosOpen}
          setIsContratosOpen={setIsContratosOpen}
          isCadastrosOpen={isCadastrosOpen}
          setIsCadastrosOpen={setIsCadastrosOpen}
          isWhatsAppOpen={isWhatsAppOpen}
          setIsWhatsAppOpen={setIsWhatsAppOpen}
          isAdminOpen={isAdminOpen}
          setIsAdminOpen={setIsAdminOpen}
          setMobileOpen={setMobileOpen}
          signOut={signOut}
          onChatOpen={onChatOpen}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SidebarContent 
            pathname={pathname}
            isJuridicoOpen={isJuridicoOpen}
            setIsJuridicoOpen={setIsJuridicoOpen}
            isContratosOpen={isContratosOpen}
            setIsContratosOpen={setIsContratosOpen}
            isCadastrosOpen={isCadastrosOpen}
            setIsCadastrosOpen={setIsCadastrosOpen}
            isWhatsAppOpen={isWhatsAppOpen}
            setIsWhatsAppOpen={setIsWhatsAppOpen}
            isAdminOpen={isAdminOpen}
            setIsAdminOpen={setIsAdminOpen}
            setMobileOpen={setMobileOpen}
            signOut={signOut}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
