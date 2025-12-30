'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

interface Column {
    header: string;
    accessor: string;
}

interface GlassTableProps {
    columns: Column[];
    data: Record<string, unknown>[];
    title?: string;
}

export function GlassTable({ columns, data, title }: GlassTableProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel overflow-hidden w-full flex flex-col"
        >
            {title && (
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
                    <div className="flex gap-2">
                        <span className="bg-neon/20 text-neon text-xs px-2 py-1 rounded-full border border-neon/30">
                            {data.length} Registros
                        </span>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            {columns.map((col, i) => (
                                <th key={i} className="px-6 py-4 text-sm font-semibold text-white/60 lowercase tracking-wider">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                        {col.header}
                                        <ArrowUpDown size={14} />
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((row, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                {columns.map((col, j) => (
                                    <td key={j} className="px-6 py-4 text-sm text-white/90">
                                        {typeof row[col.accessor] === 'number' && col.accessor.toLowerCase().includes('valor')
                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row[col.accessor] as number)
                                            : String(row[col.accessor])}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <button className="text-white/40 hover:text-white transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
