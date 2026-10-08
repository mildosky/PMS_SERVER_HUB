# Building Opera PMS Server Hub as Standalone .exe

This guide walks you through converting the Opera PMS Server Hub into a standalone Windows desktop application (.exe).

## Overview

The standalone .exe version:
- ✅ Runs without Node.js installed
- ✅ Opens in its own native window (not browser)
- ✅ Includes system tray icon
- ✅ Single portable file (~150MB)
- ✅ No installation required
- ✅ Can be copied to USB or shared

## Prerequisites

1. **Node.js 18+** - Download from https://nodejs.org/
2. **Internet connection** - For downloading Electron (~150MB)
3. **Disk space** - At least 500MB free

## Step-by-Step Build Process

### Step 1: Prepare the Project

1. Open Command Prompt
2. Navigate to the project root:
   ```bash
   cd C:\Users\Admin\Downloads\PMS_SERVER_HUB-opera-pms-server-hub-8bcb2
   ```

3. Install root dependencies (if not already done):
   ```bash
   npm install
   ```

4. Build the frontend:
   ```bash
   npm run build
   ```

### Step 2: Build the .exe

1. Navigate to the electron folder:
   ```bash
   cd electron
   ```

2. Run the build script:
   ```bash
   build.bat
   ```

3. Wait for the build to complete (5-10 minutes)
   - First build downloads Electron
   - Subsequent builds are faster

4. Find your .exe:
   ```
   electron\dist\OperaPMS-ServerHub-Portable.exe
   ```

### Step 3: Test the Application

1. Double-click `OperaPMS-ServerHub-Portable.exe`
2. The app opens in its own window
3. Toggle a server connection
4. Enter SSH password when prompted
5. Access Opera PMS at the shown URL

## Alternative: Development Mode

To run without building (faster for testing):

```bash
cd electron
run.bat
```

This runs the app directly without packaging.

## Manual Build (Advanced)

If the build script fails, you can build manually:

```bash
cd electron

# Install dependencies
npm install

# Build portable .exe
npx electron-builder --win portable

# Or build installer
npx electron-builder --win nsis
```

## Customization

### Change the App Icon

1. Create a 256x256 PNG icon
2. Save it as `electron/assets/icon.png`
3. Rebuild the .exe

Or use the auto-generator:
```bash
cd electron
generate-icon.bat
```

### Change the Port

Edit these files:
- `electron/main.js` - Change `const PORT = 3001`
- `electron/server.js` - Change `const PORT = 3001`

Then rebuild.

### Change Window Size

Edit `electron/main.js`:
```javascript
const mainWindow = new BrowserWindow({
  width: 1400,    // Change this
  height: 900,    // Change this
  // ...
});
```

Then rebuild.

## Distribution

### Sharing the .exe

The portable .exe can be:
- Copied to USB drives
- Shared via network/file share
- Emailed (if under size limit)
- Deployed to multiple machines

No installation or dependencies required!

### Enterprise Deployment

For deploying to multiple machines:

1. **Build the installer version:**
   ```bash
   cd electron
   npm run build:installer
   ```

2. **Deploy via:**
   - Group Policy
   - SCCM/Intune
   - Login script
   - Manual copy

3. **Auto-start configuration:**
   - Copy shortcut to `shell:startup`
   - Or add registry key for auto-start

## Troubleshooting

### Build fails: "electron not found"

```bash
cd electron
npm install
```

### Build is very slow

First build downloads Electron (~150MB). This is normal.
Subsequent builds use the cache and are much faster.

### .exe won't start

1. Check if port 3001 is already in use:
   ```bash
   netstat -ano | findstr :3001
   ```

2. Run as Administrator

3. Check Windows Defender/antivirus isn't blocking it

4. Check the console output for errors

### App shows old version after changes

1. Rebuild the frontend:
   ```bash
   cd ..
   npm run build
   ```

2. Rebuild the .exe:
   ```bash
   cd electron
   build.bat
   ```

### Icon doesn't show

1. Ensure `assets/icon.png` exists
2. Must be 256x256 PNG format
3. Rebuild the application

### SSH tunnel doesn't work

Same troubleshooting as the web version:
- Check SSH credentials
- Verify server is reachable
- Check firewall settings
- Review console logs

## File Sizes

Expected output sizes:
- **Portable .exe**: ~150-200MB
  - Includes Electron runtime
  - Includes Node.js
  - Includes your app
  - Single file, no dependencies

- **Installer .exe**: ~150-200MB
  - Same as portable
  - Plus uninstaller
  - Plus Start Menu shortcuts

## Performance

- **Startup time**: 2-5 seconds
- **Memory usage**: ~150-200MB
- **CPU usage**: Minimal when idle
- **Disk space**: ~200MB for .exe

## Comparison: Web vs .exe

| Feature | Web Version | .exe Version |
|---------|-------------|--------------|
| Requires Node.js | ✅ Yes | ❌ No |
| Requires Browser | ✅ Yes | ❌ No |
| System Tray | ❌ No | ✅ Yes |
| Native Window | ❌ No | ✅ Yes |
| Portable | ❌ No | ✅ Yes |
| Auto-start | ❌ Manual | ✅ Easy |
| File Size | ~1MB | ~150MB |
| Startup Speed | Fast | Slower |

## Next Steps

After building:

1. **Test thoroughly** - Try all features
2. **Share with users** - Distribute the .exe
3. **Create documentation** - User guide for the .exe
4. **Set up auto-start** - If needed
5. **Configure defaults** - Pre-load server configs

## Advanced: Auto-Start on Windows

To make the app start automatically:

1. **Create a shortcut** to the .exe
2. **Press Win+R**, type `shell:startup`, press Enter
3. **Copy the shortcut** to the Startup folder

The app will now start automatically when Windows boots.

## Advanced: Silent Installation

For the installer version:

```bash
OperaPMS-ServerHub-Setup.exe /S
```

The `/S` flag enables silent installation.

## Support

If you encounter issues:

1. Check this guide
2. Review `electron/README.md`
3. Check the main `README.md`
4. Look at console logs (Ctrl+Shift+I in dev mode)

## Summary

You now have a standalone .exe version of Opera PMS Server Hub that:
- Runs without dependencies
- Opens in a native window
- Includes system tray support
- Can be easily distributed
- Works on any Windows 10/11 machine

The build process takes about 10 minutes the first time, and produces a portable .exe that you can share with anyone!
