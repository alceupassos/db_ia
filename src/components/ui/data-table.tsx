'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowCard } from './glow-card';

interface Column {
  header: string;
  accessor: string;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function DataTable({ columns, data, title, onRowClick }: DataTableProps) {
  return (
    <GlowCard variant="gradient" className="overflow-hidden w-full flex flex-col">
      {title && (
        <div className="p-6 border-b border-border/50 bg-background/30">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
          <div className="flex gap-2 mt-2">
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/30">
              {data.length} Registros
            </span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-background/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider",
                    "transition-colors"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable !== false && (
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/20 transition-all duration-300 cursor-pointer group",
                  "hover:bg-accent/20 hover:shadow-[0_0_15px_hsl(var(--glow-accent)/0.1)]",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-6 py-4 text-sm text-foreground/90",
                      "transition-colors group-hover:text-foreground"
                    )}
                  >
                    {typeof row[col.accessor] === 'number' && col.accessor.toLowerCase().includes('valor')
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(row[col.accessor] as number)
                      : String(row[col.accessor] || '—')}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-all duration-300",
                      "hover:shadow-[0_0_8px_hsl(var(--glow-accent)/0.2)] p-1 rounded"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlowCard>
  );
}
