const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve the built frontend app from the project root
const PROJECT_ROOT = path.resolve(__dirname, '..');
const servePath = PROJECT_ROOT;

app.use(express.static(servePath, {
  index: 'index.html',
  // Add cache-busting headers to prevent stale versions
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Store active SSH processes
const activeTunnels = new Map();

// Load connections state
const STATE_FILE = path.join(__dirname, 'connections-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {};
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Start SSH tunnel
app.post('/api/tunnel/start', (req, res) => {
  const { serverId, command, localPort, operaHost, operaPort } = req.body;

  // Check if already running
  if (activeTunnels.has(serverId)) {
    return res.json({ success: false, error: 'Tunnel already active' });
  }

  try {
    // Parse SSH command to extract components
    // Format: ssh -N -L localPort:host:remotePort user@host -p port
    const parts = command.split(' ');
    const sshIndex = parts.indexOf('ssh');
    if (sshIndex === -1) {
      return res.json({ success: false, error: 'Invalid SSH command' });
    }

    // Build command arguments
    const args = parts.slice(sshIndex + 1);

    // Spawn SSH process in a visible terminal window for password entry
    // On Windows, use cmd.exe /c start to open a new visible window
    let sshProcess;
    
    if (process.platform === 'win32') {
      // Windows: Open SSH in a new visible command window
      const sshCommand = `ssh ${args.join(' ')}`;
      sshProcess = spawn('cmd.exe', ['/c', 'start', 'Opera SSH Tunnel', 'cmd.exe', '/k', sshCommand], {
        windowsHide: false,
        detached: true
      });
      
      // Since we used cmd.exe /c start, the actual SSH process is a child
      // We need to track it differently - find the SSH process by looking for recent cmd.exe with SSH
      console.log(`[INFO] Opening SSH tunnel in visible window for ${serverId}`);
      console.log(`[INFO] Command: ${sshCommand}`);
      console.log(`[INFO] Please enter your password in the new window if prompted`);
      
      // Give it a moment to start, then we'll consider it active
      setTimeout(() => {
        // Mark as active even though we can't track the exact SSH PID
        updateState(serverId, true);
      }, 1000);
      
      // Store a reference (we won't be able to kill it cleanly, but that's okay)
      activeTunnels.set(serverId, {
        process: sshProcess,
        pid: sshProcess.pid,
        startedAt: new Date().toISOString(),
        localPort,
        operaHost,
        operaPort,
        visibleWindow: true
      });
      
      return res.json({ 
        success: true, 
        pid: sshProcess.pid,
        message: 'Tunnel started in visible window. Please enter password if prompted.'
      });
    } else {
      // Linux/Mac: Spawn with inherited stdio so password prompt works
      sshProcess = spawn('ssh', args, {
        detached: true,
        stdio: 'inherit'
      });
    }

    // Store process reference
    activeTunnels.set(serverId, {
      process: sshProcess,
      pid: sshProcess.pid,
      startedAt: new Date().toISOString(),
      localPort,
      operaHost,
      operaPort
    });

    // Handle process exit
    sshProcess.on('exit', (code) => {
      console.log(`SSH tunnel for ${serverId} exited with code ${code}`);
      activeTunnels.delete(serverId);
      updateState(serverId, false);
    });

    sshProcess.on('error', (err) => {
      console.error(`SSH tunnel error for ${serverId}:`, err);
      activeTunnels.delete(serverId);
      updateState(serverId, false);
    });

    // Update state
    updateState(serverId, true);

    console.log(`[OK] Tunnel started for ${serverId} (PID: ${sshProcess.pid})`);

    res.json({ 
      success: true, 
      pid: sshProcess.pid,
      message: 'Tunnel started successfully'
    });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Stop SSH tunnel
app.post('/api/tunnel/stop', (req, res) => {
  const { serverId } = req.body;

  const tunnel = activeTunnels.get(serverId);
  if (!tunnel) {
    return res.json({ success: false, error: 'No active tunnel found' });
  }

  try {
    if (process.platform === 'win32' && tunnel.visibleWindow) {
      // Windows visible window: Kill by window title
      console.log(`[INFO] Closing SSH tunnel window for ${serverId}`);
      spawn('taskkill', ['/fi', 'windowtitle eq "Opera SSH Tunnel"', '/f'], { windowsHide: true });
      
      // Also try to kill any SSH processes that might be running
      spawn('taskkill', ['/im', 'ssh.exe', '/f'], { windowsHide: true });
    } else {
      // Normal process kill
      tunnel.process.kill('SIGTERM');
      
      // Also try to kill by PID (in case process tree)
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', tunnel.pid, '/f', '/t'], { windowsHide: true });
      } else {
        spawn('kill', ['-9', tunnel.pid]);
      }
    }

    activeTunnels.delete(serverId);
    updateState(serverId, false);

    console.log(`[OK] Tunnel stopped for ${serverId}`);

    res.json({ success: true, message: 'Tunnel stopped successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get tunnel status
app.get('/api/tunnel/status/:serverId', (req, res) => {
  const { serverId } = req.params;
  const tunnel = activeTunnels.get(serverId);

  if (tunnel) {
    res.json({
      active: true,
      pid: tunnel.pid,
      startedAt: tunnel.startedAt,
      localPort: tunnel.localPort,
      operaHost: tunnel.operaHost,
      operaPort: tunnel.operaPort
    });
  } else {
    res.json({ active: false });
  }
});

// Get all active tunnels
app.get('/api/tunnels', (req, res) => {
  const tunnels = [];
  activeTunnels.forEach((tunnel, serverId) => {
    tunnels.push({
      serverId,
      pid: tunnel.pid,
      startedAt: tunnel.startedAt,
      localPort: tunnel.localPort,
      operaHost: tunnel.operaHost,
      operaPort: tunnel.operaPort
    });
  });
  res.json({ tunnels });
});

// Update state file
function updateState(serverId, active) {
  const state = loadState();
  if (state[serverId]) {
    state[serverId].active = active;
    state[serverId].activatedAt = active ? new Date().toISOString() : null;
  }
  saveState(state);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeTunnels: activeTunnels.size,
    uptime: process.uptime()
  });
});

// SPA fallback - serve index.html for any unmatched routes
app.get('*', (req, res) => {
  const indexPath = path.join(servePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not found. Run "npm run build" in the project root first.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  Opera PMS v5 Server Hub');
  console.log('  Tunnel Manager + Web UI');
  console.log('========================================');
  console.log('');
  console.log(`  Web UI:     http://localhost:${PORT}`);
  console.log(`  API:        http://localhost:${PORT}/api/health`);
  console.log(`  Serving:    ${servePath}`);
  console.log('');
  console.log('  Ready to manage SSH tunnels...');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down tunnel manager...');
  
  // Kill all active tunnels
  activeTunnels.forEach((tunnel, serverId) => {
    try {
      tunnel.process.kill('SIGTERM');
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', tunnel.pid, '/f', '/t'], { windowsHide: true });
      }
      console.log(`  Stopped tunnel: ${serverId}`);
    } catch (e) {
      // ignore
    }
  });
  
  console.log('Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.emit('SIGINT');
});
