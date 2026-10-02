import { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ServerCard } from './components/ServerCard';
import { ServerModal } from './components/ServerModal';
import { FilterBar } from './components/FilterBar';
import { StatsBar } from './components/StatsBar';
import { HelpGuide } from './components/HelpGuide';
import { ITAdminGuide } from './components/ITAdminGuide';
import { ToastContainer, ToastMessage } from './components/Toast';
import { useServers } from './hooks/useServers';
import { useConnectionManager } from './hooks/useConnectionManager';
import { Server, EnvironmentFilter, StatusFilter } from './types';
import { ServerCrash } from 'lucide-react';

function App() {
  const { servers, addServer, updateServer, deleteServer, checkStatus, checkAllStatuses } = useServers();
  const connectionManager = useConnectionManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [envFilter, setEnvFilter] = useState<EnvironmentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editServer, setEditServer] = useState<Server | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showITAdminGuide, setShowITAdminGuide] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [connectingServerId, setConnectingServerId] = useState<string | null>(null);
  const [tunnelManagerStatus, setTunnelManagerStatus] = useState<'checking' | 'running' | 'stopped'>('checking');

  // Check tunnel manager status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          setTunnelManagerStatus('running');
        } else {
          setTunnelManagerStatus('stopped');
        }
      } catch {
        setTunnelManagerStatus('stopped');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        (server.name || '').toLowerCase().includes(query) ||
        (server.property || '').toLowerCase().includes(query) ||
        (server.operaHost || '').toLowerCase().includes(query) ||
        (server.region || '').toLowerCase().includes(query) ||
        (server.tags || []).some(tag => (tag || '').toLowerCase().includes(query));

      const matchesEnv = envFilter === 'all' || server.environment === envFilter;
      const matchesStatus = statusFilter === 'all' || server.status === statusFilter;

      return matchesSearch && matchesEnv && matchesStatus;
    });
  }, [servers, searchQuery, envFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: servers.length,
    production: servers.filter(s => s.environment === 'production').length,
    staging: servers.filter(s => s.environment === 'staging').length,
    development: servers.filter(s => s.environment === 'development').length,
    training: servers.filter(s => s.environment === 'training').length,
    online: servers.filter(s => s.status === 'online').length,
    offline: servers.filter(s => s.status === 'offline').length,
    maintenance: servers.filter(s => s.status === 'maintenance').length,
  }), [servers]);

  const handleEdit = (server: Server) => {
    setEditServer(server);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteServer(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleAddServer = () => {
    setEditServer(null);
    setIsModalOpen(true);
  };

  /**
   * One-click quick connect - directly connects/disconnects via toggle
   */
  const handleQuickConnect = async (server: Server) => {
    setConnectingServerId(server.id);
    try {
      const result = await connectionManager.quickConnect(server);
      addToast({
        type: result.type,
        title: result.success ? 'Connected' : result.type === 'warning' ? 'Action Required' : 'Connection Failed',
        message: result.message,
        copyText: result.copyText,
        duration: result.success ? 3000 : 8000,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setConnectingServerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddServer={handleAddServer}
        onCheckAll={checkAllStatuses}
        onHelp={() => setShowHelpGuide(true)}
        onITAdmin={() => setShowITAdminGuide(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        serverCount={servers.length}
      />

      {/* Tunnel Manager Status Banner */}
      {tunnelManagerStatus === 'stopped' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-200">
                  Tunnel Manager is not running
                </p>
                <p className="text-xs text-amber-300/70 mt-0.5">
                  Run <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-mono">tunnel-manager\start.bat</code> to enable one-click connections
                </p>
              </div>
              <a
                href="http://localhost:3001"
                className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-200 transition-colors"
              >
                Retry Connection
              </a>
            </div>
          </div>
        </div>
      )}

      {tunnelManagerStatus === 'running' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-medium text-emerald-300">
                Tunnel Manager is running • One-click connections enabled
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsBar 
          servers={servers} 
          activeConnections={Object.values(connectionManager.connections).filter(c => c.active).length}
        />

        <FilterBar
          envFilter={envFilter}
          statusFilter={statusFilter}
          onEnvFilterChange={setEnvFilter}
          onStatusFilterChange={setStatusFilter}
          counts={counts}
        />

        {filteredServers.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredServers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCheckStatus={checkStatus}
                onQuickConnect={handleQuickConnect}
                isConnected={connectionManager.isConnected(server.id)}
                isConnecting={connectingServerId === server.id}
                connectionActivatedAt={connectionManager.getConnection(server.id)?.activatedAt ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
              <ServerCrash className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No servers found</h3>
            <p className="text-sm text-slate-500 max-w-md">
              {searchQuery || envFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Add your first Opera PMS v5 server to start managing remote connections.'}
            </p>
            {!searchQuery && envFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={handleAddServer}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add First Server
              </button>
            )}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            Opera PMS v5 Server Hub • Tunnel & VPN connection manager for physically hosted PMS servers
          </p>
          <p className="text-xs text-slate-700 mt-1">
            One-click SSH tunnels, RDP files, WireGuard & Tailscale configs • Stored locally in your browser
          </p>
        </div>
      </main>

      <ServerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditServer(null); }}
        onSave={addServer}
        onUpdate={updateServer}
        editServer={editServer}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Server</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to remove this server? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpGuide && <HelpGuide isOpen={showHelpGuide} onClose={() => setShowHelpGuide(false)} />}
      {showITAdminGuide && <ITAdminGuide isOpen={showITAdminGuide} onClose={() => setShowITAdminGuide(false)} />}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
