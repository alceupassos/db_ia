'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: number;
    trend: number;
    isPositive: boolean;
}

export function KpiCard({ title, value, trend, isPositive }: KpiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02, translateY: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-panel p-8 w-full max-w-sm neon-glow relative overflow-hidden group"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} />
            </div>

            <div className="relative z-10">
                <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-4">{title}</p>

                <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0
                        }).format(value)}
                    </h2>
                </div>

                <div className="mt-6 flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend)}%
                    </div>
                    <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">vs mês anterior</span>
                </div>
            </div>

            {/* Progress bar simulation */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-neon/40 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}
