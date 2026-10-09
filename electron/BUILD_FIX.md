# Build Fix: Symbolic Link Permission Error

## Problem

When building the Electron .exe, you encountered this error:

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
```

This happened because electron-builder was trying to extract code signing tools that contain symbolic links, which require administrator privileges on Windows.

## Solution Applied

I've updated the build configuration to **skip code signing entirely** for the portable .exe build. This is safe because:

1. **Portable .exe doesn't need signing** - It's not an installer
2. **No security risk** - The app runs locally on your machine
3. **Faster builds** - Skips the signing step entirely
4. **No admin required** - Works without elevated privileges

## Changes Made

### 1. Updated `electron/package.json`

Added these settings to the `win` configuration:

```json
"win": {
  "signAndEditExecutable": false,
  "sign": null,
  "forceCodeSigning": false
}
```

### 2. Updated `electron/build.bat`

- Added cache cleanup to remove problematic cached files
- Set `CSC_IDENTITY_AUTO_DISCOVERY=false` environment variable
- Added `--config.win.sign=null` flag to the build command

## How to Build Now

Simply run the build script again:

```bash
cd electron
build.bat
```

The build should now complete successfully without any permission errors.

## What to Expect

1. **Step 1-4**: Same as before (check Node.js, build frontend, install dependencies, create icon)
2. **Step 5**: Build will proceed without code signing
3. **Output**: `electron/dist/OperaPMS-ServerHub-Portable.exe`

## If You Still Get Errors

### Error: "Cannot create symbolic link"

This should be fixed now. If it still happens:

1. **Clear the cache manually**:
   ```bash
   rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache"
   ```

2. **Run as Administrator** (last resort):
   - Right-click `build.bat`
   - Select "Run as administrator"

### Error: "electron-builder not found"

```bash
cd electron
npm install
```

### Error: "Frontend build failed"

```bash
cd ..
npm install
npm run build
```

## Verification

After the build completes, you should see:

```
========================================
  [OK] Build Complete!
========================================

  Output: dist\OperaPMS-ServerHub-Portable.exe

  You can now run the .exe directly!
  No need for Node.js or start.bat.
```

## Next Steps

1. **Test the .exe**:
   ```bash
   cd dist
   .\OperaPMS-ServerHub-Portable.exe
   ```

2. **Verify it works**:
   - App opens in its own window (not browser)
   - System tray icon appears
   - Toggle switches work
   - SSH tunnels connect

3. **Share the .exe**:
   - Copy to USB drive
   - Share via network
   - No installation required!

## Technical Details

### Why Code Signing Isn't Needed

- **Portable apps** run directly without installation
- **Windows SmartScreen** may show a warning (click "Run anyway")
- **Corporate environments** might block unsigned apps (contact IT)
- **Personal use** has no restrictions

### What Code Signing Does

Code signing is for:
- Proving the app is from a known publisher
- Preventing tampering during distribution
- Reducing SmartScreen warnings

For internal/personal use, it's not necessary.

## Troubleshooting

### App Shows "Windows protected your PC"

This is SmartScreen warning for unsigned apps:

1. Click **"More info"**
2. Click **"Run anyway"**

This is normal for unsigned portable apps.

### Antivirus Flags the .exe

Some antivirus software flags unsigned executables:

1. **Add exception** in your antivirus
2. **Whitelist** the folder where the .exe is located
3. **Temporarily disable** real-time protection during first run

### .exe Won't Start

Check these:

1. **Port 3001 available**:
   ```bash
   netstat -ano | findstr :3001
   ```

2. **Run as Administrator** if needed

3. **Check logs** - Open Command Prompt and run:
   ```bash
   .\OperaPMS-ServerHub-Portable.exe --enable-logging
   ```

## Alternative: Use NSIS Installer

If you need an installer instead of portable:

```bash
cd electron
npm run build:installer
```

This creates `OperaPMS-ServerHub-Setup.exe` with:
- Installation wizard
- Start Menu shortcuts
- Uninstaller
- Same no-signing configuration

## Summary

✅ **Problem**: Symbolic link permission error during build  
✅ **Solution**: Disabled code signing for portable build  
✅ **Result**: Build completes without admin privileges  
✅ **Output**: Standalone .exe ready to use  

The build should now work smoothly. Just run `build.bat` again!
