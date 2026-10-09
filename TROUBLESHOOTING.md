# Troubleshooting: "Missing or invalid Authorization header"

## Problem

When accessing Opera PMS v5 through your SSH tunnel, you see:
```json
{"error":"Missing or invalid Authorization header"}
```

## Root Cause

You're accessing the **REST API endpoint** instead of the **web interface**. Opera PMS v5 runs multiple services on different ports and paths:

- **REST API** (requires authentication headers) - Usually on port 7001
- **Web UI** (browser-based interface) - May be on different port or path
- **OHI (Oracle Hospitality Interface)** - Integration endpoints

## Solutions

### 1. Try Different URL Paths

Instead of `http://localhost:7001`, try:

```
http://localhost:7001/opera
http://localhost:7001/webui
http://localhost:7001/ohi
http://localhost:7001/index.html
http://localhost:7001/login
http://localhost:7001/app
```

### 2. Check for Different Ports

The web UI might be on a different port:

```bash
# Common Opera PMS ports
http://localhost:7001    # REST API (what you're hitting)
http://localhost:8080    # Alternative web UI
http://localhost:8443    # HTTPS web UI
http://localhost:443     # Standard HTTPS
http://localhost:80      # Standard HTTP
```

To test if a port is open through your tunnel:
```bash
# Add another port forward to your SSH command
ssh -N -L 7001:192.168.10.50:7001 -L 8080:192.168.10.50:8080 admin@jump.hotel.com
```

Then try `http://localhost:8080`

### 3. Check HTTPS vs HTTP

Opera PMS might require HTTPS:

```
https://localhost:7001/opera
https://localhost:8443
```

**Note:** You'll get a certificate warning since it's a self-signed cert. Click "Advanced" → "Proceed to localhost (unsafe)" to continue.

### 4. Ask Your Hotel IT

Contact your hotel IT admin with these questions:

1. **"What's the correct URL path for the Opera PMS web interface?"**
   - Is it `/opera`, `/webui`, `/app`, or something else?

2. **"Is the web UI on a different port than 7001?"**
   - Port 7001 is typically the REST API
   - The web UI might be on 8080, 8443, or another port

3. **"Does the web UI require HTTPS?"**
   - If yes, you'll need to accept the self-signed certificate

4. **"Can you provide the full URL you use internally to access Opera?"**
   - Example: `http://192.168.10.50:7001/opera` or `https://opera.hotel.local:8443`

### 5. Verify the Tunnel is Working

Test if you can reach the server at all:

```bash
# Test basic connectivity
curl -v http://localhost:7001

# You should see a response (even if it's the API error)
# If you get "Connection refused", your tunnel isn't working
```

If the tunnel isn't working:
- Check that your SSH command is still running
- Verify the jump server is accessible
- Confirm the Opera server IP/port is correct
- Check firewall rules on the jump server

### 6. Check Browser Developer Tools

Open your browser's Developer Tools (F12) and check the **Network** tab:

- Look at the request URL
- Check the response status code
- See if there are any redirects

This will tell you exactly what URL you're hitting and what the server is returning.

## Common Opera PMS v5 Configurations

### Configuration 1: Separate API and Web UI
```
API:    http://server:7001          (REST endpoints)
Web UI: http://server:7001/opera    (Browser interface)
```

### Configuration 2: Different Ports
```
API:    http://server:7001          (REST endpoints)
Web UI: http://server:8080          (Browser interface)
```

### Configuration 3: HTTPS Only
```
API:    https://server:7001         (REST endpoints)
Web UI: https://server:8443/opera   (Browser interface)
```

### Configuration 4: Reverse Proxy
```
Internal API:    http://server:7001
Internal Web UI: http://server:8080
External URL:    https://opera.hotel.com  (reverse proxy handles routing)
```

## Quick Test Script

Save this as `test-opera.sh` to quickly test different URLs:

```bash
#!/bin/bash

PORTS=(7001 8080 8443 443 80)
PATHS=("" "/opera" "/webui" "/ohi" "/index.html" "/login" "/app")

for port in "${PORTS[@]}"; do
  for path in "${PATHS[@]}"; do
    url="http://localhost:${port}${path}"
    echo "Testing: $url"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" != "000" ]; then
      echo "  ✓ Status: $response"
      if [ "$response" != "401" ] && [ "$response" != "403" ]; then
        echo "  → This might be the web UI!"
      fi
    else
      echo "  ✗ Connection failed"
    fi
  done
done
```

Run it with:
```bash
chmod +x test-opera.sh
./test-opera.sh
```

## Still Not Working?

If none of the above works, gather this information for your hotel IT:

1. **SSH tunnel command you're using:**
   ```bash
   ssh -N -L 7001:192.168.10.50:7001 admin@jump.hotel.com
   ```

2. **URL you're trying to access:**
   ```
   http://localhost:7001
   ```

3. **Exact error message:**
   ```json
   {"error":"Missing or invalid Authorization header"}
   ```

4. **Browser console errors** (F12 → Console tab)

5. **Network tab details** (F12 → Network tab → click the request)

Your hotel IT should be able to tell you the correct URL path and port for the web interface.

## Why This Happens

Opera PMS v5 is a modern application with:
- **REST API backend** - Handles data operations, requires authentication
- **Web frontend** - Static files served separately, no authentication headers needed
- **Integration endpoints** - For third-party systems (OHI, etc.)

When you access the root URL (`/`), you're hitting the API router, which expects authentication headers. The web UI is served from a different path or port.

Think of it like:
- API: `https://api.example.com` (requires API keys)
- Website: `https://www.example.com` (just open in browser)

You need to access the "website" part, not the "API" part.
