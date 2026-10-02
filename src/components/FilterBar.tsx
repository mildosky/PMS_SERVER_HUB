import { EnvironmentFilter, StatusFilter } from '../types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  envFilter: EnvironmentFilter;
  statusFilter: StatusFilter;
  onEnvFilterChange: (filter: EnvironmentFilter) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  counts: {
    total: number;
    production: number;
    staging: number;
    development: number;
    training: number;
    online: number;
    offline: number;
    maintenance: number;
  };
}

export function FilterBar({
  envFilter,
  statusFilter,
  onEnvFilterChange,
  onStatusFilterChange,
  counts,
}: FilterBarProps) {
  const hasFilters = envFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2 text-slate-400">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-medium">Filters:</span>
      </div>

      {/* Environment filters */}
      <div className="flex items-center gap-1">
        {(['all', 'production', 'staging', 'development', 'training'] as EnvironmentFilter[]).map((env) => (
          <button
            key={env}
            onClick={() => onEnvFilterChange(env)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              envFilter === env
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {env === 'all' ? 'All' : env.charAt(0).toUpperCase() + env.slice(1)}
            <span className="ml-1 opacity-70">
              ({env === 'all' ? counts.total : counts[env as keyof typeof counts] || 0})
            </span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Status filters */}
      <div className="flex items-center gap-1">
        {(['all', 'online', 'offline', 'maintenance'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1 opacity-70">
              ({status === 'all'
                ? counts.online + counts.offline + counts.maintenance
                : counts[status as keyof typeof counts] || 0})
            </span>
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            onEnvFilterChange('all');
            onStatusFilterChange('all');
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
