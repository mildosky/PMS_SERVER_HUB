import { useState, useEffect, useCallback } from 'react';
import { Server } from '../types';

const STORAGE_KEY = 'opera-pms-servers';

const defaultServers: Server[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    url: 'https://opera.gplaza.example.com',
    property: 'Grand Plaza Resort & Spa',
    environment: 'production',
    region: 'US-East',
    port: '443',
    description: 'Primary PMS server for Grand Plaza 500-room resort',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-01-15T10:00:00Z',
    tags: ['primary', 'resort', 'full-service'],
  },
  {
    id: '2',
    name: 'City Center Inn',
    url: 'https://opera.citycenter.example.com',
    property: 'City Center Business Inn',
    environment: 'production',
    region: 'US-West',
    port: '443',
    description: 'PMS for downtown business hotel, 200 rooms',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-02-20T14:30:00Z',
    tags: ['business', 'limited-service'],
  },
  {
    id: '3',
    name: 'Seaside Resort (Staging)',
    url: 'https://opera-staging.seaside.example.com',
    property: 'Seaside Beach Resort',
    environment: 'staging',
    region: 'EU-West',
    port: '8443',
    description: 'Staging environment for Seaside Resort upgrade testing',
    status: 'maintenance',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    addedAt: '2024-03-10T09:15:00Z',
    tags: ['staging', 'upgrade-test'],
  },
  {
    id: '4',
    name: 'Mountain Lodge (Training)',
    url: 'https://opera-train.mountainlodge.example.com',
    property: 'Mountain Lodge & Conference Center',
    environment: 'training',
    region: 'US-East',
    port: '443',
    description: 'Training environment for new staff onboarding',
    status: 'online',
    lastChecked: new Date().toISOString(),
    addedAt: '2024-04-05T11:00:00Z',
    tags: ['training', 'new-staff'],
  },
  {
    id: '5',
    name: 'Heritage Hotel (Dev)',
    url: 'http://192.168.10.50:7001',
    property: 'Heritage Boutique Hotel',
    environment: 'development',
    region: 'APAC',
    port: '7001',
    description: 'Development server for custom integration testing',
    status: 'offline',
    lastChecked: new Date(Date.now() - 7200000).toISOString(),
    addedAt: '2024-05-12T16:45:00Z',
    tags: ['development', 'integration', 'custom'],
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
    const newServer: Server = {
      ...server,
      id: crypto.randomUUID(),
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
          // Simulate status check - in production this would ping the server
          const statuses: Server['status'][] = ['online', 'offline', 'maintenance'];
          const randomStatus = statuses[Math.floor(Math.random() * 2)]; // mostly online/offline
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
