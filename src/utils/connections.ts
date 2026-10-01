import { Server } from '../types';

/**
 * Generates an SSH tunnel command to forward a local port to the remote Opera PMS server.
 * This creates a tunnel: localhost:LOCAL_PORT -> SSH_JUMP -> OPERA_HOST:OPERA_PORT
 */
export function generateSSHTunnelCommand(server: Server, localPort?: string): string {
  const port = localPort || server.operaPort;
  const sshPort = server.sshPort || '22';
  const sshUser = server.sshUser || 'admin';
  const sshHost = server.sshHost || '';
  const keyFlag = server.sshKeyPath ? ` -i "${server.sshKeyPath}"` : '';

  return `ssh -N -L ${port}:${server.operaHost}:${server.operaPort} ${sshUser}@${sshHost} -p ${sshPort}${keyFlag}`;
}

/**
 * Generates a PuTTY-compatible command (Windows)
 */
export function generatePuttyCommand(server: Server, localPort?: string): string {
  const port = localPort || server.operaPort;
  const sshPort = server.sshPort || '22';
  const sshUser = server.sshUser || 'admin';
  const sshHost = server.sshHost || '';

  return `putty -ssh -L ${port}:${server.operaHost}:${server.operaPort} -P ${sshPort} ${sshUser}@${sshHost}`;
}

/**
 * Generates an .rdp file content for Windows Remote Desktop
 */
export function generateRDPFile(server: Server): string {
  const host = server.rdpHost || server.operaHost;
  const port = server.rdpPort || '3389';
  const username = server.rdpUsername || '';

  return `full address:s:${host}:${port}
username:s:${username}
screen mode id:i:2
use multimon:i:0
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
winposstr:s:0,1,0,0,1920,1080
compression:i:1
keyboardhook:i:2
audiocapturemode:i:0
videoplaybackmode:i:1
connection type:i:7
networkautodetect:i:1
bandwidthautodetect:i:1
displayconnectionbar:i:1
enableworkspaceid:i:0
disable wallpaper:i:0
allow font smoothing:i:1
allow desktop composition:i:1
disable full window drag:i:0
disable menu anims:i:0
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
audiomode:i:0
redirectprinters:i:0
redirectcomports:i:0
redirectsmartcards:i:0
redirectwebauthn:i:1
redirectclipboard:i:1
redirectposdevices:i:0
autoreconnection enabled:i:1
authentication level:i:0
prompt for credentials:i:0
negotiate security layer:i:0
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:4
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
promptcredentialonce:i:0
gatewaybrokeringtype:i:0
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
drivestoredirect:s:*
`;
}

/**
 * Generates a WireGuard configuration
 */
export function generateWireGuardConfig(server: Server): string {
  return `[Interface]
# Opera PMS Hub - ${server.name}
# Save this file and import into WireGuard client
# You'll need to generate a private key: wg genkey | tee privatekey | wg pubkey

[Peer]
# ${server.property}
PublicKey = ${server.wgPublicKey || '<SERVER_PUBLIC_KEY>'}
Endpoint = ${server.wgEndpoint || '<ENDPOINT>:51820'}
AllowedIPs = ${server.wgAllowedIPs || '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'}
PersistentKeepalive = 25
`;
}

/**
 * Gets the local URL to access Opera after tunnel is established
 */
export function getLocalAccessURL(server: Server, localPort?: string): string {
  const port = localPort || server.operaPort;

  switch (server.connectionMethod) {
    case 'ssh-tunnel':
      return `http://localhost:${port}`;
    case 'tailscale':
      return `http://${server.tailscaleHostname || server.operaHost}:${server.operaPort}`;
    case 'wireguard':
      return `http://${server.operaHost}:${server.operaPort}`;
    case 'rdp':
      return `rdp://${server.rdpHost || server.operaHost}:${server.rdpPort || '3389'}`;
    case 'direct':
      return server.directUrl || `http://${server.operaHost}:${server.operaPort}`;
    default:
      return `http://${server.operaHost}:${server.operaPort}`;
  }
}

/**
 * Gets the connection method display info
 */
export function getConnectionMethodInfo(method: Server['connectionMethod']): {
  label: string;
  description: string;
  color: string;
  bgColor: string;
} {
  switch (method) {
    case 'ssh-tunnel':
      return {
        label: 'SSH Tunnel',
        description: 'Port forward via SSH jump host',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30',
      };
    case 'rdp':
      return {
        label: 'Remote Desktop',
        description: 'RDP to on-site workstation',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/30',
      };
    case 'wireguard':
      return {
        label: 'WireGuard VPN',
        description: 'Full tunnel via WireGuard',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10 border-purple-500/30',
      };
    case 'tailscale':
      return {
        label: 'Tailscale',
        description: 'Mesh VPN via Tailscale',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      };
    case 'direct':
      return {
        label: 'Direct',
        description: 'Direct access (same network)',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30',
      };
    default:
      return {
        label: 'Unknown',
        description: 'No method configured',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/10 border-slate-500/30',
      };
  }
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
