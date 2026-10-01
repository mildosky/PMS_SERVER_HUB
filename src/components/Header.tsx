import { Server, RefreshCw, Plus, Search, LayoutGrid, List, HelpCircle, Shield } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddServer: () => void;
  onCheckAll: () => void;
  onHelp: () => void;
  onITAdmin: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  serverCount: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  onAddServer,
  onCheckAll,
  onHelp,
  onITAdmin,
  viewMode,
  onViewModeChange,
  serverCount,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Opera PMS v5 Access Hub
              </h1>
              <p className="text-xs text-slate-400">
                {serverCount} server{serverCount !== 1 ? 's' : ''} • Tunnel & VPN manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onITAdmin}
              className="flex items-center gap-2 px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
              title="IT Admin setup guide"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">IT Admin</span>
            </button>
            <button
              onClick={onHelp}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
              title="Connection setup guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              onClick={onCheckAll}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
              title="Check all server statuses"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Check All</span>
            </button>
            <button
              onClick={onAddServer}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Server</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search servers by name, property, URL, or tag..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
