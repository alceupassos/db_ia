'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Languages, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BilingualEditorProps {
  initialTextPt?: string;
  initialTextEn?: string;
  onSave?: (textPt: string, textEn: string) => void;
}

export function BilingualEditor({ 
  initialTextPt = '', 
  initialTextEn = '',
  onSave 
}: BilingualEditorProps) {
  const [textPt, setTextPt] = useState(initialTextPt);
  const [textEn, setTextEn] = useState(initialTextEn);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);

  async function handleTranslate() {
    if (!textPt.trim()) return;

    setTranslating(true);
    try {
      const response = await fetch('/api/juridico/traducao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textPt,
          targetLanguage,
          sourceLanguage: 'pt-BR',
        }),
      });

      if (!response.ok) throw new Error('Erro ao traduzir');

      const { translated } = await response.json();
      setTextEn(translated);
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Editor Bicolunar
        </h3>
        <div className="flex gap-2">
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">Inglês</SelectItem>
              <SelectItem value="es">Espanhol</SelectItem>
              <SelectItem value="fr">Francês</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleTranslate} 
            disabled={translating || !textPt.trim()}
            variant="outline"
          >
            {translating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traduzindo...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Traduzir
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Português (PT-BR)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={textPt}
              onChange={(e) => setTextPt(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Digite ou cole o texto em português..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tradução ({targetLanguage.toUpperCase()})</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Tradução aparecerá aqui..."
            />
          </CardContent>
        </Card>
      </div>

      {onSave && (
        <div className="flex justify-end gap-2">
          <Button onClick={() => onSave(textPt, textEn)}>
            Salvar Tradução
          </Button>
        </div>
      )}
    </div>
  );
}
