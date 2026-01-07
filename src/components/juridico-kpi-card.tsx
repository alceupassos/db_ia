'use client';

import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface JuridicoKPICardProps {
  title: string;
  value: number;
  icon: 'total' | 'pendente' | 'andamento' | 'concluido';
  trend?: number;
}

const icons = {
  total: FileText,
  pendente: AlertCircle,
  andamento: Clock,
  concluido: CheckCircle
};

const colors = {
  total: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  pendente: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
  andamento: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
  concluido: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
};

export function JuridicoKPICard({ title, value, icon, trend }: JuridicoKPICardProps) {
  const Icon = icons[icon];
  const colorClass = colors[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-input p-6 rounded-xl relative overflow-hidden group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-white mb-1">{value}</h3>
          {trend !== undefined && (
            <p className="text-xs text-white/40">+{trend} este mês</p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
