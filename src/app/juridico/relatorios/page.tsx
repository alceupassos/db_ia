'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/export-button';
import { FileSpreadsheet, BarChart3 } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Exporte relatórios e análises do sistema
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Relatórios disponíveis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Relatório de Demandas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todas as demandas jurídicas para Excel com informações completas.
            </p>
            <ExportButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Avançado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Relatórios com gráficos e análises detalhadas. (Em breve)
            </p>
            <ExportButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
