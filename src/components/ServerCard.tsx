import { Server } from '../types';
import {
  Globe,
  MapPin,
  Clock,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Activity,
  Server as ServerIcon,
  Copy,
  Check,
  Cable,
  Shield,
  Terminal,
  Monitor,
  Loader2,
  Power,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { getConnectionMethodInfo, getLocalAccessURL } from '../utils/connections';

interface ServerCardProps {
  server: Server;
  viewMode: 'grid' | 'list';
  onEdit: (server: Server) => void;
  onDelete: (id: string) => void;
  onCheckStatus: (id: string) => void;
  onQuickConnect: (server: Server) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectionActivatedAt: string | null;
}

const statusConfig = {
  online: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Online', pulse: true },
  offline: { color: 'bg-red-500', text: 'text-red-400', label: 'Offline', pulse: false },
  maintenance: { color: 'bg-amber-500', text: 'text-amber-400', label: 'Maintenance', pulse: false },
  unknown: { color: 'bg-slate-500', text: 'text-slate-400', label: 'Unknown', pulse: false },
};

const envConfig = {
  production: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'PROD' },
  staging: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'STG' },
  development: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'DEV' },
  training: { color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', label: 'TRN' },
};

const methodIcons: Record<string, typeof Terminal> = {
  'ssh-tunnel': Terminal,
  'rdp': Monitor,
  'wireguard': Shield,
  'tailscale': Cable,
  'direct': Globe,
};

function formatLastChecked(dateStr: string | null): string {
  if (!dateStr) return 'Never checked';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatUptime(timestamp: string | null) {
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
}

export function ServerCard({ server, viewMode, onEdit, onDelete, onCheckStatus, onQuickConnect, isConnected, isConnecting, connectionActivatedAt }: ServerCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = statusConfig[server.status];
  const env = envConfig[server.environment];
  const methodInfo = getConnectionMethodInfo(server.connectionMethod);
  const MethodIcon = methodIcons[server.connectionMethod] || Globe;
  const localURL = getLocalAccessURL(server);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(localURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className={`bg-slate-800/50 border rounded-lg p-4 transition-all group ${
        isConnected ? 'border-emerald-500/30' : 'border-slate-700 hover:border-slate-600'
      }`}>
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              {status.pulse && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${status.color} animate-ping opacity-75`} />
              )}
            </div>
            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
          </div>

          {/* Server info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white truncate">{server.name}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${env.color} font-bold`}>
                {env.label}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${methodInfo.bgColor} ${methodInfo.color} font-bold flex items-center gap-1`}>
                <MethodIcon className="w-2.5 h-2.5" />
                {methodInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {server.property} • {server.operaHost}{server.operaPort ? `:${server.operaPort}` : ''}
            </p>
          </div>

          {/* Connection uptime */}
          {isConnected && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">
                {formatUptime(connectionActivatedAt)}
              </span>
            </div>
          )}

          {/* Access URL when connected */}
          {isConnected && (
            <a
              href={localURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Open Opera PMS"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          )}

          {/* Copy URL */}
          <button
            onClick={handleCopyURL}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy access URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* TOGGLE SWITCH */}
          <button
            onClick={() => onQuickConnect(server)}
            disabled={isConnecting}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 flex-shrink-0 disabled:opacity-50 ${
              isConnected
                ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-600 hover:bg-slate-500'
            }`}
            title={isConnected ? 'Click to disconnect' : 'Click to connect'}
          >
            <span className="sr-only">Toggle connection</span>
            {isConnecting ? (
              <Loader2 className="w-4 h-4 text-white animate-spin absolute left-1/2 -translate-x-1/2" />
            ) : (
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-md flex items-center justify-center ${
                  isConnected ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                <Power className={`w-3 h-3 ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div className={`bg-slate-800/50 border rounded-xl transition-all group relative overflow-hidden ${
      isConnected ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'border-slate-700 hover:border-slate-600'
    }`}>
      {/* Top status bar */}
      <div className={`h-1 ${status.color}`} />

      {/* Menu button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 py-1 min-w-[160px]">
              <button
                onClick={() => { onEdit(server); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Server
              </button>
              <button
                onClick={() => { onCheckStatus(server.id); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                Check Status
              </button>
              <button
                onClick={() => { handleCopyURL(); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy URL
              </button>
              <hr className="border-slate-600 my-1" />
              <button
                onClick={() => { onDelete(server.id); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        {/* Server name & env badge */}
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-slate-700/50 p-2.5 rounded-lg">
            <ServerIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white truncate">{server.name}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${env.color} font-bold shrink-0`}>
                {env.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{server.property}</p>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
            {status.pulse && (
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${status.color} animate-ping opacity-75`} />
            )}
          </div>
          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
          {server.lastChecked && (
            <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatLastChecked(server.lastChecked)}
            </span>
          )}
        </div>

        {/* Connection Method Badge */}
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${methodInfo.bgColor} mb-4`}>
          <MethodIcon className={`w-4 h-4 ${methodInfo.color}`} />
          <div className="flex-1">
            <p className={`text-xs font-medium ${methodInfo.color}`}>{methodInfo.label}</p>
            <p className="text-[10px] text-slate-500">{methodInfo.description}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono truncate">
              {server.operaHost}{server.operaPort ? `:${server.operaPort}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{server.region}</span>
          </div>
        </div>

        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {server.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {server.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{server.description}</p>
        )}

        {/* === TOGGLE SWITCH - Primary Action === */}
        <div className={`rounded-xl p-4 border-2 transition-all ${
          isConnected
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-slate-900/50 border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isConnected && connectionActivatedAt && (
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Uptime: {formatUptime(connectionActivatedAt)}
                </p>
              )}
              {isConnected && (
                <a
                  href={localURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1 mt-1"
                >
                  {localURL}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* THE TOGGLE */}
            <button
              onClick={() => onQuickConnect(server)}
              disabled={isConnecting}
              className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 flex-shrink-0 disabled:opacity-50 ${
                isConnected
                  ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              title={isConnected ? 'Click to disconnect' : 'Click to connect'}
            >
              <span className="sr-only">Toggle connection</span>
              {isConnecting ? (
                <Loader2 className="w-5 h-5 text-white animate-spin absolute left-1/2 -translate-x-1/2" />
              ) : (
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white transition-all duration-300 shadow-lg flex items-center justify-center ${
                    isConnected ? 'translate-x-10' : 'translate-x-1.5'
                  }`}
                >
                  <Power className={`w-4 h-4 ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
                </span>
              )}
            </button>
          </div>

          {/* ON/OFF label */}
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-[10px] font-bold ${!isConnected ? 'text-slate-300' : 'text-slate-600'}`}>
              OFF
            </span>
            <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-400' : 'text-slate-600'}`}>
              ON
            </span>
          </div>
        </div>

        {/* Copy URL button */}
        <button
          onClick={handleCopyURL}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Access URL'}
        </button>
      </div>
    </div>
  );
}
