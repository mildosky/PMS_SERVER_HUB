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
} from 'lucide-react';
import { useState } from 'react';
import { getConnectionMethodInfo, getLocalAccessURL } from '../utils/connections';

interface ServerCardProps {
  server: Server;
  viewMode: 'grid' | 'list';
  onEdit: (server: Server) => void;
  onDelete: (id: string) => void;
  onCheckStatus: (id: string) => void;
  onConnect: (server: Server) => void;
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

export function ServerCard({ server, viewMode, onEdit, onDelete, onCheckStatus, onConnect }: ServerCardProps) {
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

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all group">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              {status.pulse && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${status.color} animate-ping opacity-75`} />
              )}
            </div>
            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
          </div>

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

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyURL}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy access URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onConnect(server)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
            >
              <Cable className="w-3 h-3" />
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${status.color}`} />

      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1 min-w-[160px]">
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
        )}
      </div>

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
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${methodInfo.bgColor} mb-3`}>
        <MethodIcon className={`w-4 h-4 ${methodInfo.color}`} />
        <div>
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

      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <button
          onClick={() => onConnect(server)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-600/10"
        >
          <Cable className="w-3.5 h-3.5" />
          Connect
        </button>
        <button
          onClick={handleCopyURL}
          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          title="Copy access URL"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
