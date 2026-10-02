import { useState, useEffect, useCallback } from 'react';
import { Server } from '../types';
import { generateSSHTunnelCommand, getLocalAccessURL } from '../utils/connections';

const STORAGE_KEY = 'opera-pms-connections';
const TUNNEL_MANAGER_URL = 'http://localhost:3001';

interface ConnectionState {
  serverId: string;
  active: boolean;
  activatedAt: string | null;
  localPort: string;
}

export interface ConnectResult {
  success: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  copyText?: string;
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

  const checkTunnelManagerStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${TUNNEL_MANAGER_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  /**
   * Quick connect - directly connects without opening a modal.
   * Returns a result for toast notification.
   */
  const quickConnect = useCallback(async (server: Server): Promise<ConnectResult> => {
    const current = connections[server.id];
    const isActive = current?.active ?? false;
    const localPort = current?.localPort || server.operaPort || '80';

    // If already connected, disconnect
    if (isActive) {
      return await disconnectServer(server);
    }

    // Check if tunnel manager is running
    const isManagerRunning = await checkTunnelManagerStatus();

    if (!isManagerRunning) {
      // Tunnel manager not running - provide the start command to copy
      const startCommand = 'cd tunnel-manager && start.bat';
      return {
        success: false,
        message: `Tunnel Manager is not running. Copy the command below, paste it in PowerShell, then click Connect again.`,
        type: 'warning',
        copyText: startCommand,
      };
    }

    // Start the tunnel
    try {
      const sshCommand = generateSSHTunnelCommand(server, localPort);

      const response = await fetch(`${TUNNEL_MANAGER_URL}/api/tunnel/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: server.id,
          command: sshCommand,
          localPort,
          operaHost: server.operaHost,
          operaPort: server.operaPort || '80'
        })
      });

      const result = await response.json();

      if (result.success) {
        setConnections(prev => ({
          ...prev,
          [server.id]: {
            serverId: server.id,
            active: true,
            activatedAt: new Date().toISOString(),
            localPort,
          },
        }));

        const accessURL = getLocalAccessURL(server, localPort);
        return {
          success: true,
          message: `Connected! Access Opera at ${accessURL}`,
          type: 'success',
        };
      } else {
        return {
          success: false,
          message: `Failed to start tunnel: ${result.error}`,
          type: 'error',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      };
    }
  }, [connections, checkTunnelManagerStatus]);

  /**
   * Directly disconnect a server
   */
  const disconnectServer = useCallback(async (server: Server): Promise<ConnectResult> => {
    const isManagerRunning = await checkTunnelManagerStatus();

    if (!isManagerRunning) {
      // Just mark as disconnected locally
      setConnections(prev => ({
        ...prev,
        [server.id]: {
          ...prev[server.id],
          active: false,
          activatedAt: null,
        },
      }));
      return {
        success: true,
        message: 'Disconnected (Tunnel Manager was not running)',
        type: 'info',
      };
    }

    try {
      const response = await fetch(`${TUNNEL_MANAGER_URL}/api/tunnel/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id })
      });

      const result = await response.json();

      if (result.success) {
        setConnections(prev => ({
          ...prev,
          [server.id]: {
            ...prev[server.id],
            active: false,
            activatedAt: null,
          },
        }));
        return {
          success: true,
          message: 'Disconnected successfully',
          type: 'info',
        };
      } else {
        return {
          success: false,
          message: `Failed to stop tunnel: ${result.error}`,
          type: 'error',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      };
    }
  }, [checkTunnelManagerStatus]);

  const toggleConnection = useCallback(async (server: Server) => {
    const current = connections[server.id];
    const isActive = current?.active ?? false;
    const localPort = current?.localPort || server.operaPort || '80';

    // Check if tunnel manager is running
    const isManagerRunning = await checkTunnelManagerStatus();

    if (!isManagerRunning) {
      alert(
        'Tunnel Manager service is not running!\n\n' +
        'Please run "start.bat" in the tunnel-manager folder first.\n\n' +
        'This service enables automatic SSH tunnel management.'
      );
      return;
    }

    if (!isActive) {
      // Starting tunnel
      try {
        const sshCommand = generateSSHTunnelCommand(server, localPort);

        const response = await fetch(`${TUNNEL_MANAGER_URL}/api/tunnel/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serverId: server.id,
            command: sshCommand,
            localPort,
            operaHost: server.operaHost,
            operaPort: server.operaPort || '80'
          })
        });

        const result = await response.json();

        if (result.success) {
          setConnections(prev => ({
            ...prev,
            [server.id]: {
              serverId: server.id,
              active: true,
              activatedAt: new Date().toISOString(),
              localPort,
            },
          }));
        } else {
          alert(`Failed to start tunnel: ${result.error}`);
        }
      } catch (error) {
        alert(`Error starting tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Stopping tunnel
      try {
        const response = await fetch(`${TUNNEL_MANAGER_URL}/api/tunnel/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverId: server.id })
        });

        const result = await response.json();

        if (result.success) {
          setConnections(prev => ({
            ...prev,
            [server.id]: {
              ...prev[server.id],
              active: false,
              activatedAt: null,
            },
          }));
        } else {
          alert(`Failed to stop tunnel: ${result.error}`);
        }
      } catch (error) {
        alert(`Error stopping tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [connections, checkTunnelManagerStatus]);

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
    return `Get-Process ssh -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match '${localPort}:${server.operaHost}' } | Stop-Process -Force`;
  }, [connections]);

  const getAccessURL = useCallback((server: Server) => {
    const conn = connections[server.id];
    const localPort = conn?.localPort || server.operaPort || '80';
    return getLocalAccessURL(server, localPort);
  }, [connections]);

  return {
    connections,
    quickConnect,
    disconnectServer,
    toggleConnection,
    setLocalPort,
    isConnected,
    getConnection,
    getSSHTunnelCommand,
    getDisconnectCommand,
    getAccessURL,
  };
}
