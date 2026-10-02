import { useState } from 'react';
import { Server } from '../types';
import { X, Copy, Check, Power, Terminal, ExternalLink, Clock, Settings, Shield } from 'lucide-react';

interface ConnectionManagerProps {
  server: Server;
  onClose: () => void;
  isConnected: boolean;
  onToggle: () => void;
  localPort: string;
  onLocalPortChange: (port: string) => void;
  sshCommand: string;
  disconnectCommand: string;
  accessURL: string;
  activatedAt: string | null;
}

export function ConnectionManager({
  server,
  onClose,
  isConnected,
  onToggle,
  localPort,
  onLocalPortChange,
  sshCommand,
  disconnectCommand,
  accessURL,
  activatedAt,
}: ConnectionManagerProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(key);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const formatUptime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const start = new Date(timestamp).getTime();
    const now = Date.now();
    const diff = now - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                <Shield className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{server.name}</h2>
                <p className="text-xs text-slate-400">Connection Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Connection Status */}
          <div className={`rounded-xl p-4 border-2 transition-all ${
            isConnected 
              ? 'bg-emerald-500/5 border-emerald-500/30' 
              : 'bg-slate-900/50 border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className={`text-sm font-semibold ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {isConnected && activatedAt && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Uptime: {formatUptime(activatedAt)}
                  </span>
                )}
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={onToggle}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  isConnected ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span className="sr-only">Toggle connection</span>
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform shadow-lg ${
                    isConnected ? 'translate-x-10' : 'translate-x-1.5'
                  }`}
                />
                <span className={`absolute text-[10px] font-bold ${
                  isConnected ? 'left-2.5 text-emerald-100' : 'right-2.5 text-slate-400'
                }`}>
                  {isConnected ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* Access Info */}
          {isConnected && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Access Opera PMS</p>
              <a
                href={accessURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 w-full"
              >
                {accessURL}
                <ExternalLink className="w-3.5 h-3.5 ml-auto" />
              </a>
            </div>
          )}

          {/* Connection Details */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Connection Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-300 font-medium capitalize">{server.connectionMethod.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local Port</span>
                <span className="text-slate-200 font-mono">{localPort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remote Host</span>
                <span className="text-slate-200 font-mono">{server.operaHost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remote Port</span>
                <span className="text-slate-200 font-mono">{server.operaPort || '80'}</span>
              </div>
              {server.sshHost && (
                <div className="flex justify-between">
                  <span className="text-slate-500">SSH Jump Host</span>
                  <span className="text-slate-200 font-mono">{server.sshHost}:{server.sshPort || '22'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Port Configuration */}
          {!isConnected && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-medium text-slate-300">Local Port</h3>
              </div>
              <input
                type="text"
                value={localPort}
                onChange={(e) => onLocalPortChange(e.target.value)}
                placeholder="80"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">
                Access Opera at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">http://localhost:{localPort}</code> after connecting
              </p>
            </div>
          )}

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide' : 'Show'} SSH Commands (Debug)
            </button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Connect Command</span>
                    <button
                      onClick={() => copyToClipboard(sshCommand, 'ssh')}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-colors"
                    >
                      {copiedCommand === 'ssh' ? (
                        <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <code className="text-[11px] text-green-300 font-mono break-all">{sshCommand}</code>
                </div>

                {isConnected && (
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Disconnect Command</span>
                      <button
                        onClick={() => copyToClipboard(disconnectCommand, 'disconnect')}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-colors"
                      >
                        {copiedCommand === 'disconnect' ? (
                          <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    </div>
                    <code className="text-[11px] text-red-300 font-mono break-all">{disconnectCommand}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
