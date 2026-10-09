# Opera PMS v5 Server Hub

A comprehensive server management hub for Opera PMS v5 with SSH tunnel management, RDP connections, WireGuard VPN, and Tailscale support.

## 🚀 Quick Start

### Option 1: Standalone .exe (Recommended for Users)

**No Node.js required!**

1. Download `OperaPMS-ServerHub-Portable.exe` from the `electron/dist` folder
2. Double-click to run
3. The app opens in its own window
4. Toggle server connections directly
5. Minimize to system tray when done

**To build the .exe:**
```bash
cd electron
build.bat
```

See [BUILD_EXE_GUIDE.md](BUILD_EXE_GUIDE.md) for detailed instructions.

### Option 2: Web Version (For Developers)

**Requires Node.js 18+**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the tunnel manager:
   ```bash
   cd tunnel-manager
   start.bat
   ```

3. Open browser to `http://localhost:3001`

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## ✨ Features

### Connection Methods
- **SSH Tunnel** - Port forwarding via SSH jump hosts with password authentication
- **Remote Desktop (RDP)** - Direct RDP connections to workstations
- **WireGuard VPN** - Full tunnel VPN connections
- **Tailscale** - Mesh VPN network access
- **Direct Access** - Direct HTTP connections when on same network

### User Interface
- **One-click toggle switches** - No more copy/paste commands
- **Real-time status** - See connection status instantly
- **Toast notifications** - Get feedback on connection attempts
- **Grid/List views** - Choose your preferred layout
- **Search & filter** - Quickly find servers
- **System tray** (Electron version) - Run in background

### Server Management
- **Add/Edit/Delete** servers
- **Environment tags** - Production, Staging, Development, Training
- **Status monitoring** - Online, Offline, Maintenance
- **Connection uptime** - Track how long tunnels have been active
- **Quick access URLs** - One-click access to Opera PMS

## 📁 Project Structure

```
PMS_SERVER_HUB/
├── electron/                    # Standalone .exe version
│   ├── main.js                 # Electron main process
│   ├── server.js               # Integrated tunnel manager
│   ├── preload.js              # IPC bridge
│   ├── build.bat               # Build .exe script
│   ├── run.bat                 # Development mode
│   └── dist/                   # Built .exe output
│
├── tunnel-manager/             # Web version server
│   ├── server.js               # Express server
│   └── start.bat               # Start script
│
├── src/                        # React frontend source
│   ├── App.tsx                 # Main app component
│   ├── components/             # UI components
│   │   ├── ServerCard.tsx      # Server card with toggle
│   │   ├── Header.tsx          # App header
│   │   ├── FilterBar.tsx       # Filter controls
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   │   ├── useConnectionManager.ts
│   │   └── useServers.ts
│   └── utils/                  # Utility functions
│       └── connections.ts      # SSH/RDP/VPN generators
│
├── index.html                  # Built frontend (auto-generated)
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔧 Building

### Build Standalone .exe

```bash
cd electron
build.bat
```

Output: `electron/dist/OperaPMS-ServerHub-Portable.exe`

### Build Web Version

```bash
npm install
npm run build
```

Output: `index.html` (single-file app)

## 📖 Documentation

- **[BUILD_EXE_GUIDE.md](BUILD_EXE_GUIDE.md)** - Complete guide for building the .exe
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start for web version
- **[SSH_PASSWORD_AUTH.md](SSH_PASSWORD_AUTH.md)** - SSH password authentication guide
- **[electron/README.md](electron/README.md)** - Electron app documentation

## 🔐 SSH Authentication

The app supports interactive password authentication for SSH tunnels:

1. Toggle connection ON
2. A command window opens for password entry
3. Enter your SSH password
4. Window minimizes automatically
5. Tunnel runs in background
6. Toggle OFF to disconnect

No SSH keys required - just your password!

## 🎯 Usage

### Adding a Server

1. Click "Add Server" button
2. Fill in server details:
   - Name, Host, Port
   - Connection method (SSH/RDP/WireGuard/etc.)
   - Environment (Production/Staging/etc.)
3. Click "Add Server"

### Connecting to a Server

1. Find your server card
2. Click the toggle switch to turn it ON
3. If SSH, enter password in the popup window
4. Wait for "Connected" status
5. Click the access URL to open Opera PMS

### Disconnecting

1. Click the toggle switch to turn it OFF
2. Tunnel is immediately terminated
3. All processes cleaned up automatically

## 🛠️ Technical Details

### Architecture

**Web Version:**
```
Browser ←→ Express Server (port 3001) ←→ SSH Processes
```

**Standalone .exe:**
```
Electron Window ←→ Integrated Express Server ←→ SSH Processes
```

### Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Desktop**: Electron
- **Build**: Vite, electron-builder
- **Icons**: Lucide React

### Security

- Context isolation in Electron
- No external network access unless tunnel is active
- Passwords never logged or stored
- Secure IPC communication
- Single instance lock

## 📊 System Requirements

### Web Version
- Node.js 18+
- Modern web browser
- ~10MB disk space

### Standalone .exe
- Windows 10/11 (64-bit)
- ~200MB disk space (for .exe)
- No other dependencies

## 🐛 Troubleshooting

### Web Version

**Port 3001 already in use:**
```bash
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

**SSH tunnel not connecting:**
- Check SSH credentials
- Verify server is reachable
- Check firewall settings

### Standalone .exe

**App won't start:**
- Check if port 3001 is in use
- Run as Administrator
- Check antivirus isn't blocking

**Old version showing:**
- Rebuild the frontend: `npm run build`
- Rebuild the .exe: `cd electron && build.bat`

See [BUILD_EXE_GUIDE.md](BUILD_EXE_GUIDE.md) for more troubleshooting.

## 🔄 Development

### Run in Development Mode

**Web version:**
```bash
npm run dev
```

**Electron version:**
```bash
cd electron
run.bat
```

### Project Scripts

```bash
npm run build          # Build frontend
npm run dev            # Start dev server
npm run typecheck      # TypeScript check
```

## 📝 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review troubleshooting sections
3. Check console logs (F12 in browser, Ctrl+Shift+I in Electron)

## 🎉 Credits

Built with:
- React & TypeScript
- Electron
- Express
- Tailwind CSS
- Lucide Icons

---

**Made for managing Opera PMS v5 servers with ease!**
