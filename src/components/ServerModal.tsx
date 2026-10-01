import { useState, useEffect } from 'react';
import { Server, ConnectionMethod } from '../types';
import { X, Save, Server as ServerIcon, Terminal, Monitor, Shield, Cable, Globe } from 'lucide-react';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: Omit<Server, 'id' | 'addedAt' | 'lastChecked'>) => void;
  onUpdate?: (id: string, updates: Partial<Server>) => void;
  editServer?: Server | null;
}

const methodOptions: { value: ConnectionMethod; label: string; icon: typeof Terminal; desc: string }[] = [
  { value: 'ssh-tunnel', label: 'SSH Tunnel', icon: Terminal, desc: 'Port forward via SSH jump host' },
  { value: 'rdp', label: 'Remote Desktop', icon: Monitor, desc: 'RDP to on-site workstation' },
  { value: 'wireguard', label: 'WireGuard VPN', icon: Shield, desc: 'Full tunnel via WireGuard' },
  { value: 'tailscale', label: 'Tailscale', icon: Cable, desc: 'Mesh VPN via Tailscale' },
  { value: 'direct', label: 'Direct', icon: Globe, desc: 'Direct access (same network)' },
];

export function ServerModal({ isOpen, onClose, onSave, onUpdate, editServer }: ServerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    operaHost: '',
    operaPort: '7001',
    property: '',
    environment: 'production' as Server['environment'],
    region: '',
    description: '',
    status: 'unknown' as Server['status'],
    tags: '',
    connectionMethod: 'ssh-tunnel' as ConnectionMethod,
    // SSH
    sshHost: '',
    sshPort: '22',
    sshUser: 'admin',
    sshKeyPath: '',
    // RDP
    rdpHost: '',
    rdpPort: '3389',
    rdpUsername: '',
    // WireGuard
    wgEndpoint: '',
    wgPublicKey: '',
    wgAllowedIPs: '',
    // Tailscale
    tailscaleHostname: '',
    // Direct
    directUrl: '',
  });

  useEffect(() => {
    if (editServer) {
      setFormData({
        name: editServer.name,
        operaHost: editServer.operaHost,
        operaPort: editServer.operaPort,
        property: editServer.property,
        environment: editServer.environment,
        region: editServer.region,
        description: editServer.description,
        status: editServer.status,
        tags: editServer.tags.join(', '),
        connectionMethod: editServer.connectionMethod,
        sshHost: editServer.sshHost || '',
        sshPort: editServer.sshPort || '22',
        sshUser: editServer.sshUser || 'admin',
        sshKeyPath: editServer.sshKeyPath || '',
        rdpHost: editServer.rdpHost || '',
        rdpPort: editServer.rdpPort || '3389',
        rdpUsername: editServer.rdpUsername || '',
        wgEndpoint: editServer.wgEndpoint || '',
        wgPublicKey: editServer.wgPublicKey || '',
        wgAllowedIPs: editServer.wgAllowedIPs || '',
        tailscaleHostname: editServer.tailscaleHostname || '',
        directUrl: editServer.directUrl || '',
      });
    } else {
      setFormData({
        name: '',
        operaHost: '',
        operaPort: '7001',
        property: '',
        environment: 'production',
        region: '',
        description: '',
        status: 'unknown',
        tags: '',
        connectionMethod: 'ssh-tunnel',
        sshHost: '',
        sshPort: '22',
        sshUser: 'admin',
        sshKeyPath: '',
        rdpHost: '',
        rdpPort: '3389',
        rdpUsername: '',
        wgEndpoint: '',
        wgPublicKey: '',
        wgAllowedIPs: '',
        tailscaleHostname: '',
        directUrl: '',
      });
    }
  }, [editServer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const serverData: Omit<Server, 'id' | 'addedAt' | 'lastChecked'> = {
      name: formData.name,
      operaHost: formData.operaHost,
      operaPort: formData.operaPort,
      property: formData.property,
      environment: formData.environment,
      region: formData.region,
      description: formData.description,
      status: formData.status,
      tags,
      connectionMethod: formData.connectionMethod,
      sshHost: formData.sshHost || undefined,
      sshPort: formData.sshPort || undefined,
      sshUser: formData.sshUser || undefined,
      sshKeyPath: formData.sshKeyPath || undefined,
      rdpHost: formData.rdpHost || undefined,
      rdpPort: formData.rdpPort || undefined,
      rdpUsername: formData.rdpUsername || undefined,
      wgEndpoint: formData.wgEndpoint || undefined,
      wgPublicKey: formData.wgPublicKey || undefined,
      wgAllowedIPs: formData.wgAllowedIPs || undefined,
      tailscaleHostname: formData.tailscaleHostname || undefined,
      directUrl: formData.directUrl || undefined,
    };

    if (editServer && onUpdate) {
      onUpdate(editServer.id, serverData);
    } else {
      onSave(serverData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const renderMethodFields = () => {
    switch (formData.connectionMethod) {
      case 'ssh-tunnel':
        return (
          <div className="space-y-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> SSH Tunnel Settings
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">SSH Host (Jump Server) *</label>
                <input
                  type="text"
                  required={formData.connectionMethod === 'ssh-tunnel'}
                  value={formData.sshHost}
                  onChange={(e) => setFormData({ ...formData, sshHost: e.target.value })}
                  placeholder="jump.hotel.com"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">SSH Port</label>
                <input
                  type="text"
                  value={formData.sshPort}
                  onChange={(e) => setFormData({ ...formData, sshPort: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">SSH Username</label>
                <input
                  type="text"
                  value={formData.sshUser}
                  onChange={(e) => setFormData({ ...formData, sshUser: e.target.value })}
                  placeholder="admin"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">SSH Key Path (optional)</label>
                <input
                  type="text"
                  value={formData.sshKeyPath}
                  onChange={(e) => setFormData({ ...formData, sshKeyPath: e.target.value })}
                  placeholder="~/.ssh/hotel_key"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        );
      case 'rdp':
        return (
          <div className="space-y-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Remote Desktop Settings
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">RDP Host *</label>
                <input
                  type="text"
                  required={formData.connectionMethod === 'rdp'}
                  value={formData.rdpHost}
                  onChange={(e) => setFormData({ ...formData, rdpHost: e.target.value })}
                  placeholder="10.0.5.100"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">RDP Port</label>
                <input
                  type="text"
                  value={formData.rdpPort}
                  onChange={(e) => setFormData({ ...formData, rdpPort: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={formData.rdpUsername}
                onChange={(e) => setFormData({ ...formData, rdpUsername: e.target.value })}
                placeholder="frontdesk"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        );
      case 'wireguard':
        return (
          <div className="space-y-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> WireGuard Settings
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Endpoint *</label>
              <input
                type="text"
                required={formData.connectionMethod === 'wireguard'}
                value={formData.wgEndpoint}
                onChange={(e) => setFormData({ ...formData, wgEndpoint: e.target.value })}
                placeholder="vpn.hotel.com:51820"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Server Public Key *</label>
              <input
                type="text"
                required={formData.connectionMethod === 'wireguard'}
                value={formData.wgPublicKey}
                onChange={(e) => setFormData({ ...formData, wgPublicKey: e.target.value })}
                placeholder="Base64 encoded public key"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Allowed IPs</label>
              <input
                type="text"
                value={formData.wgAllowedIPs}
                onChange={(e) => setFormData({ ...formData, wgAllowedIPs: e.target.value })}
                placeholder="10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono"
              />
            </div>
          </div>
        );
      case 'tailscale':
        return (
          <div className="space-y-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-cyan-400 flex items-center gap-2">
              <Cable className="w-4 h-4" /> Tailscale Settings
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tailscale Hostname *</label>
              <input
                type="text"
                required={formData.connectionMethod === 'tailscale'}
                value={formData.tailscaleHostname}
                onChange={(e) => setFormData({ ...formData, tailscaleHostname: e.target.value })}
                placeholder="opera-pms"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-slate-500">
              The machine name as it appears in your Tailscale network. Access will be via http://hostname:port
            </p>
          </div>
        );
      case 'direct':
        return (
          <div className="space-y-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Direct Access Settings
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full URL *</label>
              <input
                type="text"
                required={formData.connectionMethod === 'direct'}
                value={formData.directUrl}
                onChange={(e) => setFormData({ ...formData, directUrl: e.target.value })}
                placeholder="http://192.168.10.50:7001"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-slate-500">
              Use this when you're already on the same network or have a VPN active.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <ServerIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {editServer ? 'Edit Server' : 'Add New Server'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Server Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grand Plaza Hotel PMS"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Opera Host & Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Opera Host/IP *</label>
              <input
                type="text"
                required
                value={formData.operaHost}
                onChange={(e) => setFormData({ ...formData, operaHost: e.target.value })}
                placeholder="192.168.10.50 or opera.hotel.local"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Opera Port *</label>
              <input
                type="text"
                required
                value={formData.operaPort}
                onChange={(e) => setFormData({ ...formData, operaPort: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Property Name *</label>
            <input
              type="text"
              required
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: e.target.value })}
              placeholder="e.g., Grand Plaza Resort & Spa"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Environment</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="US-East"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
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

          {/* Connection Method Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Connection Method *</label>
            <div className="grid grid-cols-1 gap-2">
              {methodOptions.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    formData.connectionMethod === method.value
                      ? 'bg-blue-600/10 border-blue-500/50'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="connectionMethod"
                    value={method.value}
                    checked={formData.connectionMethod === method.value}
                    onChange={(e) => setFormData({ ...formData, connectionMethod: e.target.value as ConnectionMethod })}
                    className="sr-only"
                  />
                  <method.icon className={`w-4 h-4 ${formData.connectionMethod === method.value ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${formData.connectionMethod === method.value ? 'text-blue-300' : 'text-slate-300'}`}>
                      {method.label}
                    </p>
                    <p className="text-xs text-slate-500">{method.desc}</p>
                  </div>
                  {formData.connectionMethod === method.value && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Method-specific fields */}
          {renderMethodFields()}

          {/* Description & Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags <span className="text-slate-500 text-xs">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., primary, resort"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
              <Save className="w-4 h-4" />
              {editServer ? 'Update' : 'Add Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
