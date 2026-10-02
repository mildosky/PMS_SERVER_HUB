# Quick Start Guide

## How to Use Opera PMS Server Hub

### Step 1: Start the Application
Double-click the file: **`tunnel-manager\start.bat`**

This will:
- ✓ Check for Node.js
- ✓ Install dependencies (first time only)
- ✓ Build the frontend (first time only)
- ✓ Start the tunnel manager service
- ✓ Open your browser automatically

### Step 2: Connect to Servers
Once the browser opens, you'll see your server cards with **toggle switches**.

**To connect:** Click the toggle switch ON
**To disconnect:** Click the toggle switch OFF

That's it! No more copying and pasting commands.

---

## What You'll See

### When Tunnel Manager is Running ✓
- Green banner at top: "Tunnel Manager is running • One-click connections enabled"
- Toggle switches work immediately
- Success toast when connected
- Direct access URL shown on connected cards

### When Tunnel Manager is NOT Running ⚠️
- Yellow banner at top: "Tunnel Manager is not running"
- Message tells you to run `tunnel-manager\start.bat`
- Toggle switches show warning if clicked

---

## Troubleshooting

### "Cannot find module" error
The script now automatically navigates to the correct directory. This error should not occur.

### Browser doesn't open
The script waits up to 10 seconds for the server to start. If it doesn't open:
1. Check if the server started (look for "Server is running!" message)
2. Manually open: http://localhost:3001

### Port 3001 already in use
Another instance is running. The script will detect this and open the browser to the existing instance.

### Toggle doesn't work
Make sure the tunnel manager is running (green banner should be visible).

---

## Technical Details

- **Web UI:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health
- **Tunnel Manager:** Node.js server that manages SSH tunnels
- **Frontend:** React app served by the tunnel manager

The tunnel manager is required because browsers cannot directly execute SSH commands or start processes. It acts as a bridge between the web UI and your operating system.
