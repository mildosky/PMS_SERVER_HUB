export interface Server {
  id: string;
  name: string;
  // The Opera PMS address on the remote/hotel network
  operaHost: string;
  operaPort: string;
  property: string;
  environment: 'production' | 'staging' | 'development' | 'training';
  region: string;
  description: string;
  status: 'online' | 'offline' | 'maintenance' | 'unknown';
  lastChecked: string | null;
  addedAt: string;
  tags: string[];
  // Tunnel/VPN configuration
  connectionMethod: 'ssh-tunnel' | 'rdp' | 'wireguard' | 'tailscale' | 'direct';
  // For SSH tunnel
  sshHost?: string;
  sshPort?: string;
  sshUser?: string;
  sshKeyPath?: string;
  // For RDP
  rdpHost?: string;
  rdpPort?: string;
  rdpUsername?: string;
  // For WireGuard
  wgEndpoint?: string;
  wgPublicKey?: string;
  wgAllowedIPs?: string;
  // For Tailscale
  tailscaleHostname?: string;
  // For direct (when already on same network or via existing VPN)
  directUrl?: string;
}

export type EnvironmentFilter = 'all' | 'production' | 'staging' | 'development' | 'training';
export type StatusFilter = 'all' | 'online' | 'offline' | 'maintenance' | 'unknown';
export type ConnectionMethod = Server['connectionMethod'];
