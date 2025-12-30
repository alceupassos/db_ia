'use client';

import { useState, useTransition } from 'react';
import { askCepalab } from './actions/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Database, Terminal } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: React.ReactNode }[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: { role: 'user' | 'assistant'; content: React.ReactNode } = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const response = await askCepalab(input);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon rounded-xl flex items-center justify-center neon-glow">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">CEPALAB OS</h1>
        </div>
        <div className="flex items-center gap-6 text-white/40 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Database size={14} />
            <span>ERP BRIDGE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span>RUNTIME: GEMINI 3 FLASH</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-4xl mt-12 mb-24 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-10 px-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
            >
              <h2 className="text-5xl font-bold tracking-tight text-white/90">
                O que vamos analisar <br />
                <span className="text-neon">no ERP hoje?</span>
              </h2>
              <p className="text-white/40 max-w-md">
                Conexão segura via Gravity Bridge estabelecida.
                Pergunte sobre faturamento, despesas ou KPIs financeiros.
              </p>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'user' ? (
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 max-w-[80%]">
                  {m.content}
                </div>
              ) : (
                <div className="w-full">
                  {m.content}
                </div>
              )}
            </motion.div>
          ))}

          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-1 animate-pulse">
                <div className="w-2 h-2 bg-neon rounded-full" />
                <div className="w-2 h-2 bg-neon/60 rounded-full" />
                <div className="w-2 h-2 bg-neon/30 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input UI */}
      <footer className="w-full max-w-3xl fixed bottom-8 z-20 px-4">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-neon to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Comando para Cepalab.ia..."
            className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full py-5 px-8 outline-none focus:border-neon/50 focus:ring-4 focus:ring-neon/10 transition-all text-lg pr-20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-3 top-2.5 bg-neon hover:bg-neon/80 p-2.5 rounded-full text-white transition-colors disabled:opacity-50 neon-glow"
          >
            <Send size={24} />
          </button>
        </form>
      </footer>
    </main>
  );
}
