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
      // Windows: Check if plink (PuTTY) is available for background operation
      const plinkCheck = spawn('where', ['plink'], { windowsHide: true });
      
      plinkCheck.on('close', (code) => {
        if (code === 0) {
          // plink is available - use it for fully background operation
          console.log(`[INFO] Using plink for background SSH tunnel (no visible window)`);
          
          // Create PowerShell script to prompt for password and run plink hidden
          const psScript = `
$password = Read-Host -AsSecureString "Enter SSH password for ${args[args.length - 2]}"
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

# Convert SSH command to plink format
# ssh -N -L localPort:host:remotePort user@host -p port
# plink -batch -N -L localPort:host:remotePort user@host -P port -pw password
$plinkArgs = "-batch -N ${args.filter(a => a !== '-p').join(' ').replace('-p', '-P')} -pw $plainPassword"

# Run plink completely hidden
$process = Start-Process -FilePath "plink" -ArgumentList $plinkArgs -WindowStyle Hidden -PassThru
Write-Host "SSH tunnel started in background (PID: $($process.Id))" -ForegroundColor Green
Write-Host "You can close this window now." -ForegroundColor Cyan
Start-Sleep -Seconds 3
`;
          
          const scriptPath = path.join(__dirname, `temp_plink_${serverId}.ps1`);
          fs.writeFileSync(scriptPath, psScript);
          
          sshProcess = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
            windowsHide: false,
            detached: true
          });
          
          console.log(`[INFO] Password prompt will appear for ${serverId}`);
          
          // Clean up temp script after 60 seconds
          setTimeout(() => {
            try {
              if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
            } catch (e) {}
          }, 60000);
          
          setTimeout(() => updateState(serverId, true), 2000);
          
          activeTunnels.set(serverId, {
            process: sshProcess,
            pid: sshProcess.pid,
            startedAt: new Date().toISOString(),
            localPort,
            operaHost,
            operaPort,
            visibleWindow: true,
            scriptPath: scriptPath,
            usingPlink: true
          });
          
          res.json({ 
            success: true, 
            pid: sshProcess.pid,
            message: 'Password prompt will appear. After entering password, tunnel runs in background.'
          });
        } else {
          // plink not available - use visible SSH window with auto-minimize
          console.log(`[INFO] plink not found, using visible SSH window`);
          console.log(`[INFO] Tip: Install PuTTY for fully background operation`);
          
          const sshCommand = `ssh ${args.join(' ')}`;
          
          // Create PowerShell script that runs SSH in minimized window
          const psScript = `
Write-Host "Starting SSH tunnel..." -ForegroundColor Cyan
Write-Host "Window will minimize in 5 seconds. You can minimize it now if needed." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 1

# Run SSH - it will prompt for password
${sshCommand}
`;
          
          const scriptPath = path.join(__dirname, `temp_ssh_${serverId}.ps1`);
          fs.writeFileSync(scriptPath, psScript);
          
          sshProcess = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-NoExit', '-File', scriptPath], {
            windowsHide: false,
            detached: true
          });
          
          console.log(`[INFO] Opening SSH tunnel window for ${serverId}`);
          console.log(`[INFO] Command: ${sshCommand}`);
          
          // Auto-minimize after 5 seconds using PowerShell
          setTimeout(() => {
            try {
              spawn('powershell.exe', [
                '-Command',
                `(New-Object -ComObject Shell.Application).MinimizeAll()`
              ], { windowsHide: true });
            } catch (e) {}
          }, 5000);
          
          setTimeout(() => {
            try {
              if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
            } catch (e) {}
          }, 60000);
          
          setTimeout(() => updateState(serverId, true), 2000);
          
          activeTunnels.set(serverId, {
            process: sshProcess,
            pid: sshProcess.pid,
            startedAt: new Date().toISOString(),
            localPort,
            operaHost,
            operaPort,
            visibleWindow: true,
            scriptPath: scriptPath
          });
          
          res.json({ 
            success: true, 
            pid: sshProcess.pid,
            message: 'SSH window opened. Enter password, then window will auto-minimize.'
          });
        }
      });
      
      return; // Important: return here since we're handling response in callback
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
    if (process.platform === 'win32') {
      if (tunnel.usingPlink) {
        // Kill plink process
        console.log(`[INFO] Stopping plink tunnel for ${serverId}`);
        spawn('taskkill', ['/im', 'plink.exe', '/f'], { windowsHide: true });
      } else {
        // Kill SSH process and any related windows
        console.log(`[INFO] Stopping SSH tunnel for ${serverId}`);
        spawn('taskkill', ['/im', 'ssh.exe', '/f'], { windowsHide: true });
        spawn('taskkill', ['/im', 'powershell.exe', '/fi', 'windowtitle eq "Opera SSH Tunnel"', '/f'], { windowsHide: true });
      }
      
      // Also kill by PID if we have it
      if (tunnel.pid) {
        spawn('taskkill', ['/pid', tunnel.pid, '/f', '/t'], { windowsHide: true });
      }
    } else {
      // Normal process kill for Linux/Mac
      tunnel.process.kill('SIGTERM');
      spawn('kill', ['-9', tunnel.pid]);
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
