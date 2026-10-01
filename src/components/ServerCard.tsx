import { Server } from '../types';
import {
  Globe,
  ExternalLink,
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
} from 'lucide-react';
import { useState } from 'react';

interface ServerCardProps {
  server: Server;
  viewMode: 'grid' | 'list';
  onEdit: (server: Server) => void;
  onDelete: (id: string) => void;
  onCheckStatus: (id: string) => void;
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

export function ServerCard({ server, viewMode, onEdit, onDelete, onCheckStatus }: ServerCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = statusConfig[server.status];
  const env = envConfig[server.environment];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(server.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccess = () => {
    window.open(server.url, '_blank', 'noopener,noreferrer');
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all group">
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
            </div>
            <p className="text-xs text-slate-400 truncate">{server.property}</p>
          </div>

          {/* URL */}
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-xs text-slate-300 font-mono truncate">{server.url}</p>
          </div>

          {/* Region */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 min-w-[80px]">
            <MapPin className="w-3 h-3" />
            {server.region}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleAccess}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all group relative overflow-hidden">
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${status.color}`} />

      {/* Menu button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
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
              onClick={() => { handleCopyUrl(); setShowMenu(false); }}
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

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-slate-700/50 p-2.5 rounded-lg">
          <ServerIcon className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{server.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${env.color} font-bold shrink-0`}>
              {env.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{server.property}</p>
        </div>
      </div>

      {/* Status */}
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

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-mono truncate">{server.url}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{server.region} • Port {server.port}</span>
        </div>
      </div>

      {/* Tags */}
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

      {/* Description */}
      {server.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{server.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <button
          onClick={handleAccess}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-600/10"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Access Server
        </button>
        <button
          onClick={handleCopyUrl}
          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          title="Copy URL"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
