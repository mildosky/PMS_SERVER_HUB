# Opera PMS Tunnel Manager - Setup Guide

## 🎯 What This Does

The Tunnel Manager is a **background service** that enables the Opera PMS Server Hub to automatically manage SSH tunnels without requiring you to manually open PowerShell or run commands.

**Before:** You had to copy SSH commands and paste them into PowerShell manually.  
**After:** Just toggle ON/OFF in the GUI - everything is automatic!

## 📋 Prerequisites

### 1. Install Node.js

The Tunnel Manager requires Node.js to run.

**Download and install from:** https://nodejs.org/

Choose the **LTS (Long Term Support)** version.

**Verify installation:**
```cmd
node --version
npm --version
```

Both commands should return version numbers.

## 🚀 Initial Setup (One-Time)

### Step 1: Run the Start Script

1. Navigate to the `tunnel-manager` folder:
   ```
   C:\path\to\opera-pms-server-hub\tunnel-manager\
   ```

2. Double-click `start.bat`

3. The script will:
   - Install required dependencies (express, cors)
   - Start the Tunnel Manager service on port 3001
   - Open the Opera PMS Server Hub in your browser

4. You should see:
   ```
   ========================================
   Opera PMS v5 Server Hub - Tunnel Manager
   ========================================
   
   Installing dependencies...
   ...
   
   Starting tunnel manager service...
   Opera PMS Tunnel Manager running on http://localhost:3001
   Ready to manage SSH tunnels...
   
   Opening Opera PMS Server Hub...
   
   ========================================
   Tunnel Manager is running!
   ========================================
   
   The app is now open in your browser.
   You can toggle connections directly from the GUI.
   
   Press Ctrl+C to stop the tunnel manager.
   ```

### Step 2: Keep the Window Open

**Important:** Keep the `start.bat` window open while using the app.

- The window runs the Tunnel Manager service in the background
- You can minimize it, but don't close it
- When you close it, all active tunnels will be terminated

### Step 3: Use the GUI

Now you can:
1. Click "Connect" on any server
2. Toggle the switch ON
3. The SSH tunnel starts automatically (no PowerShell needed!)
4. Toggle OFF to stop the tunnel

That's it! No more manual commands.

## 🔄 Daily Usage

### Starting the Tunnel Manager

Each time you want to use the app:

1. Double-click `tunnel-manager\start.bat`
2. Wait for the browser to open
3. Start using the GUI

### Stopping the Tunnel Manager

To stop everything:

1. Go to the `start.bat` window
2. Press `Ctrl+C`
3. All active tunnels will be closed automatically

Or just close the window (tunnels will be terminated).

## 🔧 How It Works

```
┌─────────────────────────────────────────┐
│  Opera PMS Server Hub (Browser)         │
│  - Toggle ON/OFF in GUI                 │
│  - Sends commands to localhost:3001     │
└──────────────┬──────────────────────────┘
               │ HTTP API
               ▼
┌─────────────────────────────────────────┐
│  Tunnel Manager (Node.js Service)       │
│  - Runs on localhost:3001               │
│  - Executes SSH commands                │
│  - Manages process lifecycle            │
│  - Runs hidden (no visible window)      │
└──────────────┬──────────────────────────┘
               │ SSH Process
               ▼
┌─────────────────────────────────────────┐
│  SSH Tunnel (Background Process)        │
│  - Connects to jump server              │
│  - Forwards ports                       │
│  - Runs completely hidden               │
└─────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### "Tunnel Manager service is not running!"

**Problem:** You see this alert when trying to toggle a connection.

**Solution:**
1. Make sure `start.bat` is running
2. Check if the window is still open
3. If closed, double-click `start.bat` again

### Port 3001 Already in Use

**Problem:** "Error: listen EADDRINUSE: address already in use :::3001"

**Solution:**
1. Another instance of the Tunnel Manager is running
2. Close all `start.bat` windows
3. Wait 10 seconds
4. Run `start.bat` again

Or change the port in `server.js`:
```javascript
const PORT = 3002; // Change to a different port
```

Then update `TUNNEL_MANAGER_URL` in `src/hooks/useConnectionManager.ts`:
```typescript
const TUNNEL_MANAGER_URL = 'http://localhost:3002';
```

### Node.js Not Found

**Problem:** "ERROR: Node.js is not installed!"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your computer (to refresh PATH)
3. Try running `start.bat` again

### Dependencies Failed to Install

**Problem:** "ERROR: Failed to install dependencies"

**Solution:**
1. Check your internet connection
2. Try running manually:
   ```cmd
   cd tunnel-manager
   npm install
   ```
3. If behind a proxy, configure npm:
   ```cmd
   npm config set proxy http://your-proxy:port
   npm config set https-proxy http://your-proxy:port
   ```

### Tunnel Won't Start

**Problem:** Toggle shows ON but can't access Opera

**Solution:**
1. Check the SSH credentials in the server configuration
2. Verify the jump server is accessible
3. Check if SSH keys are properly configured
4. Look at the `start.bat` window for error messages

### Multiple Tunnels on Same Port

**Problem:** "bind: Address already in use"

**Solution:**
1. Change the local port in the Connection Manager
2. Or stop the conflicting tunnel first
3. Each tunnel needs a unique local port

## 🔒 Security Notes

### What the Tunnel Manager Does:
✅ Runs on localhost only (not accessible from network)  
✅ Executes SSH commands you configure in the app  
✅ Manages SSH process lifecycle  
✅ Automatically cleans up on shutdown  

### What It Doesn't Do:
❌ Store SSH passwords (uses key-based auth)  
❌ Send data over the internet  
❌ Listen on public interfaces  
❌ Log sensitive information  

### Best Practices:
- Use SSH key authentication (not passwords)
- Keep the `start.bat` window secure
- Don't share the `connections-state.json` file
- Regularly update Node.js for security patches

## 📊 API Endpoints

The Tunnel Manager exposes these endpoints (localhost only):

- `GET /api/health` - Check if service is running
- `POST /api/tunnel/start` - Start a tunnel
- `POST /api/tunnel/stop` - Stop a tunnel
- `GET /api/tunnel/status/:serverId` - Get tunnel status
- `GET /api/tunnels` - List all active tunnels

## 🎨 Making It Auto-Start (Optional)

To automatically start the Tunnel Manager when Windows boots:

### Method 1: Startup Folder

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create a shortcut to `start.bat` in this folder

### Method 2: Task Scheduler

1. Open Task Scheduler
2. Create a new task
3. Trigger: "At log on"
4. Action: "Start a program"
5. Program: `cmd.exe`
6. Arguments: `/c "C:\path\to\tunnel-manager\start.bat"`
7. Check "Run with highest privileges"

### Method 3: Windows Service (Advanced)

Use a tool like `node-windows` to install as a Windows service:

```cmd
npm install -g node-windows
```

Then create a service installer script (advanced users only).

## 🔄 Updating

When the app is updated:

1. Close the `start.bat` window
2. Replace the updated files
3. Run `start.bat` again
4. Dependencies are cached, so it starts faster

## 📝 File Structure

```
tunnel-manager/
├── server.js              # Main service
├── package.json           # Dependencies
├── start.bat              # Launcher script
├── connections-state.json # State file (auto-generated)
└── node_modules/          # Dependencies (auto-generated)
```

## 💡 Tips

### Keep It Running

- Minimize the `start.bat` window instead of closing it
- Pin it to your taskbar for easy access
- Create a desktop shortcut

### Multiple Computers

- Each computer needs its own Tunnel Manager instance
- Run `start.bat` on each machine
- They all use port 3001 independently

### Testing

To verify the Tunnel Manager is working:

1. Open browser to `http://localhost:3001/api/health`
2. You should see: `{"status":"ok","activeTunnels":0,"uptime":...}`

## 🆘 Support

If you encounter issues:

1. Check the `start.bat` window for error messages
2. Verify Node.js is installed: `node --version`
3. Ensure port 3001 is not blocked by firewall
4. Check that SSH credentials are correct in the app

## 🎉 You're All Set!

Once the Tunnel Manager is running, you can:

✅ Toggle connections with a single click  
✅ No more PowerShell commands  
✅ Automatic tunnel management  
✅ Visual status indicators  
✅ Multiple simultaneous tunnels  

Enjoy the seamless experience! 🚀

---

**Version:** 1.0  
**Last Updated:** 2024  
**Requirements:** Node.js 14+  
