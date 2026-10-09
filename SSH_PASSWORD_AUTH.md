# SSH Tunnel Password Authentication

## Overview
The tunnel manager now supports interactive password authentication for SSH tunnels while running in the background.

## How It Works

### Automatic Detection
The system automatically detects whether **PuTTY (plink)** is installed:

#### If PuTTY is installed (Recommended):
1. A small PowerShell window appears asking for your SSH password
2. After entering the password, the window closes automatically
3. The SSH tunnel runs **completely in the background** - no visible windows
4. Toggle OFF cleanly terminates the tunnel

#### If PuTTY is NOT installed:
1. A command window opens showing the SSH connection
2. You'll see the password prompt in that window
3. After 5 seconds, the window **automatically minimizes** to the taskbar
4. The tunnel continues running in the minimized window
5. Toggle OFF kills the SSH process and closes the window

## Installation Recommendations

### For Best Experience: Install PuTTY
1. Download PuTTY from: https://www.putty.org/
2. Install it (this adds `plink.exe` to your PATH)
3. Restart the tunnel manager
4. Now tunnels will run **completely hidden** with no visible windows

### Without PuTTY
- The system falls back to using the standard `ssh` command
- A minimized window will remain in your taskbar
- This is normal and expected behavior
- The window won't interfere with your work

## Usage

### Starting a Tunnel
1. Click the toggle switch ON for your server
2. If prompted, enter your SSH password
3. Wait for the "Connected" status to appear
4. Access Opera PMS at the URL shown on the card

### Stopping a Tunnel
1. Click the toggle switch OFF
2. The tunnel is immediately terminated
3. All related processes are cleaned up automatically

## Troubleshooting

### "plink not found" message
This is normal if PuTTY isn't installed. The system will use the fallback method with a minimized window.

### Tunnel won't connect
- Verify your SSH credentials are correct
- Check that the SSH server is reachable
- Look at the tunnel manager console for error messages

### Window won't minimize
- On Windows, some security policies may prevent auto-minimization
- You can manually minimize the window - it won't affect the tunnel
- The window will be automatically closed when you toggle OFF

### Password prompt doesn't appear
- Make sure you're clicking the toggle switch, not just hovering
- Check if another window is blocking the prompt
- Look at the tunnel manager console for status messages

## Technical Details

### Process Management
- **With PuTTY**: Uses `plink.exe` in hidden mode with password passed securely
- **Without PuTTY**: Uses `ssh.exe` in a PowerShell window that auto-minimizes
- Both methods ensure clean process termination when toggling OFF

### Security Notes
- Passwords are never logged or stored
- Passwords are passed securely to the SSH process
- Temporary PowerShell scripts are automatically deleted after use
- All processes are properly cleaned up when tunnels are stopped

## Example Workflow

```
1. Start tunnel manager: tunnel-manager\start.bat
2. Open browser: http://localhost:3001
3. Toggle server ON
4. Enter password when prompted
5. Window minimizes/closes automatically
6. Access Opera PMS at shown URL
7. Toggle OFF when done
8. All processes cleaned up automatically
```

## Future Enhancements

Possible improvements for future versions:
- SSH key-based authentication (no password needed)
- Windows Credential Manager integration
- Remember password option (with encryption)
- Multiple tunnel support per server
- Connection status monitoring and auto-reconnect
