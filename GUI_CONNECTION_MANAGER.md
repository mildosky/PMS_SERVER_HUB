# Opera PMS v5 Server Hub - GUI Connection Manager

## 🎯 Overview

The Opera PMS v5 Server Hub now includes a **GUI-based connection manager** that provides a visual toggle interface for managing SSH tunnels, eliminating the need to manually run commands in PowerShell.

## ✨ New Features

### 1. Visual Connection Toggle
- **Big ON/OFF switch** for each server
- **Real-time status indicator** showing connection state
- **Uptime counter** displaying how long the tunnel has been active
- **Color-coded badges** (green = connected, blue = disconnected)

### 2. One-Click Operations
- **Copy SSH command** with a single click
- **Copy disconnect command** for easy tunnel termination
- **Direct access link** to open Opera PMS in browser

### 3. Local Port Configuration
- **Customizable local port** mapping
- **Visual port mapping display** showing local → remote
- **Port change warnings** when tunnel is active

### 4. Connection State Persistence
- **Automatic state saving** to localStorage
- **Survives browser refresh** - connection state is remembered
- **Multiple tunnel management** - track all active connections

### 5. Enhanced Server Cards
- **Connection status badge** on each server card
- **Uptime display** for active tunnels
- **Smart button labels** - "Connect" vs "Manage" based on state
- **Visual indicators** in both grid and list views

### 6. Stats Dashboard
- **Active Tunnels counter** in the stats bar
- **Real-time updates** as connections are toggled

## 🚀 How to Use

### Connecting to a Server

1. **Click "Connect"** on any server card
2. The **Connection Manager** modal opens
3. **Configure local port** (default: 80 for HTTP, or custom)
4. **Toggle the switch ON**
5. **Copy the SSH command** and paste into PowerShell
6. The tunnel is now active - access Opera at `http://localhost:{port}`

### Managing Active Connections

1. **Click "Manage"** on connected servers (green button)
2. View connection details and uptime
3. **Toggle OFF** to disconnect (or close PowerShell window)
4. **Copy disconnect command** to forcefully terminate the tunnel

### Changing Local Port

1. Open Connection Manager for the server
2. **Change the local port** in the configuration section
3. **Toggle connection OFF**, then ON again
4. The new port mapping takes effect

## 📋 Connection Manager Interface

### Main Toggle Section
```
┌─────────────────────────────────────────┐
│ SSH Tunnel Status                       │
│ ● Connected    Uptime: 2h 15m           │
│                              [  ON  ]   │
│                                         │
│ Local Port: 80    Remote: galaxy-server │
│ Access URL: http://localhost:80         │
└─────────────────────────────────────────┘
```

### SSH Command Section
```
┌─────────────────────────────────────────┐
│ SSH Tunnel Command              [Copy]  │
│                                         │
│ ssh -N -L 80:galaxy-server:80           │
│     remoteuser@192.168.56.12 -p 22      │
└─────────────────────────────────────────┘
```

### Disconnect Section (when connected)
```
┌─────────────────────────────────────────┐
│ Disconnect                      [Copy]  │
│                                         │
│ Get-Process ssh | Where-Object {        │
│   $_.CommandLine -match '80:galaxy'     │
│ } | Stop-Process -Force                 │
└─────────────────────────────────────────┘
```

## 🔧 Technical Details

### State Management
- **Hook**: `useConnectionManager` manages all connection state
- **Storage**: localStorage key `opera-pms-connections`
- **Structure**:
  ```typescript
  {
    [serverId]: {
      serverId: string,
      active: boolean,
      activatedAt: string | null,
      localPort: string
    }
  }
  ```

### Generated Commands

**SSH Tunnel Command:**
```bash
ssh -N -L {localPort}:{operaHost}:{operaPort} {sshUser}@{sshHost} -p {sshPort}
```

**Disconnect Command (PowerShell):**
```powershell
Get-Process ssh -ErrorAction SilentlyContinue | 
  Where-Object { $_.CommandLine -match '{localPort}:{operaHost}' } | 
  Stop-Process -Force
```

### Access URL Generation
- **Default HTTP**: `http://localhost:{port}` (port 80)
- **Default HTTPS**: `https://localhost:{port}` (port 443)
- **Custom port**: `http://localhost:{customPort}`

## 🎨 UI Components

### ServerCard Enhancements
- **Connection badge** with pulse animation
- **Uptime display** for active tunnels
- **Dynamic button text** based on connection state
- **Color-coded states** (emerald = connected, blue = disconnected)

### StatsBar Updates
- **Active Tunnels** counter added
- **Real-time updates** via connectionManager state
- **Visual indicator** of system-wide connection status

## 🔒 Security Notes

### What the App Does:
✅ Tracks connection state in browser  
✅ Generates SSH commands for you to copy  
✅ Provides disconnect commands  
✅ Shows connection status visually  

### What the App Cannot Do:
❌ Execute SSH commands directly (browser security)  
❌ Automatically open PowerShell  
❌ Monitor actual tunnel status (no process access)  

### Best Practices:
- Always verify the SSH command before running
- Use SSH key authentication (not passwords)
- Close PowerShell windows to terminate tunnels
- Regularly check active connections in the UI

## 🐛 Troubleshooting

### Toggle Shows "Connected" But Can't Access Opera
**Issue**: The UI shows connected but the tunnel isn't actually running.

**Solution**: 
1. Copy the SSH command from Connection Manager
2. Paste and run in PowerShell
3. Wait for connection to establish
4. Try accessing Opera again

### Port Already in Use
**Issue**: "bind: Address already in use" error

**Solution**:
1. Change the local port in Connection Manager
2. Or kill the existing process:
   ```powershell
   netstat -ano | findstr :{port}
   taskkill /PID {processId} /F
   ```

### Connection State Lost After Refresh
**Issue**: This shouldn't happen - state is persisted to localStorage.

**Solution**:
1. Check browser console for errors
2. Verify localStorage isn't disabled
3. Clear browser cache and retry

### Uptime Counter Not Updating
**Issue**: Uptime shows static value

**Solution**:
- The uptime is calculated on each render
- Refresh the page to see updated uptime
- Or toggle the connection off and on

## 📊 Comparison: Before vs After

### Before (Manual PowerShell)
```powershell
# Open PowerShell
# Type SSH command manually
# Remember port numbers
# Track connections in your head
# Manually kill processes to disconnect
```

### After (GUI Connection Manager)
```
1. Click "Connect" on server card
2. Toggle switch ON
3. Copy command (one click)
4. Paste in PowerShell
5. See visual status and uptime
6. Toggle OFF or copy disconnect command
```

## 🎯 Benefits

### For Users:
- **No more memorizing commands** - everything is generated
- **Visual feedback** - see what's connected at a glance
- **Easy management** - toggle connections on/off
- **Port flexibility** - change local ports without editing commands
- **Multiple tunnels** - manage all connections in one place

### For IT Admins:
- **Reduced support tickets** - users can self-manage
- **Standardized commands** - consistent SSH syntax
- **Audit trail** - connection state is tracked
- **Easy troubleshooting** - see what users have connected

## 🔮 Future Enhancements

Potential features for future versions:
- [ ] Auto-execute SSH commands via protocol handlers
- [ ] Real-time tunnel health monitoring
- [ ] Connection history and logs
- [ ] Export/import connection configurations
- [ ] Multi-user support with shared configurations
- [ ] WebSocket-based status updates
- [ ] Integration with Opera PMS health checks

## 📝 Notes

- The app tracks **intended connection state**, not actual SSH process state
- You still need to run the SSH command in PowerShell
- The GUI is a **management layer** on top of standard SSH
- Connection state persists across browser sessions
- Multiple browsers can track the same connections independently

---

**Version**: 2.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
