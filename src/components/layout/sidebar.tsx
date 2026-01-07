'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
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
  Sparkles
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
  { icon: BarChart3, label: 'Relatórios', href: '/juridico/relatorios' },
  { icon: Sparkles, label: 'Cepalab IA', href: '#', isAction: true },
];

const accountItems = [
  { icon: Settings, label: 'Configurações', href: '/juridico/config' },
];

function SidebarContent({ 
  pathname, 
  isJuridicoOpen, 
  setIsJuridicoOpen, 
  setMobileOpen, 
  signOut,
  onChatOpen
}: { 
  pathname: string | null;
  isJuridicoOpen: boolean;
  setIsJuridicoOpen: (open: boolean) => void;
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
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Camada Jurídica</span>
            <span className="text-xs text-muted-foreground">Cepalab</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          <Collapsible open={isJuridicoOpen} onOpenChange={setIsJuridicoOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isJuridicoActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setMobileOpen?.(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>

      <Separator />

      {/* Account Section */}
      <div className="p-4">
        <div className="space-y-1">
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="mt-4 w-full justify-start gap-3"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
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
