import { X, Terminal, Shield, Network, Server, Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ITAdminGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ITAdminGuide({ isOpen, onClose }: ITAdminGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600/20 p-2 rounded-lg">
                <Server className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">IT Admin Setup Guide</h2>
                <p className="text-xs text-slate-400">Server-side configuration for remote Opera PMS access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Overview */}
          <section className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">📋 Overview</h3>
            <div className="text-xs text-slate-300 space-y-2">
              <p>You need to provide remote users with a way to reach the Opera PMS server on your internal network. Choose one or more methods:</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-green-400 font-medium">SSH Tunnel</p>
                  <p className="text-slate-500 text-[10px]">Simple, uses existing SSH server</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-purple-400 font-medium">WireGuard VPN</p>
                  <p className="text-slate-500 text-[10px]">Full network access, modern</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-cyan-400 font-medium">Tailscale</p>
                  <p className="text-slate-500 text-[10px]">Easiest, zero-config mesh VPN</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-blue-400 font-medium">RDP</p>
                  <p className="text-slate-500 text-[10px]">Remote desktop to workstation</p>
                </div>
              </div>
            </div>
          </section>

          {/* SSH Jump Server Setup */}
          <section className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4" /> Option 1: SSH Jump Server Setup
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 font-medium mb-1">⚠️ Prerequisites:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>A Linux server (Ubuntu/Debian/CentOS) with a public IP address</li>
                  <li>The server must be able to reach the Opera PMS server on the internal network</li>
                  <li>Port 22 (or custom) must be open on your firewall</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 1: Install OpenSSH Server</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-green-300 font-mono text-[11px]">
{`# Ubuntu/Debian
sudo apt update
sudo apt install openssh-server

# CentOS/RHEL
sudo yum install openssh-server
sudo systemctl enable sshd
sudo systemctl start sshd`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo apt update\nsudo apt install openssh-server', 'ssh1')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'ssh1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 2: Configure SSH (optional security hardening)</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-green-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Edit /etc/ssh/sshd_config
sudo nano /etc/ssh/sshd_config

# Recommended settings:
Port 22  # Or change to non-standard port like 2222
PermitRootLogin no
PasswordAuthentication no  # Disable password auth, use keys only
PubkeyAuthentication yes
AllowUsers remoteuser1 remoteuser2  # Restrict to specific users

# Restart SSH
sudo systemctl restart sshd`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo nano /etc/ssh/sshd_config', 'ssh2')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'ssh2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 3: Create user accounts for remote access</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-green-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Create a user for remote access
sudo useradd -m -s /bin/bash remoteuser
sudo passwd remoteuser

# Add their public key
sudo mkdir -p /home/remoteuser/.ssh
sudo nano /home/remoteuser/.ssh/authorized_keys
# Paste their public key (id_ed25519.pub content) here

sudo chmod 700 /home/remoteuser/.ssh
sudo chmod 600 /home/remoteuser/.ssh/authorized_keys
sudo chown -R remoteuser:remoteuser /home/remoteuser/.ssh`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo useradd -m -s /bin/bash remoteuser', 'ssh3')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'ssh3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 4: Enable IP forwarding (for port forwarding)</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-green-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Make it permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo sysctl -w net.ipv4.ip_forward=1', 'ssh4')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'ssh4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">✅ What to provide to remote users:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li><strong>SSH Host:</strong> Your server's public IP or hostname (e.g., <code className="bg-slate-950 px-1 rounded">jump.yourhotel.com</code>)</li>
                  <li><strong>SSH Port:</strong> <code className="bg-slate-950 px-1 rounded">22</code> (or your custom port)</li>
                  <li><strong>Username:</strong> The username you created (e.g., <code className="bg-slate-950 px-1 rounded">remoteuser</code>)</li>
                  <li><strong>Opera Server IP:</strong> The internal IP of the Opera PMS (e.g., <code className="bg-slate-950 px-1 rounded">192.168.10.50</code>)</li>
                  <li><strong>Opera Port:</strong> Usually <code className="bg-slate-950 px-1 rounded">7001</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* WireGuard VPN Setup */}
          <section className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" /> Option 2: WireGuard VPN Server Setup
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 font-medium mb-1">⚠️ Prerequisites:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>A Linux server with a public IP address</li>
                  <li>UDP port 51820 (or custom) must be open on your firewall</li>
                  <li>Kernel support for WireGuard (Linux 5.6+ or wireguard-dkms)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 1: Install WireGuard</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Ubuntu/Debian
sudo apt update
sudo apt install wireguard

# CentOS/RHEL
sudo yum install epel-release
sudo yum install wireguard-tools`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo apt update\nsudo apt install wireguard', 'wg1')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wg1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 2: Generate server keys</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Generate server keypair
cd /etc/wireguard
sudo umask 077
wg genkey | tee server_private.key | wg pubkey > server_public.key

# View the public key (share this with clients)
cat server_public.key`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('wg genkey | tee server_private.key | wg pubkey > server_public.key', 'wg2')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wg2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 3: Create server configuration</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Create /etc/wireguard/wg0.conf
sudo nano /etc/wireguard/wg0.conf

[Interface]
# Server's private key
PrivateKey = <SERVER_PRIVATE_KEY_FROM_server_private.key>
# VPN subnet (e.g., 10.10.10.1/24)
Address = 10.10.10.1/24
# Listen port
ListenPort = 51820
# Enable NAT for VPN clients
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Add clients here (see Step 5)`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo nano /etc/wireguard/wg0.conf', 'wg3')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wg3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 4: Enable IP forwarding and start WireGuard</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Check status
sudo wg show`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('sudo systemctl enable wg-quick@wg0\nsudo systemctl start wg-quick@wg0', 'wg4')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wg4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 5: Add a client (repeat for each remote user)</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Generate client keys (on client's machine or here)
wg genkey | tee client1_private.key | wg pubkey > client1_public.key

# Get the client's public key and add to /etc/wireguard/wg0.conf:
sudo nano /etc/wireguard/wg0.conf

# Add this section:
[Peer]
# Client name/description
PublicKey = <CLIENT_PUBLIC_KEY>
# Assign IP from VPN subnet
AllowedIPs = 10.10.10.2/32

# Reload config
sudo systemctl restart wg-quick@wg0`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('wg genkey | tee client1_private.key | wg pubkey > client1_public.key', 'wg5')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wg5' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">✅ What to provide to remote users:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li><strong>Endpoint:</strong> <code className="bg-slate-950 px-1 rounded">YOUR_PUBLIC_IP:51820</code> (e.g., <code className="bg-slate-950 px-1 rounded">203.0.113.50:51820</code>)</li>
                  <li><strong>Server Public Key:</strong> Content of <code className="bg-slate-950 px-1 rounded">/etc/wireguard/server_public.key</code></li>
                  <li><strong>Allowed IPs:</strong> <code className="bg-slate-950 px-1 rounded">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</code> (for full internal access) or specific subnet like <code className="bg-slate-950 px-1 rounded">192.168.10.0/24</code></li>
                  <li><strong>Client Private Key:</strong> The <code className="bg-slate-950 px-1 rounded">client1_private.key</code> you generated for them</li>
                  <li><strong>Client VPN IP:</strong> The IP you assigned (e.g., <code className="bg-slate-950 px-1 rounded">10.10.10.2</code>)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tailscale Setup */}
          <section className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
              <Network className="w-4 h-4" /> Option 3: Tailscale Setup (Easiest)
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                <p className="text-emerald-300 font-medium mb-1">✨ Why Tailscale is easiest:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>No firewall configuration needed (uses outbound connections)</li>
                  <li>No public IP required on the Opera server</li>
                  <li>Automatic key exchange and NAT traversal</li>
                  <li>Free for up to 100 devices</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 1: Install Tailscale on the Opera server</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-cyan-300 font-mono text-[11px] whitespace-pre-wrap">
{`# Linux (Opera server or a gateway machine)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Windows (if Opera runs on Windows)
# Download from: https://tailscale.com/download/windows
# Install and run, then sign in`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('curl -fsSL https://tailscale.com/install.sh | sh\nsudo tailscale up', 'ts1')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'ts1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 2: Sign in to your Tailnet</p>
                <div className="text-slate-400 space-y-1">
                  <p>1. Go to <span className="text-cyan-300">https://login.tailscale.com/admin</span></p>
                  <p>2. Create an account (or sign in with Google/Microsoft)</p>
                  <p>3. The machine will appear in your devices list</p>
                  <p>4. Note the Tailscale hostname (e.g., <code className="bg-slate-950 px-1 rounded">opera-server</code>)</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-2">Step 3: Invite remote users</p>
                <div className="text-slate-400 space-y-1">
                  <p>1. In Tailscale admin, go to "Users" → "Invite user"</p>
                  <p>2. Send them the invitation email</p>
                  <p>3. They install Tailscale on their device and sign in</p>
                  <p>4. Both devices are now on the same mesh VPN</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">✅ What to provide to remote users:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li><strong>Tailscale invitation email</strong> (sent from admin console)</li>
                  <li><strong>Opera server's Tailscale hostname</strong> (e.g., <code className="bg-slate-950 px-1 rounded">opera-server</code>)</li>
                  <li><strong>Opera server's internal IP</strong> (e.g., <code className="bg-slate-950 px-1 rounded">192.168.10.50</code>) and port (<code className="bg-slate-950 px-1 rounded">7001</code>)</li>
                  <li>They access via: <code className="bg-slate-950 px-1 rounded">http://opera-server:7001</code> or <code className="bg-slate-950 px-1 rounded">http://192.168.10.50:7001</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security Best Practices */}
          <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" /> Security Best Practices
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Use SSH key authentication only (disable password auth)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Restrict SSH access to specific users with <code className="bg-slate-950 px-1 rounded">AllowUsers</code></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Use non-standard ports for SSH/WireGuard to reduce automated attacks</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Implement fail2ban to block brute force attempts</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Regularly rotate SSH keys and WireGuard keys</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Monitor connection logs for suspicious activity</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Use a firewall to restrict access to only necessary ports</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Keep all systems updated with security patches</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
