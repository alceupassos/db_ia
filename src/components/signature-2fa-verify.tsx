'use client';

import { useState, useRef } from 'react';
import { Camera, Shield, Keyboard, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Signature2FAVerifyProps {
  documentoId: string;
  securityLevel: 'basico' | 'intermediario' | 'alto' | 'critico';
  onSuccess: () => void;
  onCancel: () => void;
}

export function Signature2FAVerify({ 
  documentoId, 
  securityLevel, 
  onSuccess, 
  onCancel 
}: Signature2FAVerifyProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function verifyCode() {
    if (code.length !== 6) {
      setError('Digite um código de 6 dígitos');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          documentoId,
          method: mode === 'camera' ? 'qrcode' : 'totp'
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Código inválido');
      }
    } catch {
      setError('Erro ao verificar. Tente novamente.');
    } finally {
      setVerifying(false);
    }
  }

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = code.split('');
    newCode[index] = value;
    setCode(newCode.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verificação de Segurança
          </DialogTitle>
          <DialogDescription>
            {securityLevel === 'critico' 
              ? 'Este documento requer verificação por QR Code ou código TOTP'
              : 'Digite o código do seu Google Authenticator'
            }
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg",
          securityLevel === 'critico' && "bg-red-500/10 text-red-500",
          securityLevel === 'alto' && "bg-orange-500/10 text-orange-500",
          securityLevel === 'intermediario' && "bg-yellow-500/10 text-yellow-500",
        )}>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Nível de Segurança: {securityLevel.toUpperCase()}
          </span>
        </div>

        {securityLevel === 'critico' && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'camera' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">
                <Camera className="h-4 w-4 mr-2" />
                Escanear QR
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Keyboard className="h-4 w-4 mr-2" />
                Digitar Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="mt-4">
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded">
                    Aponte para o QR Code do Google Authenticator
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <div className="space-y-4">
                <Label>Código de 6 dígitos</Label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Input
                      key={i}
                      ref={(el: HTMLInputElement | null) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[i] || ''}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-mono"
                    />
                  ))}
                </div>
                <Button 
                  onClick={verifyCode} 
                  className="w-full"
                  disabled={code.length !== 6 || verifying}
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verificar e Assinar
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {securityLevel !== 'critico' && (
          <div className="space-y-4">
            <Label>Código de 6 dígitos</Label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Input
                  key={i}
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[i] || ''}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-mono"
                />
              ))}
            </div>
            <Button 
              onClick={verifyCode} 
              className="w-full"
              disabled={code.length !== 6 || verifying}
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar e Assinar
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
