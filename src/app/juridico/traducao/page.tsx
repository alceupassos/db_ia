'use client';

import { BilingualEditor } from '@/components/bilingual-editor';
import { Card, CardContent } from '@/components/ui/card';

export default function TraducaoPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tradução Bicolunar</h1>
          <p className="text-muted-foreground">
            Traduza contratos e documentos jurídicos mantendo a precisão técnica
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <BilingualEditor />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
