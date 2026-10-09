# Fix: Remove Port Number from Opera Server Configuration

## Problem
Your Opera PMS web UI is running on the default HTTP port (80), so it doesn't need a port number in the URL. The app was incorrectly requiring a port, causing you to access port 8080 (the API) instead of port 80 (the web UI).

## Solution

### Step 1: Edit Your Server in the App

1. Open the Opera PMS v5 Access Hub
2. Find your server card (e.g., "Galaxy Server")
3. Click the three dots menu (⋮) in the top-right corner
4. Select **"Edit Server"**
5. In the **"Opera Port"** field, **delete the port number** (leave it empty)
6. Click **"Update Server"**

### Step 2: Reconnect

1. Click the **"Connect"** button on your server card
2. The app will now generate the correct SSH tunnel command **without a port number**
3. Copy the command and run it in your terminal
4. Click **"Open Opera PMS"** to access the web UI

## What Changed

### Before (Incorrect)
```bash
ssh -N -L 8080:galaxy-server:8080 admin@jump.hotel.com
```
Then accessing: `http://localhost:8080` → **REST API error**

### After (Correct)
```bash
ssh -N -L 80:galaxy-server:80 admin@jump.hotel.com
```
Then accessing: `http://localhost:80` → **Opera PMS Web UI** ✅

Or even simpler (port 80 is default for HTTP):
```bash
ssh -N -L 80:galaxy-server admin@jump.hotel.com
```

## Understanding Ports

- **Port 80** = Default HTTP (web UI) - No port number needed in URL
- **Port 443** = Default HTTPS (secure web UI) - No port number needed in URL
- **Port 8080** = Alternative HTTP (often used for APIs)
- **Port 7001** = Common Opera PMS REST API port

When you access `http://galaxy-server` in a browser, it automatically uses port 80.
When you access `http://galaxy-server:8080`, it uses port 8080.

## How to Know Which Port to Use

### Ask Your Hotel IT:
> "What port does the Opera PMS web interface run on? Is it the default port 80, or a custom port?"

### Quick Test:
If you have direct access to the server, try these URLs:
```
http://galaxy-server          → Port 80 (default HTTP)
http://galaxy-server:80       → Port 80 (explicit)
http://galaxy-server:443      → Port 443 (HTTPS)
http://galaxy-server:8080     → Port 8080 (alternative)
http://galaxy-server:7001     → Port 7001 (API)
```

The one that shows the Opera login screen is the correct port for the web UI.

## SSH Tunnel Command Examples

### With Default Port (80) - No Port Specified
```bash
ssh -N -L 80:galaxy-server:80 admin@jump.hotel.com
```
Access via: `http://localhost` or `http://localhost:80`

### With Custom Port (e.g., 8080)
```bash
ssh -N -L 8080:galaxy-server:8080 admin@jump.hotel.com
```
Access via: `http://localhost:8080`

### With Different Local and Remote Ports
```bash
ssh -N -L 9000:galaxy-server:80 admin@jump.hotel.com
```
Access via: `http://localhost:9000`
(This forwards your local port 9000 to the remote port 80)

## Troubleshooting

### Still Getting API Error?
If you're still seeing `{"error":"Missing or invalid Authorization header"}`:

1. **Verify the port is correct**: Ask IT if the web UI is on port 80 or another port
2. **Check the URL path**: Try `http://localhost/opera` or `http://localhost/webui`
3. **Test directly on server**: If you can RDP to the server, try accessing `http://galaxy-server` directly

### Port 80 Requires Admin Privileges?
On some systems, binding to port 80 locally requires admin/root privileges. If you get a permission error, use a higher port:

```bash
ssh -N -L 8080:galaxy-server:80 admin@jump.hotel.com
```
Then access: `http://localhost:8080`

This forwards your local port 8080 to the remote port 80.

## Summary

✅ **Port field is now optional** in the app  
✅ **Empty port = default port 80** (standard HTTP)  
✅ **URLs generated without port** when port is empty  
✅ **SSH tunnel commands** correctly forward to the right port  

Your Opera PMS web UI should now be accessible at `http://localhost` (or `http://localhost:80`) after establishing the SSH tunnel.
