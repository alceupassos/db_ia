'use client';

import { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AISearchProps {
  onSearch: (query: string, results: unknown[]) => void;
  demandaId?: string;
}

export function AISearch({ onSearch, demandaId }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/juridico/buscar-semantica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          demandaId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();
      onSearch(query, data.results || []);
    } catch (error: unknown) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Busca semântica usando IA..."
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            variant="outline"
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
