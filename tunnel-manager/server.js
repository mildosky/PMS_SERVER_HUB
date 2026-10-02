const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

    // Spawn SSH process (hidden window on Windows)
    const sshProcess = spawn('ssh', args, {
      windowsHide: true,
      detached: false,
      stdio: 'ignore'
    });

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
    // Kill the process
    tunnel.process.kill('SIGTERM');
    
    // Also try to kill by PID (in case process tree)
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', tunnel.pid, '/f', '/t']);
    } else {
      spawn('kill', ['-9', tunnel.pid]);
    }

    activeTunnels.delete(serverId);
    updateState(serverId, false);

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

// Start server
app.listen(PORT, () => {
  console.log(`Opera PMS Tunnel Manager running on http://localhost:${PORT}`);
  console.log('Ready to manage SSH tunnels...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down tunnel manager...');
  
  // Kill all active tunnels
  activeTunnels.forEach((tunnel, serverId) => {
    try {
      tunnel.process.kill('SIGTERM');
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', tunnel.pid, '/f', '/t']);
      }
    } catch (e) {
      // Ignore errors during shutdown
    }
  });
  
  process.exit(0);
});
