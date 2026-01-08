'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/export-button';
import { FileSpreadsheet, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';

export default function RelatoriosPage() {
  const relatorios = [
    {
      id: 1,
      icon: FileSpreadsheet,
      title: 'Relatório de Demandas',
      description: 'Exporte todas as demandas jurídicas para Excel com informações completas.',
      available: true,
    },
    {
      id: 2,
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Relatórios com gráficos e análises detalhadas.',
      available: false,
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Exporte relatórios e análises do sistema
          </p>
        </div>
      </div>

      {/* Relatórios disponíveis */}
      <div className="grid gap-6 md:grid-cols-2">
        {relatorios.map((relatorio, index) => {
          const Icon = relatorio.icon;
          return (
            <motion.div
              key={relatorio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlowCard
                glowColor="primary"
                variant="gradient"
                className="h-full flex flex-col group hover:scale-[1.02] transition-transform duration-300"
              >
                <CardHeader className="flex-1">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium">
                      {relatorio.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {relatorio.description}
                  </p>
                  {relatorio.available ? (
                    <ExportButton />
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      Em breve
                    </div>
                  )}
                </CardContent>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
