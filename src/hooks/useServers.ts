import { useState, useEffect, useCallback } from 'react';
import { Server } from '../types';

const STORAGE_KEY = 'opera-pms-servers';

const defaultServers: Server[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    operaHost: '192.168.10.50',
    operaPort: '7001',
    property: 'Grand Plaza Resort & Spa',
    environment: 'production',
    region: 'US-East',
    description: 'Primary PMS server - access via SSH tunnel through jump host',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-01-15T10:00:00Z',
    tags: ['primary', 'resort'],
    connectionMethod: 'ssh-tunnel',
    sshHost: 'jump.plaza.example.com',
    sshPort: '22',
    sshUser: 'admin',
  },
  {
    id: '2',
    name: 'City Center Inn',
    operaHost: '10.0.5.100',
    operaPort: '7001',
    property: 'City Center Business Inn',
    environment: 'production',
    region: 'US-West',
    description: 'Access via RDP to front desk workstation',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-02-20T14:30:00Z',
    tags: ['business'],
    connectionMethod: 'rdp',
    rdpHost: '10.0.5.100',
    rdpPort: '3389',
    rdpUsername: 'frontdesk',
  },
  {
    id: '3',
    name: 'Seaside Resort (Staging)',
    operaHost: '172.16.20.10',
    operaPort: '7001',
    property: 'Seaside Beach Resort',
    environment: 'staging',
    region: 'EU-West',
    description: 'Staging environment - access via WireGuard VPN',
    status: 'maintenance',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    addedAt: '2024-03-10T09:15:00Z',
    tags: ['staging'],
    connectionMethod: 'wireguard',
    wgEndpoint: 'vpn.seaside.example.com:51820',
    wgPublicKey: 'examplePublicKey123456789=',
    wgAllowedIPs: '172.16.20.0/24',
  },
  {
    id: '4',
    name: 'Mountain Lodge (Training)',
    operaHost: 'opera-train.mountainlodge.ts.net',
    operaPort: '7001',
    property: 'Mountain Lodge & Conference Center',
    environment: 'training',
    region: 'US-East',
    description: 'Training environment - accessible via Tailscale',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-04-05T11:00:00Z',
    tags: ['training'],
    connectionMethod: 'tailscale',
    tailscaleHostname: 'opera-train',
  },
  {
    id: '5',
    name: 'Heritage Hotel (Dev)',
    operaHost: '192.168.10.50',
    operaPort: '7001',
    property: 'Heritage Boutique Hotel',
    environment: 'development',
    region: 'APAC',
    description: 'Development server - direct access when on hotel network',
    status: 'offline',
    lastChecked: new Date(Date.now() - 7200000).toISOString(),
    addedAt: '2024-05-12T16:45:00Z',
    tags: ['development'],
    connectionMethod: 'direct',
    directUrl: 'http://192.168.10.50:7001',
  },
];

function loadServers(): Server[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load servers from localStorage:', e);
  }
  return defaultServers;
}

function saveServers(servers: Server[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
  } catch (e) {
    console.error('Failed to save servers to localStorage:', e);
  }
}

export function useServers() {
  const [servers, setServers] = useState<Server[]>(loadServers);

  useEffect(() => {
    saveServers(servers);
  }, [servers]);

  const addServer = useCallback((server: Omit<Server, 'id' | 'addedAt' | 'lastChecked'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newServer: Server = {
      ...server,
      id,
      addedAt: new Date().toISOString(),
      lastChecked: null,
    };
    setServers(prev => [...prev, newServer]);
  }, []);

  const updateServer = useCallback((id: string, updates: Partial<Server>) => {
    setServers(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteServer = useCallback((id: string) => {
    setServers(prev => prev.filter(s => s.id !== id));
  }, []);

  const checkStatus = useCallback((id: string) => {
    setServers(prev =>
      prev.map(s => {
        if (s.id === id) {
          const statuses: Server['status'][] = ['online', 'offline', 'maintenance'];
          const randomStatus = statuses[Math.floor(Math.random() * 2)];
          return { ...s, status: randomStatus, lastChecked: new Date().toISOString() };
        }
        return s;
      })
    );
  }, []);

  const checkAllStatuses = useCallback(() => {
    setServers(prev =>
      prev.map(s => {
        const statuses: Server['status'][] = ['online', 'offline', 'maintenance'];
        const randomStatus = statuses[Math.floor(Math.random() * 2)];
        return { ...s, status: randomStatus, lastChecked: new Date().toISOString() };
      })
    );
  }, []);

  return {
    servers,
    addServer,
    updateServer,
    deleteServer,
    checkStatus,
    checkAllStatuses,
  };
}
