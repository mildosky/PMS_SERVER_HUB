import { Server } from '../types';
import {
  generateSSHTunnelCommand,
  generatePuttyCommand,
  generateRDPFile,
  generateWireGuardConfig,
  getLocalAccessURL,
  getConnectionMethodInfo,
  downloadFile,
} from '../utils/connections';
import {
  Terminal,
  Download,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Monitor,
  Cable,
  Info,
} from 'lucide-react';
import { useState } from 'react';

interface ConnectionPanelProps {
  server: Server;
  onClose: () => void;
}

export function ConnectionPanel({ server, onClose }: ConnectionPanelProps) {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [localPort, setLocalPort] = useState(server.operaPort);

  const methodInfo = getConnectionMethodInfo(server.connectionMethod);
  const localURL = getLocalAccessURL(server, localPort);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const renderSSHSection = () => {
    const sshCmd = generateSSHTunnelCommand(server, localPort);
    const puttyCmd = generatePuttyCommand(server, localPort);

    return (
      <div className="space-y-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-200">SSH Tunnel Command</span>
            </div>
            <button
              onClick={() => copyToClipboard(sshCmd, 'ssh')}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {copiedCmd === 'ssh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'ssh' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code className="block text-xs text-green-300 font-mono break-all bg-slate-950 p-3 rounded border border-slate-800">
            {sshCmd}
          </code>
          <p className="text-xs text-slate-500 mt-2">
            Run this in your terminal. Then access Opera at the URL below.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">PuTTY (Windows)</span>
            </div>
            <button
              onClick={() => copyToClipboard(puttyCmd, 'putty')}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {copiedCmd === 'putty' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'putty' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code className="block text-xs text-blue-300 font-mono break-all bg-slate-950 p-3 rounded border border-slate-800">
            {puttyCmd}
          </code>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-slate-200">Local Port</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
              className="w-24 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">
              → forwards to {server.operaHost}:{server.operaPort}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRDPSection = () => {
    const rdpContent = generateRDPFile(server);

    return (
      <div className="space-y-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">Remote Desktop Connection</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Download the .rdp file and double-click to open in Windows Remote Desktop.
            This connects you to the on-site workstation where Opera is running.
          </p>
          <button
            onClick={() => downloadFile(rdpContent, `${server.name.replace(/\s+/g, '_')}.rdp`, 'application/x-rdp')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .rdp File
          </button>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Host: <span className="text-slate-300 font-mono">{server.rdpHost || server.operaHost}</span></p>
            <p>Port: <span className="text-slate-300 font-mono">{server.rdpPort || '3389'}</span></p>
            {server.rdpUsername && <p>User: <span className="text-slate-300 font-mono">{server.rdpUsername}</span></p>}
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-medium mb-1">For Mac/Linux users:</p>
              <p>Use Microsoft Remote Desktop from the App Store, or run:</p>
              <code className="block mt-1 bg-slate-950 p-2 rounded text-blue-200 font-mono">
                xfreerdp /v:{server.rdpHost || server.operaHost} /u:{server.rdpUsername || 'username'}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWireGuardSection = () => {
    const wgConfig = generateWireGuardConfig(server);

    return (
      <div className="space-y-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-200">WireGuard Configuration</span>
            </div>
            <button
              onClick={() => copyToClipboard(wgConfig, 'wg')}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {copiedCmd === 'wg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'wg' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs text-purple-300 font-mono bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
            {wgConfig}
          </pre>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => downloadFile(wgConfig, `${server.name.replace(/\s+/g, '_')}.conf`, 'text/plain')}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Download .conf
            </button>
            <span className="text-xs text-slate-500">Import into WireGuard app</span>
          </div>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div className="text-xs text-purple-300">
              <p className="font-medium mb-1">Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-purple-300/80">
                <li>Install WireGuard on your device</li>
                <li>Generate your keypair: <code className="bg-slate-950 px-1 rounded">wg genkey | tee privatekey | wg pubkey</code></li>
                <li>Send your public key to the hotel IT admin</li>
                <li>Import this config and activate the tunnel</li>
                <li>Access Opera at the URL below</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTailscaleSection = () => (
    <div className="space-y-4">
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cable className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-200">Tailscale Access</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          This server is on your Tailscale mesh network. Make sure Tailscale is running on your device.
        </p>
        <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
          <p className="text-xs text-slate-400">Hostname:</p>
          <code className="text-sm text-cyan-300 font-mono">
            {server.tailscaleHostname || server.operaHost}
          </code>
          <p className="text-xs text-slate-400 mt-2">Full URL:</p>
          <code className="text-sm text-cyan-300 font-mono">{localURL}</code>
        </div>
        <a
          href={localURL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Browser
        </a>
      </div>
    </div>
  );

  const renderDirectSection = () => (
    <div className="space-y-4">
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cable className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-200">Direct Access</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          This server is accessible directly when you're on the same network or have an active VPN.
        </p>
        <div className="bg-slate-950 p-3 rounded border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Opera PMS URL:</p>
          <code className="text-sm text-amber-300 font-mono">{server.directUrl || `http://${server.operaHost}:${server.operaPort}`}</code>
        </div>
        <a
          href={server.directUrl || `http://${server.operaHost}:${server.operaPort}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Browser
        </a>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (server.connectionMethod) {
      case 'ssh-tunnel': return renderSSHSection();
      case 'rdp': return renderRDPSection();
      case 'wireguard': return renderWireGuardSection();
      case 'tailscale': return renderTailscaleSection();
      case 'direct': return renderDirectSection();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{server.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${methodInfo.bgColor} ${methodInfo.color}`}>
                  {methodInfo.label}
                </span>
                <span className="text-xs text-slate-400">{methodInfo.description}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {renderContent()}

          {/* After tunnel: Access URL */}
          {server.connectionMethod !== 'direct' && server.connectionMethod !== 'tailscale' && (
            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">After connecting, access Opera at:</span>
              </div>
              <code className="block text-sm text-emerald-300 font-mono bg-slate-950 p-2 rounded">
                {localURL}
              </code>
              <a
                href={localURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open Opera PMS
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
