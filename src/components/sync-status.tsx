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

const containerStats = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    show: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
            duration: 0.6
        }
    }
};

const itemStats = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function SyncStatusCard({ modules, latency, lastScan }: SyncStatusProps) {
    return (
        <motion.div
            variants={containerStats}
            initial="hidden"
            animate="show"
            className="glass-panel p-8 w-full max-w-3xl neon-glow relative overflow-hidden"
        >
            {/* SCANNING LINE ANIMATION */}
            <motion.div
                animate={{ translateY: ['-100%', '400%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-neon/50 to-transparent blur-sm pointer-events-none z-10"
            />

            {/* HEADER */}
            <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-6">
                <motion.div variants={itemStats} className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-neon/30 blur-xl rounded-full animate-pulse" />
                        <div className="relative p-3 bg-neon/10 rounded-xl text-neon border border-neon/20">
                            <Activity size={24} className="animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white aurora-text">System Overclock</h3>
                        <p className="text-xs font-mono text-white/40 mt-1">LATENCY: {latency}MS // {lastScan}</p>
                    </div>
                </motion.div>

                <motion.div variants={itemStats} className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                        <ShieldCheck size={14} /> ENCRYPTED
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-xs font-bold text-neon shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Zap size={14} fill="currentColor" /> ACTIVE
                    </div>
                </motion.div>
            </div>

            {/* MODULES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod, i) => (
                    <motion.div
                        key={i}
                        variants={itemStats}
                        className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                {mod.name}
                            </span>
                            <span className="text-xs font-mono text-neon font-bold">{mod.progress}%</span>
                        </div>

                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${mod.progress}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className={`h-full ${mod.status === 'completed' ? 'bg-emerald-500' : 'bg-neon'} neon-glow relative`}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${mod.status === 'syncing' ? 'bg-neon animate-pulse' : mod.status === 'completed' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                            <span className="text-[10px] font-bold uppercase text-white/30 tracking-tighter">
                                {mod.status === 'syncing' ? 'Processing Stream...' : mod.status === 'completed' ? 'Integrity Verified' : 'In Queue'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FOOTER */}
            <motion.div variants={itemStats} className="mt-8 flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 w-full">
                <Server size={14} className="text-white/20" />
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Cepalab Quantum Bridge Node 01</span>
            </motion.div>
        </motion.div>
    );
}
