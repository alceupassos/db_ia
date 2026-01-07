'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Search, FileText } from 'lucide-react';
import { SkeletonTable } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';

interface Template {
  id: string;
  categoria: string;
  nome_pt: string;
  nome_en: string;
  descricao_pt?: string;
  empresa: string;
  orgao_destino?: string[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [categoriaFilter, empresaFilter]);

  async function loadTemplates() {
    try {
      const params = new URLSearchParams();
      if (categoriaFilter) params.append('categoria', categoriaFilter);
      if (empresaFilter) params.append('empresa', empresaFilter);

      const response = await fetch(`/api/juridico/templates?${params}`);
      const data = await response.json();

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTemplates = templates.filter(t => {
    const searchLower = search.toLowerCase();
    return (
      t.nome_pt.toLowerCase().includes(searchLower) ||
      t.nome_en.toLowerCase().includes(searchLower) ||
      t.descricao_pt?.toLowerCase().includes(searchLower)
    );
  });

  const categorias = Array.from(new Set(templates.map(t => t.categoria)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates Jurídicos</h1>
          <p className="text-muted-foreground">
            Banco de templates bilingues para contratos, procurações e documentos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="CEPALAB">CEPALAB</SelectItem>
                <SelectItem value="SIBIONICS">SIBIONICS</SelectItem>
                <SelectItem value="REALTRADE">REALTRADE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} />
          ) : filteredTemplates.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="Nenhum template encontrado"
              description="Não há templates cadastrados ainda"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.nome_pt}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{template.nome_en}</p>
                      </div>
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {template.descricao_pt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.descricao_pt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {template.categoria}
                      </span>
                      <span className="px-2 py-1 bg-secondary rounded">
                        {template.empresa}
                      </span>
                    </div>
                    {template.orgao_destino && template.orgao_destino.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Órgãos: {template.orgao_destino.join(', ')}
                      </div>
                    )}
                    <Link href={`/juridico/templates/${template.id}`}>
                      <Button className="w-full" variant="outline">
                        Usar Template
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
