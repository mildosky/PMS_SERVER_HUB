# Opera PMS v5 Server Hub - IT Admin Setup Guide

This guide provides step-by-step instructions for hotel IT administrators to set up remote access to Opera PMS v5 servers.

## Overview

The Opera PMS v5 Server Hub allows remote users to connect to physically hosted Opera servers through various tunneling and VPN methods. As the IT admin, you need to configure the server-side infrastructure and provide connection details to remote users.

## Available Connection Methods

1. **SSH Tunnel** - Simple port forwarding through a jump server
2. **WireGuard VPN** - Full network access with modern encryption
3. **Tailscale** - Zero-config mesh VPN (easiest to set up)
4. **RDP** - Remote desktop to on-site workstations

---

## Option 1: SSH Tunnel Setup

### Prerequisites
- A Linux server (Ubuntu/Debian/CentOS) with a public IP address
- The server must be able to reach the Opera PMS server on the internal network
- Port 22 (or custom) must be open on your firewall

### Step 1: Install OpenSSH Server

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openssh-server
```

**CentOS/RHEL:**
```bash
sudo yum install openssh-server
sudo systemctl enable sshd
sudo systemctl start sshd
```

### Step 2: Configure SSH (Security Hardening)

Edit `/etc/ssh/sshd_config`:
```bash
sudo nano /etc/ssh/sshd_config
```

Recommended settings:
```
Port 22  # Or change to non-standard port like 2222
PermitRootLogin no
PasswordAuthentication no  # Disable password auth, use keys only
PubkeyAuthentication yes
AllowUsers remoteuser1 remoteuser2  # Restrict to specific users
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### Step 3: Create User Accounts

```bash
# Create a user for remote access
sudo useradd -m -s /bin/bash remoteuser
sudo passwd remoteuser

# Add their public key
sudo mkdir -p /home/remoteuser/.ssh
sudo nano /home/remoteuser/.ssh/authorized_keys
# Paste their public key (id_ed25519.pub content) here

sudo chmod 700 /home/remoteuser/.ssh
sudo chmod 600 /home/remoteuser/.ssh/authorized_keys
sudo chown -R remoteuser:remoteuser /home/remoteuser/.ssh
```

### Step 4: Enable IP Forwarding

```bash
# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Make it permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
```

### What to Provide to Remote Users

- **SSH Host:** Your server's public IP or hostname (e.g., `jump.yourhotel.com`)
- **SSH Port:** `22` (or your custom port)
- **Username:** The username you created (e.g., `remoteuser`)
- **Opera Server IP:** The internal IP of the Opera PMS (e.g., `192.168.10.50`)
- **Opera Port:** Usually `7001`

---

## Option 2: WireGuard VPN Setup

### Prerequisites
- A Linux server with a public IP address
- UDP port 51820 (or custom) must be open on your firewall
- Kernel support for WireGuard (Linux 5.6+ or wireguard-dkms)

### Step 1: Install WireGuard

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install wireguard
```

**CentOS/RHEL:**
```bash
sudo yum install epel-release
sudo yum install wireguard-tools
```

### Step 2: Generate Server Keys

```bash
cd /etc/wireguard
sudo umask 077
wg genkey | tee server_private.key | wg pubkey > server_public.key

# View the public key (share this with clients)
cat server_public.key
```

### Step 3: Create Server Configuration

Create `/etc/wireguard/wg0.conf`:
```bash
sudo nano /etc/wireguard/wg0.conf
```

```ini
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

# Add clients here (see Step 5)
```

### Step 4: Enable IP Forwarding and Start WireGuard

```bash
# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Check status
sudo wg show
```

### Step 5: Add Clients (Repeat for Each Remote User)

```bash
# Generate client keys (on client's machine or here)
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
sudo systemctl restart wg-quick@wg0
```

### What to Provide to Remote Users

- **Endpoint:** `YOUR_PUBLIC_IP:51820` (e.g., `203.0.113.50:51820`)
- **Server Public Key:** Content of `/etc/wireguard/server_public.key`
- **Allowed IPs:** `10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16` (for full internal access) or specific subnet like `192.168.10.0/24`
- **Client Private Key:** The `client1_private.key` you generated for them
- **Client VPN IP:** The IP you assigned (e.g., `10.10.10.2`)

---

## Option 3: Tailscale Setup (Easiest)

### Why Tailscale is Easiest
- No firewall configuration needed (uses outbound connections)
- No public IP required on the Opera server
- Automatic key exchange and NAT traversal
- Free for up to 100 devices

### Step 1: Install Tailscale on the Opera Server

**Linux:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**Windows:**
Download from: https://tailscale.com/download/windows
Install and run, then sign in.

### Step 2: Sign in to Your Tailnet

1. Go to https://login.tailscale.com/admin
2. Create an account (or sign in with Google/Microsoft)
3. The machine will appear in your devices list
4. Note the Tailscale hostname (e.g., `opera-server`)

### Step 3: Invite Remote Users

1. In Tailscale admin, go to "Users" → "Invite user"
2. Send them the invitation email
3. They install Tailscale on their device and sign in
4. Both devices are now on the same mesh VPN

### What to Provide to Remote Users

- **Tailscale invitation email** (sent from admin console)
- **Opera server's Tailscale hostname** (e.g., `opera-server`)
- **Opera server's internal IP** (e.g., `192.168.10.50`) and port (`7001`)
- They access via: `http://opera-server:7001` or `http://192.168.10.50:7001`

---

## Option 4: RDP Setup

### Prerequisites
- Windows workstation with Opera PMS installed
- Network access to the workstation (via SSH tunnel, WireGuard, or Tailscale)

### Step 1: Enable Remote Desktop

1. Open **System Properties** → **Remote** tab
2. Select **Allow remote connections to this computer**
3. Add the remote user's account to the allowed users list

### Step 2: Configure Firewall

```powershell
# Allow RDP through Windows Firewall
netsh advfirewall firewall set rule group="Remote Desktop" new enable=Yes
```

### What to Provide to Remote Users

- **RDP Host:** IP of the workstation (must be reachable via another tunnel method first)
- **Port:** Usually `3389`
- **Username/Password:** Windows login credentials

**Note:** RDP requires network access first. You'll typically need SSH tunnel or WireGuard to reach the RDP host.

---

## Security Best Practices

✅ Use SSH key authentication only (disable password auth)  
✅ Restrict SSH access to specific users with `AllowUsers`  
✅ Use non-standard ports for SSH/WireGuard to reduce automated attacks  
✅ Implement fail2ban to block brute force attempts  
✅ Regularly rotate SSH keys and WireGuard keys  
✅ Monitor connection logs for suspicious activity  
✅ Use a firewall to restrict access to only necessary ports  
✅ Keep all systems updated with security patches  

---

## Testing the Setup

After configuring any method, test the connection:

1. **SSH Tunnel:**
   ```bash
   ssh -N -L 7001:192.168.10.50:7001 remoteuser@jump.hotel.com
   ```
   Then open `http://localhost:7001` in a browser.

2. **WireGuard:**
   - Import the config file into WireGuard client
   - Activate the connection
   - Open `http://192.168.10.50:7001` in a browser

3. **Tailscale:**
   - Ensure Tailscale is running on both devices
   - Open `http://opera-server:7001` in a browser

4. **RDP:**
   - Use Remote Desktop Connection
   - Connect to the workstation IP
   - Launch Opera PMS from the remote desktop

---

## Troubleshooting

### SSH Connection Issues
- Check if SSH service is running: `sudo systemctl status sshd`
- Verify firewall allows port 22 (or your custom port)
- Check `/var/log/auth.log` for authentication errors

### WireGuard Connection Issues
- Check if WireGuard is running: `sudo wg show`
- Verify UDP port 51820 is open on firewall
- Check IP forwarding is enabled: `cat /proc/sys/net/ipv4/ip_forward` (should be 1)

### Tailscale Connection Issues
- Check Tailscale status: `tailscale status`
- Verify both devices are logged into the same Tailnet
- Check Tailscale admin console for device status

### General Network Issues
- Verify the Opera server is accessible from the jump/VPN server
- Check firewall rules on both ends
- Test basic connectivity with `ping` and `telnet`

---

## Support

For additional help, refer to the built-in IT Admin Guide in the Opera PMS v5 Server Hub application (click the "IT Admin" button in the header).
