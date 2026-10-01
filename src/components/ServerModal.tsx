import { useState, useEffect } from 'react';
import { Server } from '../types';
import { X, Save, Server as ServerIcon } from 'lucide-react';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: Omit<Server, 'id' | 'addedAt' | 'lastChecked'>) => void;
  onUpdate?: (id: string, updates: Partial<Server>) => void;
  editServer?: Server | null;
}

export function ServerModal({ isOpen, onClose, onSave, onUpdate, editServer }: ServerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    property: '',
    environment: 'production' as Server['environment'],
    region: '',
    port: '443',
    description: '',
    status: 'unknown' as Server['status'],
    tags: '',
  });

  useEffect(() => {
    if (editServer) {
      setFormData({
        name: editServer.name,
        url: editServer.url,
        property: editServer.property,
        environment: editServer.environment,
        region: editServer.region,
        port: editServer.port,
        description: editServer.description,
        status: editServer.status,
        tags: editServer.tags.join(', '),
      });
    } else {
      setFormData({
        name: '',
        url: '',
        property: '',
        environment: 'production',
        region: '',
        port: '443',
        description: '',
        status: 'unknown',
        tags: '',
      });
    }
  }, [editServer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const serverData = {
      name: formData.name,
      url: formData.url,
      property: formData.property,
      environment: formData.environment,
      region: formData.region,
      port: formData.port,
      description: formData.description,
      status: formData.status,
      tags,
    };

    if (editServer && onUpdate) {
      onUpdate(editServer.id, serverData);
    } else {
      onSave(serverData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <ServerIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {editServer ? 'Edit Server' : 'Add New Server'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Server Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Server Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grand Plaza Hotel PMS"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Server URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://opera.example.com or http://192.168.1.100:7001"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>

          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Property Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: e.target.value })}
              placeholder="e.g., Grand Plaza Resort & Spa"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Environment & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Environment
              </label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as Server['environment'] })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Server['status'] })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Region & Port */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g., US-East, EU-West, APAC"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Port
              </label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="443"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this server's purpose..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags <span className="text-slate-500 text-xs">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., primary, resort, full-service"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              {editServer ? 'Update Server' : 'Add Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
