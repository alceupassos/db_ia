'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, Sparkles, FileText, BarChart3, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface CepalabIAChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function CepalabIAChat({ open, onOpenChange }: CepalabIAChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/juridico/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          messageHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantContent }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    let message = '';
    switch (action) {
      case 'resumir':
        message = 'Por favor, resuma os principais contratos e documentos jurídicos cadastrados no sistema.';
        break;
      case 'analisar':
        message = 'Analise os riscos jurídicos das demandas pendentes e me informe sobre pontos críticos.';
        break;
      case 'redigir':
        message = 'Ajuda-me a redigir um texto jurídico. Por favor, me oriente sobre a estrutura e conteúdo necessário.';
        break;
      default:
        return;
    }
    await sendMessage(message);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-[40px] border-l border-white/10">
        <SheetHeader className="border-b border-white/10 p-4 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px hsl(var(--glow-primary) / 0.4)',
                    '0 0 30px hsl(var(--glow-primary) / 0.6)',
                    '0 0 20px hsl(var(--glow-primary) / 0.4)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Cepalab IA</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">Assistente Jurídica Inteligente</SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Ações Rápidas */}
        <div className="p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações Rápidas</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('resumir')}
              disabled={isLoading}
              className="text-xs border-white/20 bg-background/40 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.2)]"
            >
              <FileText className="mr-1 h-3 w-3" />
              Resumir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('analisar')}
              disabled={isLoading}
              className="text-xs border-white/20 bg-background/40 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.2)]"
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Analisar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('redigir')}
              disabled={isLoading}
              className="text-xs border-white/20 bg-background/40 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.2)]"
            >
              <PenTool className="mr-1 h-3 w-3" />
              Redigir
            </Button>
          </div>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 30px hsl(var(--glow-primary) / 0.4)',
                      '0 0 50px hsl(var(--glow-primary) / 0.6)',
                      '0 0 30px hsl(var(--glow-primary) / 0.4)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-primary mb-6 shadow-[0_0_30px_hsl(var(--glow-primary)/0.4)]"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <p className="text-base font-semibold text-foreground mb-2">
                  Olá! Sou a Cepalab IA
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Sua assistente jurídica inteligente. Posso ajudar com resumos, análises, redação de textos e dúvidas sobre demandas.
                </p>
              </motion.div>
            )}
            
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shrink-0 shadow-[0_0_15px_hsl(var(--glow-primary)/0.3)]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 max-w-[80%] backdrop-blur-sm',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_4px_20px_hsl(var(--glow-primary)/0.3)]'
                      : 'bg-background/60 border border-white/10 text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shrink-0">
                    <span className="text-xs font-bold text-primary">U</span>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shrink-0 shadow-[0_0_15px_hsl(var(--glow-primary)/0.3)]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-background/60 border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={onSubmit} className="border-t border-white/10 p-4 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 bg-background/60 backdrop-blur-md border-white/20 focus-visible:border-primary/60"
            />
            <Button 
              type="submit" 
              variant="glow"
              disabled={isLoading || !input.trim()}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
