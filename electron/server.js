const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Store active SSH processes
const activeTunnels = new Map();

// State file location - use app data directory for Electron
const STATE_FILE = path.join(process.env.APPDATA || process.env.HOME || '/tmp', 'opera-pms-state.json');

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

function updateState(serverId, active) {
  const state = loadState();
  if (state[serverId]) {
    state[serverId].active = active;
    state[serverId].activatedAt = active ? new Date().toISOString() : null;
  }
  saveState(state);
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Serve the built frontend app
    // In Electron, index.html is in the resources directory
    let servePath;
    if (process.resourcesPath) {
      // Running as packaged Electron app
      servePath = process.resourcesPath;
    } else {
      // Running in development
      servePath = path.resolve(__dirname, '..');
    }

    app.use(express.static(servePath, {
      index: 'index.html',
      setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }));

    // Start SSH tunnel
    app.post('/api/tunnel/start', (req, res) => {
      const { serverId, command, localPort, operaHost, operaPort } = req.body;

      if (activeTunnels.has(serverId)) {
        return res.json({ success: false, error: 'Tunnel already active' });
      }

      try {
        const parts = command.split(' ');
        const sshIndex = parts.indexOf('ssh');
        if (sshIndex === -1) {
          return res.json({ success: false, error: 'Invalid SSH command' });
        }

        const args = parts.slice(sshIndex + 1);

        if (process.platform === 'win32') {
          // Windows: Open SSH in a visible command window
          const sshCommand = `ssh ${args.join(' ')}`;
          const sshProcess = spawn('cmd.exe', ['/c', 'start', 'Opera SSH Tunnel', 'cmd.exe', '/k', sshCommand], {
            windowsHide: false,
            detached: true
          });

          console.log(`[INFO] Opening SSH tunnel in visible window for ${serverId}`);
          console.log(`[INFO] Command: ${sshCommand}`);

          setTimeout(() => {
            updateState(serverId, true);
          }, 1000);

          activeTunnels.set(serverId, {
            process: sshProcess,
            pid: sshProcess.pid,
            startedAt: new Date().toISOString(),
            localPort,
            operaHost,
            operaPort,
            visibleWindow: true
          });

          res.json({
            success: true,
            pid: sshProcess.pid,
            message: 'Tunnel started in visible window. Please enter password if prompted.'
          });
        } else {
          // Linux/Mac
          const sshProcess = spawn('ssh', args, {
            detached: true,
            stdio: 'inherit'
          });

          activeTunnels.set(serverId, {
            process: sshProcess,
            pid: sshProcess.pid,
            startedAt: new Date().toISOString(),
            localPort,
            operaHost,
            operaPort
          });

          sshProcess.on('exit', (code) => {
            console.log(`SSH tunnel for ${serverId} exited with code ${code}`);
            activeTunnels.delete(serverId);
            updateState(serverId, false);
          });

          updateState(serverId, true);
          console.log(`[OK] Tunnel started for ${serverId} (PID: ${sshProcess.pid})`);

          res.json({
            success: true,
            pid: sshProcess.pid,
            message: 'Tunnel started successfully'
          });
        }
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
          console.log(`[INFO] Closing SSH tunnel window for ${serverId}`);
          spawn('taskkill', ['/fi', 'windowtitle eq "Opera SSH Tunnel"', '/f'], { windowsHide: true });
          spawn('taskkill', ['/im', 'ssh.exe', '/f'], { windowsHide: true });
        } else {
          tunnel.process.kill('SIGTERM');
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

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        activeTunnels: activeTunnels.size,
        uptime: process.uptime()
      });
    });

    // SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(servePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Frontend not found.' });
      }
    });

    const server = app.listen(port, () => {
      console.log('');
      console.log('========================================');
      console.log('  Opera PMS v5 Server Hub');
      console.log('  Tunnel Manager + Web UI');
      console.log('========================================');
      console.log('');
      console.log(`  Web UI:     http://localhost:${port}`);
      console.log(`  API:        http://localhost:${port}/api/health`);
      console.log('');
      console.log('  Ready to manage SSH tunnels...');
      console.log('');
    });

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\nShutting down tunnel manager...');
      activeTunnels.forEach((tunnel, serverId) => {
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/im', 'ssh.exe', '/f'], { windowsHide: true });
            spawn('taskkill', ['/fi', 'windowtitle eq "Opera SSH Tunnel"', '/f'], { windowsHide: true });
          } else {
            tunnel.process.kill('SIGTERM');
          }
          console.log(`  Stopped tunnel: ${serverId}`);
        } catch (e) {}
      });
      server.close();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    resolve(server);
  });
}

module.exports = startServer;

// Allow running standalone
if (require.main === module) {
  startServer(3001);
}
