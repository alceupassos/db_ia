'use client';

import { useState, useTransition, useEffect } from 'react';
import { askCepalab } from './actions/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Database, Terminal, Sparkles, Command } from 'lucide-react';

type UIState = 'IDLE' | 'PROCESSING' | 'RENDERED';

export default function Home() {
  const [input, setInput] = useState('');
  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [currentStream, setCurrentStream] = useState<React.ReactNode>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setUiState('PROCESSING');

    // Reset para novo comando (ignora histórico anterior visualmente)
    setCurrentStream(null);

    startTransition(async () => {
      try {
        const response = await askCepalab(input);
        setCurrentStream(response);
        setUiState('RENDERED');
      } catch (error) {
        console.error(error);
        setUiState('IDLE');
      }
    });
  };

  const handleReset = () => {
    setUiState('IDLE');
    setInput('');
    setCurrentStream(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-void">
      {/* GLOBAL AMBIENT LIGHTING */}
      <div className="fixed inset-0 pointer-events-none data-[state=processing]:animate-pulse" data-state={uiState.toLowerCase()}>
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-aurora-purple/10 blur-[150px] rounded-full mix-blend-screen animate-[aurora_20s_infinite]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-aurora-blue/10 blur-[150px] rounded-full mix-blend-screen animate-[aurora_15s_infinite_reverse]" />
      </div>

      {/* HEADER - DYNAMIC POSITION */}
      <motion.header
        layout
        className="fixed top-8 w-full max-w-7xl flex justify-between items-center z-50 px-8"
      >
        <div className="flex items-center gap-3" onClick={handleReset} role="button">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 180 }}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md cursor-pointer"
          >
            <Zap className="text-neon" size={20} fill="currentColor" />
          </motion.div>
          <span className="text-lg font-bold tracking-tighter text-white/80">CEPALAB OS</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-white/30 uppercase tracking-widest hidden md:flex">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Bridge Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} />
            <span>Gemini 2.0 Flash</span>
          </div>
        </div>
      </motion.header>

      {/* MAIN STAGE */}
      <div className="relative w-full max-w-5xl z-10 flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">

          {/* STATE: IDLE (HERO PROMPT) */}
          {uiState === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-neon/20 blur-[50px] animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white relative z-10">
                  <span className="aurora-text">Fluid</span> Intelligence
                </h1>
              </div>
              <p className="text-white/40 text-lg max-w-md font-light">
                Acesse o núcleo do ERP Supra. <br />Pergunte sobre status, faturamento ou KPIs.
              </p>
            </motion.div>
          )}

          {/* STATE: PROCESSING (LOADING) */}
          {uiState === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-t-2 border-neon rounded-full animate-spin" />
                  <div className="absolute inset-2 border-r-2 border-aurora-blue rounded-full animate-spin [animation-duration:2s]" />
                  <div className="absolute inset-4 border-b-2 border-aurora-purple rounded-full animate-spin [animation-duration:3s]" />
                </div>
                <span className="text-xs font-mono text-neon uppercase tracking-[0.3em] animate-pulse">
                  Synthesizing Interface...
                </span>
              </div>
            </motion.div>
          )}

          {/* STATE: RENDERED (GENERATIVE UI) */}
          {uiState === 'RENDERED' && currentStream && (
            <motion.div
              key="rendered"
              initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="w-full flex justify-center"
            >
              {currentStream}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* INPUT DOCK (ALWAYS VISIBLE BUT MORPHS) */}
      <motion.footer
        layout
        className={`fixed bottom-10 w-full z-40 transition-all duration-700 ease-[0.16,1,0.3,1] ${uiState === 'IDLE' ? 'max-w-2xl' : 'max-w-xl scale-90 opacity-40 hover:opacity-100 hover:scale-100'
          }`}
      >
        <form onSubmit={handleSubmit} className="relative group">
          <div className={`absolute inset-0 bg-neon/20 blur-xl rounded-full transition-opacity duration-500 ${uiState === 'PROCESSING' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

          <div className="relative glass-input flex items-center p-2 pl-6 overflow-hidden">
            <Sparkles
              size={20}
              className={`mr-4 transition-colors ${uiState === 'PROCESSING' ? 'text-neon animate-pulse' : 'text-white/40'}`}
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Comando para o núcleo..."
              disabled={uiState === 'PROCESSING'}
              className="w-full bg-transparent border-none text-white outline-none placeholder:text-white/20 font-medium py-3"
            />

            <button
              type="submit"
              disabled={uiState === 'PROCESSING' || !input.trim()}
              className="p-3 bg-white/10 hover:bg-neon hover:text-white text-white/50 rounded-full transition-all duration-300 disabled:opacity-0 disabled:scale-50"
            >
              <Send size={18} />
            </button>
          </div>

          {/* HINT */}
          <div className={`absolute -bottom-8 left-0 w-full text-center transition-opacity duration-300 ${uiState === 'IDLE' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest flex items-center justify-center gap-2">
              <Command size={10} /> Press Enter to execute
            </span>
          </div>
        </form>
      </motion.footer>

    </main>
  );
}
