'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Smartphone, Key, CheckCircle, Alert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert as AlertComponent, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export function TwoFactorSetup() {
  const [step, setStep] = useState<'intro' | 'qrcode' | 'verify' | 'backup' | 'done'>('intro');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function initSetup() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      if (!response.ok) throw new Error('Erro ao configurar 2FA');
      const { secret, qrCodeUrl } = await response.json();
      setSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setStep('qrcode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndEnable() {
    if (verifyCode.length !== 6) {
      setError('Digite um código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Código inválido');
      }

      const { backupCodes } = await response.json();
      setBackupCodes(backupCodes || []);
      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'intro' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Proteja sua conta</h2>
                <p className="text-muted-foreground">
                  A autenticação de dois fatores adiciona uma camada extra de segurança.
                  Você precisará do código do seu celular além da senha.
                </p>
              </div>
              {error && (
                <AlertComponent variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </AlertComponent>
              )}
              <Button onClick={initSetup} className="w-full" disabled={loading}>
                <Smartphone className="h-4 w-4 mr-2" />
                {loading ? 'Configurando...' : 'Configurar Google Authenticator'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'qrcode' && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-center mb-4">Escaneie o QR Code</h2>
              <div className="bg-white p-4 rounded-lg flex justify-center mb-4">
                {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} size={200} />}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Ou digite o código manualmente:
                </p>
                <code className="bg-muted px-3 py-2 rounded font-mono text-sm block break-all">
                  {secret}
                </code>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label>Digite o código de 6 dígitos</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={verifyCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerifyCode(val);
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <Button 
                  onClick={verifyAndEnable}
                  disabled={loading || verifyCode.length !== 6}
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
              {error && (
                <AlertComponent variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </AlertComponent>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'backup' && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">2FA Ativado!</h2>
            </div>
            
            <AlertComponent>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Guarde estes códigos de backup em lugar seguro. 
                Use-os caso perca acesso ao seu celular.
              </AlertDescription>
            </AlertComponent>
            
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <code 
                  key={i} 
                  className="bg-muted p-2 rounded text-center font-mono text-sm"
                >
                  {code}
                </code>
              ))}
            </div>
            
            <Button onClick={() => setStep('done')} className="w-full">
              Entendi, guardei os códigos
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'done' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-xl font-bold">Configuração Concluída!</h2>
            <p className="text-muted-foreground">
              Sua conta está protegida com autenticação de dois fatores.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
