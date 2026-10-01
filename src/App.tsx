import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ServerCard } from './components/ServerCard';
import { ServerModal } from './components/ServerModal';
import { FilterBar } from './components/FilterBar';
import { StatsBar } from './components/StatsBar';
import { useServers } from './hooks/useServers';
import { Server, EnvironmentFilter, StatusFilter } from './types';
import { ServerCrash } from 'lucide-react';

function App() {
  const { servers, addServer, updateServer, deleteServer, checkStatus, checkAllStatuses } = useServers();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [envFilter, setEnvFilter] = useState<EnvironmentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editServer, setEditServer] = useState<Server | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        server.name.toLowerCase().includes(query) ||
        server.property.toLowerCase().includes(query) ||
        server.url.toLowerCase().includes(query) ||
        server.region.toLowerCase().includes(query) ||
        server.tags.some(tag => tag.toLowerCase().includes(query));

      // Environment filter
      const matchesEnv = envFilter === 'all' || server.environment === envFilter;

      // Status filter
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddServer={handleAddServer}
        onCheckAll={checkAllStatuses}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        serverCount={servers.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <StatsBar servers={servers} />

        {/* Filters */}
        <FilterBar
          envFilter={envFilter}
          statusFilter={statusFilter}
          onEnvFilterChange={setEnvFilter}
          onStatusFilterChange={setStatusFilter}
          counts={counts}
        />

        {/* Server Grid/List */}
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
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by adding your first Opera PMS v5 server to the hub.'}
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

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            Opera PMS v5 Server Hub • Manage and access your physically hosted PMS servers
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Servers are stored locally in your browser • Data persists across sessions
          </p>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <ServerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditServer(null); }}
        onSave={addServer}
        onUpdate={updateServer}
        editServer={editServer}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Server</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to remove this server from the hub? This action cannot be undone.
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
    </div>
  );
}

export default App;
