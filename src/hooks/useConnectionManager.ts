import { useState, useEffect, useCallback } from 'react';
import { Server } from '../types';
import { generateSSHTunnelCommand, getLocalAccessURL } from '../utils/connections';

const STORAGE_KEY = 'opera-pms-connections';

interface ConnectionState {
  serverId: string;
  active: boolean;
  activatedAt: string | null;
  localPort: string;
}

function loadConnections(): Record<string, ConnectionState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load connections:', e);
  }
  return {};
}

function saveConnections(connections: Record<string, ConnectionState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  } catch (e) {
    console.error('Failed to save connections:', e);
  }
}

export function useConnectionManager() {
  const [connections, setConnections] = useState<Record<string, ConnectionState>>(loadConnections);

  useEffect(() => {
    saveConnections(connections);
  }, [connections]);

  const toggleConnection = useCallback((server: Server) => {
    setConnections(prev => {
      const current = prev[server.id];
      const isActive = current?.active ?? false;

      return {
        ...prev,
        [server.id]: {
          serverId: server.id,
          active: !isActive,
          activatedAt: !isActive ? new Date().toISOString() : null,
          localPort: current?.localPort || server.operaPort || '80',
        },
      };
    });
  }, []);

  const setLocalPort = useCallback((serverId: string, port: string) => {
    setConnections(prev => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        localPort: port,
      },
    }));
  }, []);

  const isConnected = useCallback((serverId: string) => {
    return connections[serverId]?.active ?? false;
  }, [connections]);

  const getConnection = useCallback((serverId: string): ConnectionState | undefined => {
    return connections[serverId];
  }, [connections]);

  const getSSHTunnelCommand = useCallback((server: Server) => {
    const conn = connections[server.id];
    const localPort = conn?.localPort || server.operaPort || '80';
    return generateSSHTunnelCommand(server, localPort);
  }, [connections]);

  const getDisconnectCommand = useCallback((server: Server) => {
    const conn = connections[server.id];
    const localPort = conn?.localPort || server.operaPort || '80';
    // Find and kill the SSH tunnel process by matching the port forward
    return `Get-Process ssh -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match '${localPort}:${server.operaHost}' } | Stop-Process -Force`;
  }, [connections]);

  const getAccessURL = useCallback((server: Server) => {
    const conn = connections[server.id];
    const localPort = conn?.localPort || server.operaPort || '80';
    return getLocalAccessURL(server, localPort);
  }, [connections]);

  return {
    connections,
    toggleConnection,
    setLocalPort,
    isConnected,
    getConnection,
    getSSHTunnelCommand,
    getDisconnectCommand,
    getAccessURL,
  };
}
