'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, QrCode, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function WhatsAppPage() {
  const [sessionStatus, setSessionStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch('/api/whatsapp/session?session=default');
      const data = await response.json();
      setSessionStatus(data.status === 'open' ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  async function startSession() {
    setSessionStatus('connecting');
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName: 'default', start: true }),
      });
      const data = await response.json();
      
      if (data.qrcode) {
        setQrCode(data.qrcode.base64);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setSessionStatus('disconnected');
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie mensagens e lembretes automáticos via WhatsApp
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {sessionStatus === 'connected' ? 'Conectado' : 
                 sessionStatus === 'connecting' ? 'Conectando...' : 
                 'Desconectado'}
              </p>
            </div>
            {sessionStatus === 'connected' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Button onClick={startSession} disabled={sessionStatus === 'connecting'}>
                <QrCode className="h-4 w-4 mr-2" />
                Conectar WhatsApp
              </Button>
            )}
          </div>

          {qrCode && (
            <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com seu WhatsApp
              </p>
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
