import { useState } from 'react';
import { Server } from '../types';
import { X, Copy, Check, Power, Terminal, ExternalLink, Clock, Settings } from 'lucide-react';

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
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                <Power className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{server.name}</h2>
                <p className="text-xs text-slate-400">Connection Manager</p>
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

        <div className="p-5 space-y-5">
          {/* Main Toggle */}
          <div className={`rounded-xl p-6 border-2 transition-all ${
            isConnected 
              ? 'bg-emerald-500/5 border-emerald-500/30' 
              : 'bg-slate-900/50 border-slate-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">SSH Tunnel Status</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  {isConnected && activatedAt && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Uptime: {formatUptime(activatedAt)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={onToggle}
                className={`relative inline-flex h-14 w-24 items-center rounded-full transition-colors ${
                  isConnected ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span className="sr-only">Toggle connection</span>
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform shadow-lg ${
                    isConnected ? 'translate-x-12' : 'translate-x-2'
                  }`}
                />
                <span className={`absolute text-xs font-bold ${
                  isConnected ? 'left-3 text-emerald-100' : 'right-3 text-slate-400'
                }`}>
                  {isConnected ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Connection Details */}
            {isConnected && (
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Local Port:</span>
                    <span className="ml-2 text-slate-200 font-mono">{localPort}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Remote:</span>
                    <span className="ml-2 text-slate-200 font-mono">
                      {server.operaHost}{server.operaPort ? `:${server.operaPort}` : ''}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Access URL:</span>
                    <a
                      href={accessURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
                    >
                      {accessURL}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local Port Configuration */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-medium text-slate-300">Local Port Configuration</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Local port to forward from
                </label>
                <input
                  type="text"
                  value={localPort}
                  onChange={(e) => onLocalPortChange(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Remote Opera server
                </label>
                <div className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-sm font-mono">
                  {server.operaHost}{server.operaPort ? `:${server.operaPort}` : ''}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isConnected ? (
                <span className="text-amber-400">
                  ⚠️ Changing the port requires toggling the connection off and on again
                </span>
              ) : (
                <>
                  Access Opera at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">http://localhost:{localPort}</code> after connecting
                </>
              )}
            </p>
          </div>

          {/* SSH Command */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-medium text-slate-300">SSH Tunnel Command</h3>
              </div>
              <button
                onClick={() => copyToClipboard(sshCommand, 'ssh')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
              >
                {copiedCommand === 'ssh' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
              <code className="text-xs text-green-300 font-mono break-all">{sshCommand}</code>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isConnected ? (
                '✓ Tunnel should be active. If not, copy and run this command in PowerShell.'
              ) : (
                'Copy this command and paste it into PowerShell to establish the tunnel.'
              )}
            </p>
          </div>

          {/* Disconnect Instructions */}
          {isConnected && (
            <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-red-400">Disconnect</h3>
                <button
                  onClick={() => copyToClipboard(disconnectCommand, 'disconnect')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  {copiedCommand === 'disconnect' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mb-2">
                <code className="text-xs text-red-300 font-mono break-all">{disconnectCommand}</code>
              </div>
              <p className="text-xs text-slate-500">
                Run this PowerShell command to close the tunnel, or simply close the PowerShell window.
              </p>
            </div>
          )}

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Connection Details</p>
                  <div className="space-y-1 text-xs font-mono text-slate-400">
                    <div><span className="text-slate-500">Server ID:</span> {server.id}</div>
                    <div><span className="text-slate-500">SSH Host:</span> {server.sshHost || 'N/A'}</div>
                    <div><span className="text-slate-500">SSH Port:</span> {server.sshPort || '22'}</div>
                    <div><span className="text-slate-500">SSH User:</span> {server.sshUser || 'N/A'}</div>
                    {server.sshKeyPath && (
                      <div><span className="text-slate-500">SSH Key:</span> {server.sshKeyPath}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
