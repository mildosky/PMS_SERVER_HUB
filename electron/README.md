# Opera PMS Server Hub - Standalone Desktop Application

This directory contains the Electron wrapper that packages the Opera PMS Server Hub as a standalone Windows .exe application.

## Features

- **Standalone .exe** - No need for Node.js or browser
- **Native window** - Runs in its own desktop window
- **System tray** - Minimizes to system tray, runs in background
- **Integrated server** - Tunnel manager runs inside the app
- **Auto-start** - Can be configured to start with Windows
- **Portable** - Single .exe file, no installation required

## Quick Start

### For Users (Running the .exe)

1. Download `OperaPMS-ServerHub-Portable.exe` from the `dist` folder
2. Double-click to run
3. The app opens in its own window
4. Toggle server connections directly
5. Minimize to system tray when not actively using

### For Developers (Building the .exe)

#### Prerequisites
- Node.js 18+ installed
- Internet connection (for downloading Electron)

#### Build Steps

1. **Open a command prompt** in the `electron` folder

2. **Run the build script:**
   ```bash
   build.bat
   ```

3. **Wait for completion** (5-10 minutes first time)
   - Downloads Electron (~150MB)
   - Builds the frontend
   - Packages everything into .exe

4. **Find your .exe** in `electron/dist/OperaPMS-ServerHub-Portable.exe`

#### Development Mode

To run without building:
```bash
run.bat
```

This starts the app in development mode with hot-reload.

## File Structure

```
electron/
├── main.js          # Electron main process (window management)
├── preload.js       # Secure IPC bridge
├── server.js        # Tunnel manager server (integrated)
├── package.json     # Electron app configuration
├── build.bat        # Build script for .exe
├── run.bat          # Development mode runner
├── assets/          # Icons and resources
│   └── icon.png     # App icon (auto-generated if missing)
└── dist/            # Build output (after building)
    └── OperaPMS-ServerHub-Portable.exe
```

## Build Options

### Portable .exe (Recommended)
```bash
npm run build:portable
```
Creates a single .exe file that runs without installation.

### Installer .exe
```bash
npm run build:installer
```
Creates a setup.exe with uninstaller and Start Menu shortcuts.

### Full Build
```bash
npm run build
```
Builds both portable and installer versions.

## Customization

### Change App Icon
Replace `assets/icon.png` with your own 256x256 PNG icon before building.

### Change Port
Edit `main.js` and `server.js`, change `const PORT = 3001` to your desired port.

### Change Window Size
Edit `main.js`, modify the `width` and `height` in `createWindow()`.

### Add Auto-Start
After building, you can:
1. Right-click the .exe
2. Create a shortcut
3. Move the shortcut to: `shell:startup`

## Troubleshooting

### Build fails with "electron not found"
```bash
npm install
```

### Build is slow
First build downloads Electron (~150MB). Subsequent builds are faster.

### .exe won't start
- Check if port 3001 is already in use
- Run as Administrator if needed
- Check Windows Defender/antivirus isn't blocking it

### Icon doesn't show
- Ensure `assets/icon.png` exists and is 256x256
- Rebuild the application

### App shows old version after changes
- Rebuild the frontend: `cd .. && npm run build`
- Then rebuild the .exe: `cd electron && build.bat`

## Technical Details

### How It Works

1. **Electron** provides the native window and system integration
2. **Express server** runs inside the Electron process on port 3001
3. **Frontend** (index.html) is served by the Express server
4. **SSH tunnels** are managed by the integrated server
5. **System tray** allows background operation

### Process Architecture

```
OperaPMS-ServerHub.exe
├── Electron Main Process
│   ├── Window Management
│   ├── System Tray
│   └── IPC Handlers
└── Express Server (port 3001)
    ├── Static File Server (frontend)
    ├── Tunnel Manager API
    └── SSH Process Manager
```

### Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script
- No external network access unless tunnel is active

## Distribution

### Sharing the .exe

The portable .exe can be:
- Copied to USB drives
- Shared via network
- Deployed to multiple machines
- No installation required

### Enterprise Deployment

For enterprise deployment:
1. Build the installer version
2. Use group policy to deploy
3. Configure auto-start via registry
4. Set up centralized configuration

## Future Enhancements

Potential improvements:
- [ ] Auto-update functionality
- [ ] Configuration file for default servers
- [ ] Encrypted credential storage
- [ ] Multiple profile support
- [ ] Connection history/logging
- [ ] Export/import server configurations
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts

## Support

For issues or questions:
1. Check the main README.md
2. Review SSH_PASSWORD_AUTH.md
3. Check Electron logs in console (Ctrl+Shift+I in dev mode)

## License

Same as the main project.
