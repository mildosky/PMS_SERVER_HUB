import { X, Terminal, Shield, Globe, Key, Network, Copy, Check, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
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
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Connection Setup Guide</h2>
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
          {/* SSH Tunnel */}
          <section className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4" /> SSH Tunnel
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p>Creates a secure port forward through a jump host to reach the Opera server on the hotel's internal network.</p>
              
              <div>
                <p className="font-medium text-slate-200 mb-2">📋 What each field means:</p>
                <div className="space-y-2 ml-2">
                  <div>
                    <p className="text-green-300 font-medium">SSH Host (Jump Server)</p>
                    <p className="text-slate-400 ml-4">
                      The public IP address or hostname of a server that's accessible from the internet and also has access to the hotel's internal network.
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      Examples: <code className="bg-slate-950 px-1 rounded">jump.hotel.com</code>, <code className="bg-slate-950 px-1 rounded">203.0.113.50</code>, <code className="bg-slate-950 px-1 rounded">vpn-gateway.hotel.net</code>
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      <strong>Where to get it:</strong> Ask hotel IT: "What's the public hostname/IP of the SSH jump server I should connect through?"
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-green-300 font-medium">SSH Port</p>
                    <p className="text-slate-400 ml-4">
                      The TCP port number the SSH server is listening on.
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      Default: <code className="bg-slate-950 px-1 rounded">22</code> (most common)
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      Some hotels use non-standard ports for security: <code className="bg-slate-950 px-1 rounded">2222</code>, <code className="bg-slate-950 px-1 rounded">2200</code>, etc.
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      <strong>Where to get it:</strong> Ask hotel IT: "What port does the SSH server listen on?" If they don't specify, try <code className="bg-slate-950 px-1 rounded">22</code> first.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-green-300 font-medium">SSH Username</p>
                    <p className="text-slate-400 ml-4">
                      Your login username for the SSH server.
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      Examples: <code className="bg-slate-950 px-1 rounded">admin</code>, <code className="bg-slate-950 px-1 rounded">yourname</code>, <code className="bg-slate-950 px-1 rounded">contractor</code>
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      <strong>Where to get it:</strong> Hotel IT will create an account for you and provide the username.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-green-300 font-medium">SSH Key Path (optional)</p>
                    <p className="text-slate-400 ml-4">
                      The file path to your private SSH key on your computer. If left blank, SSH will use your default key or prompt for a password.
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      Examples: <code className="bg-slate-950 px-1 rounded">~/.ssh/id_ed25519</code>, <code className="bg-slate-950 px-1 rounded">C:\Users\YourName\.ssh\hotel_key</code>
                    </p>
                    <p className="text-slate-500 ml-4 mt-1">
                      <strong>When to use:</strong> If you have multiple SSH keys or the hotel requires a specific key file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">🔑 Generate an SSH key (if you don't have one):</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-green-300 font-mono">
                    ssh-keygen -t ed25519 -C "your-email@company.com"
                  </code>
                  <button
                    onClick={() => copyToClipboard('ssh-keygen -t ed25519 -C "your-email@company.com"', 'sshkey')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'sshkey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-slate-500 mt-2">
                  This creates two files: <code className="bg-slate-950 px-1 rounded">~/.ssh/id_ed25519</code> (private key - keep secret!) and <code className="bg-slate-950 px-1 rounded">~/.ssh/id_ed25519.pub</code> (public key - send to hotel IT).
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">📧 Email template to send to hotel IT:</p>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 text-xs whitespace-pre-wrap font-mono">
{`Hi, I need SSH access to connect to the Opera PMS server remotely.

Please provide:
1. SSH jump server hostname/IP (public address)
2. SSH port number (default 22?)
3. My SSH username on the jump server
4. Confirmation that my public key is authorized

My public key to add to authorized_keys:
[PASTE YOUR PUBLIC KEY FROM ~/.ssh/id_ed25519.pub]

The Opera server I need to reach is at: [OPERA_IP]:[OPERA_PORT]

Thanks!`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`Hi, I need SSH access to connect to the Opera PMS server remotely.\n\nPlease provide:\n1. SSH jump server hostname/IP (public address)\n2. SSH port number (default 22?)\n3. My SSH username on the jump server\n4. Confirmation that my public key is authorized\n\nMy public key to add to authorized_keys:\n[PASTE YOUR PUBLIC KEY FROM ~/.ssh/id_ed25519.pub]\n\nThe Opera server I need to reach is at: [OPERA_IP]:[OPERA_PORT]\n\nThanks!`, 'sshemail')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'sshemail' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 font-medium mb-1">💡 How it works:</p>
                <p className="text-slate-400">
                  Your computer → SSH to jump server → Port forward to Opera server on internal network
                </p>
                <p className="text-slate-500 mt-1">
                  Example: <code className="bg-slate-950 px-1 rounded">ssh -N -L 7001:192.168.10.50:7001 admin@jump.hotel.com</code>
                </p>
                <p className="text-slate-500 mt-1">
                  Then access Opera at <code className="bg-slate-950 px-1 rounded">http://localhost:7001</code> in your browser.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 font-medium mb-2">⚠️ Troubleshooting: "Missing or invalid Authorization header"</p>
                <p className="text-slate-400 mb-2">
                  If you see <code className="bg-slate-950 px-1 rounded">{'{"error":"Missing or invalid Authorization header"}'}</code>, you're hitting the REST API, not the web UI.
                </p>
                <p className="text-slate-300 font-medium mb-1">Try these URLs instead:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 ml-2">
                  <li><code className="bg-slate-950 px-1 rounded text-cyan-300">http://localhost:7001/opera</code> (common Opera PMS path)</li>
                  <li><code className="bg-slate-950 px-1 rounded text-cyan-300">http://localhost:7001/webui</code></li>
                  <li><code className="bg-slate-950 px-1 rounded text-cyan-300">http://localhost:7001/ohi</code> (Oracle Hospitality Interface)</li>
                  <li><code className="bg-slate-950 px-1 rounded text-cyan-300">http://localhost:7001/index.html</code></li>
                </ul>
                <p className="text-slate-500 mt-2 text-[11px]">
                  Ask your hotel IT: "What's the correct URL path for the Opera PMS web interface?"
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  The web UI might also be on a different port (e.g., 8080, 8443, or 443 for HTTPS).
                </p>
              </div>
            </div>
          </section>

          {/* WireGuard */}
          <section className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" /> WireGuard VPN
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p>Creates a full network tunnel to the hotel's internal network.</p>

              <div>
                <p className="font-medium text-slate-200 mb-1">What you need from IT:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>
                    <span className="text-purple-300">Endpoint</span> — Public IP/hostname + port of the WireGuard server
                    <br />
                    <span className="text-slate-500 ml-4">Format: <code className="bg-slate-950 px-1 rounded">vpn.hotel.com:51820</code></span>
                    <br />
                    <span className="text-slate-500 ml-4">Ask: "What's the public endpoint for the WireGuard VPN?"</span>
                  </li>
                  <li>
                    <span className="text-purple-300">Server Public Key</span> — Base64 key from the server
                    <br />
                    <span className="text-slate-500 ml-4">Format: <code className="bg-slate-950 px-1 rounded">aBcDeFgHiJkL...ABCDE=</code></span>
                    <br />
                    <span className="text-slate-500 ml-4">Admin runs: <code className="bg-slate-950 px-1 rounded">cat /etc/wireguard/wg0.pub</code></span>
                  </li>
                  <li>
                    <span className="text-purple-300">Allowed IPs</span> — IP ranges routed through the tunnel
                    <br />
                    <span className="text-slate-500 ml-4">For just Opera: <code className="bg-slate-950 px-1 rounded">192.168.10.50/32</code></span>
                    <br />
                    <span className="text-slate-500 ml-4">For hotel subnet: <code className="bg-slate-950 px-1 rounded">192.168.10.0/24</code></span>
                    <br />
                    <span className="text-slate-500 ml-4">For all private: <code className="bg-slate-950 px-1 rounded">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</code></span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-200 mb-1">Generate your keypair:</p>
                <div className="relative">
                  <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 font-mono whitespace-pre-wrap">
{`wg genkey | tee privatekey | wg pubkey > publickey
cat publickey  # Send this to the admin`}
                  </code>
                  <button
                    onClick={() => copyToClipboard('wg genkey | tee privatekey | wg pubkey > publickey', 'wgkey')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'wgkey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2">📧 Email template to send to hotel IT:</p>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 text-xs whitespace-pre-wrap font-mono">
{`Hi, I need WireGuard VPN access to the Opera PMS server.

Please provide:
1. Server endpoint (public IP/hostname + port)
2. Server public key (from: cat /etc/wireguard/wg0.pub)
3. Allowed IPs for the Opera server subnet

My public key to add to the server's allowed peers:
[PASTE YOUR PUBLIC KEY HERE]

The Opera server is at: [OPERA_IP]:[OPERA_PORT]

Thanks!`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`Hi, I need WireGuard VPN access to the Opera PMS server.\n\nPlease provide:\n1. Server endpoint (public IP/hostname + port)\n2. Server public key (from: cat /etc/wireguard/wg0.pub)\n3. Allowed IPs for the Opera server subnet\n\nMy public key to add to the server's allowed peers:\n[PASTE YOUR PUBLIC KEY HERE]\n\nThe Opera server is at: [OPERA_IP]:[OPERA_PORT]\n\nThanks!`, 'email')}
                    className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                  >
                    {copied === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tailscale */}
          <section className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
              <Network className="w-4 h-4" /> Tailscale
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p>Mesh VPN — both your device and the hotel server run Tailscale.</p>
              <div>
                <p className="font-medium text-slate-200 mb-1">What you need:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><span className="text-cyan-300">Tailscale Hostname</span> — The machine name in the Tailscale admin console</li>
                  <li>Both devices must be logged into the same Tailnet (or shared via ACLs)</li>
                  <li>Install Tailscale on your device from <span className="text-cyan-300">tailscale.com</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* RDP */}
          <section className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4" /> Remote Desktop (RDP)
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p>Connects you to an on-site workstation where Opera is running.</p>
              <div>
                <p className="font-medium text-slate-200 mb-1">What you need from IT:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><span className="text-blue-300">RDP Host</span> — IP of the workstation (must be reachable via another tunnel method first)</li>
                  <li><span className="text-blue-300">Port</span> — Usually <code className="bg-slate-950 px-1 rounded">3389</code></li>
                  <li><span className="text-blue-300">Username/Password</span> — Windows login credentials</li>
                </ul>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
                <p className="text-amber-300">⚠️ Note: RDP requires network access first. You'll typically need SSH tunnel or WireGuard to reach the RDP host.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
