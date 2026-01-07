'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Search, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  MessageSquare,
  FolderOpen,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  keywords?: string[];
  group: string;
}

const commands: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" />, href: '/juridico/dashboard', keywords: ['dashboard', 'home'], group: 'Navegação' },
  { id: 'demandas', label: 'Demandas', icon: <FileText className="h-4 w-4" />, href: '/juridico', keywords: ['demandas', 'casos'], group: 'Navegação' },
  { id: 'arquivos', label: 'Arquivos', icon: <FolderOpen className="h-4 w-4" />, href: '/juridico/arquivos', keywords: ['arquivos', 'documentos'], group: 'Navegação' },
  { id: 'templates', label: 'Templates', icon: <Scale className="h-4 w-4" />, href: '/juridico/templates', keywords: ['templates', 'modelos'], group: 'Navegação' },
  { id: 'usuarios', label: 'Usuários', icon: <Users className="h-4 w-4" />, href: '/admin/usuarios', keywords: ['usuarios', 'users', 'admin'], group: 'Administração' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" />, href: '/juridico/whatsapp', keywords: ['whatsapp', 'chat'], group: 'Comunicação' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = commands.filter(cmd => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
    );
  });

  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-2xl">
        <CommandPrimitive className="[&_[cmdk-input]]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar comandos... (CMD+K)"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </CommandPrimitive.Empty>
            {Object.entries(grouped).map(([group, items]) => (
              <CommandPrimitive.Group key={group} heading={group}>
                {items.map((cmd) => (
                  <CommandPrimitive.Item
                    key={cmd.id}
                    value={cmd.id}
                    onSelect={() => {
                      if (cmd.href) {
                        router.push(cmd.href);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground"
                    )}
                  >
                    <div className="mr-2">{cmd.icon}</div>
                    {cmd.label}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
