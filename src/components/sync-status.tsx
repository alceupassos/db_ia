'use client';

import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Server } from 'lucide-react';

interface SyncModule {
    name: string;
    status: 'pending' | 'syncing' | 'completed';
    progress: number;
}

interface SyncStatusProps {
    modules: SyncModule[];
    latency: number;
    lastScan: string;
}

export function SyncStatusCard({ modules, latency, lastScan }: SyncStatusProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 w-full max-w-2xl neon-glow relative overflow-hidden"
        >
            {/* SCANNING LINE ANIMATION */}
            <motion.div
                animate={{ translateY: ['0%', '400%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent opacity-20 pointer-events-none"
            />

            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon/10 rounded-lg text-neon">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">System Overclock</h3>
                        <p className="text-[10px] font-mono text-white/40">LATENCY: {latency}MS // {lastScan}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                        <ShieldCheck size={12} /> ENCRYPTED
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neon">
                        <Zap size={12} fill="currentColor" /> ACTIVE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((mod, i) => (
                    <div key={i} className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-neon/30 transition-all">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                                {mod.name}
                            </span>
                            <span className="text-[10px] font-mono text-neon">{mod.progress}%</span>
                        </div>

                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${mod.progress}%` }}
                                className={`h-full ${mod.status === 'completed' ? 'bg-emerald-500' : 'bg-neon'} neon-glow`}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${mod.status === 'syncing' ? 'bg-neon animate-pulse' : mod.status === 'completed' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                            <span className="text-[9px] font-bold uppercase text-white/30 tracking-tighter">
                                {mod.status === 'syncing' ? 'Processing Stream...' : mod.status === 'completed' ? 'Integrity Verified' : 'In Queue'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-dashed border-white/10">
                <Server size={14} className="text-white/20" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">Cepalab Quantum Bridge Node 01</span>
            </div>
        </motion.div>
    );
}
