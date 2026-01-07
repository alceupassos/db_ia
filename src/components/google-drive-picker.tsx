'use client';

import { useEffect, useState } from 'react';
import { Upload, X, ExternalLink, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    google?: {
      picker: {
        PickerBuilder: new () => {
          addView(view: any): any;
          setOAuthToken(token: string): any;
          setCallback(callback: (data: any) => void): any;
          setOrigin(origin: string): any;
          build(): any;
          setVisible(visible: boolean): void;
        };
        ViewId: {
          DOCS: string;
          SPREADSHEETS: string;
          PRESENTATIONS: string;
          PDFS: string;
          DOCS_IMAGES: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
        Response: {
          ACTION: string;
        };
      };
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        getAuthInstance: () => any;
      };
    };
  }
}

interface GoogleDrivePickerProps {
  onFileSelect: (file: {
    id: string;
    name: string;
    mimeType: string;
    url: string;
  }) => void;
  disabled?: boolean;
}

export function GoogleDrivePicker({ onFileSelect, disabled }: GoogleDrivePickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Carrega os scripts do Google Picker
    const loadGoogleScripts = () => {
      if (window.google?.picker && window.gapi) {
        setScriptsLoaded(true);
        return;
      }

      // Carrega GAPI
      if (!document.querySelector('script[src*="apis.google.com"]')) {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => {
          if (window.gapi) {
            window.gapi.load('picker', () => {
              setScriptsLoaded(true);
            });
          }
        };
        document.head.appendChild(gapiScript);
      }

      // Carrega Google Picker
      if (!document.querySelector('script[src*="picker"]')) {
        const pickerScript = document.createElement('script');
        pickerScript.src = 'https://apis.google.com/js/picker.js';
        pickerScript.async = true;
        pickerScript.defer = true;
        pickerScript.onload = () => {
          if (window.gapi && window.google?.picker) {
            window.gapi.load('picker', () => {
              setScriptsLoaded(true);
            });
          }
        };
        document.head.appendChild(pickerScript);
      }
    };

    loadGoogleScripts();
  }, []);

  const handlePickFile = async () => {
    if (!scriptsLoaded) {
      setError('Aguardando carregamento do Google Picker...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID não configurado. Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID no .env.local');
      }

      // Obtém token de acesso
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            setError('Erro ao obter permissão: ' + response.error);
            setLoading(false);
            return;
          }

          const accessToken = response.access_token;
          
          // Cria o picker
          const viewIds = window.google!.picker.ViewId;
          const actions = window.google!.picker.Action;
          const pickerResponse = window.google!.picker.Response;
          const picker = new window.google!.picker.PickerBuilder()
            .addView(viewIds.DOCS)
            .addView(viewIds.PDFS)
            .setOAuthToken(accessToken)
            .setCallback((data: { docs: Array<{ id: string; name: string; mimeType: string }>; [key: string]: unknown }) => {
              if (data[pickerResponse.ACTION] === actions.PICKED) {
                const file = data.docs[0];
                onFileSelect({
                  id: file.id,
                  name: file.name,
                  mimeType: file.mimeType,
                  url: `https://drive.google.com/file/d/${file.id}/view`
                });
              }
              setLoading(false);
            })
            .setOrigin(window.location.origin)
            .build();
          
          picker.setVisible(true);
        }
      });

      tokenClient.requestAccessToken();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir Google Drive Picker');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handlePickFile}
        disabled={disabled || loading}
        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Carregando...
          </>
        ) : (
          <>
            <Upload size={18} />
            Selecionar do Google Drive
          </>
        )}
      </button>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}

interface FileListProps {
  files: Array<{
    id: string;
    nome: string;
    google_drive_url?: string;
    tipo?: string;
  }>;
  onRemove?: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1">
            <FileText size={18} className="text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{file.nome}</p>
              {file.tipo && (
                <p className="text-xs text-muted-foreground">{file.tipo}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file.google_drive_url && (
              <a
                href={file.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded transition-colors"
              >
                <ExternalLink size={18} className="text-muted-foreground" />
              </a>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(file.id)}
                className="p-2 hover:bg-destructive/20 rounded transition-colors"
              >
                <X size={18} className="text-destructive" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}


