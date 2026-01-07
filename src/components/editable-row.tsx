'use client';

import { useState } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableRowProps {
  label: string;
  value: string | null;
  type?: 'text' | 'date' | 'textarea';
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}

export function EditableRow({ 
  label, 
  value, 
  type = 'text', 
  onSave, 
  className,
  placeholder 
}: EditableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditValue(value || '');
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={placeholder}
            />
          ) : (
            <Input
              type={type === 'date' ? 'date' : 'text'}
              value={type === 'date' ? formatDate(editValue) : editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              placeholder={placeholder}
            />
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={saving}
            className="h-9 w-9"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={saving}
            className="h-9 w-9"
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <p className="flex-1 font-medium">
          {type === 'date' ? formatDisplayDate(value) : (value || '-')}
        </p>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleStartEdit}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
