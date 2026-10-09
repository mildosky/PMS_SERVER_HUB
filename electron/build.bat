@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: Opera PMS Server Hub - Build Standalone .exe
:: ============================================================

cd /d "%~dp0"

title Building Opera PMS Server Hub
color 0B

echo.
echo ========================================
echo   Building Opera PMS Server Hub .exe
echo ========================================
echo.

:: Step 1: Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo       Found Node.js %NODE_VERSION%
echo.

:: Step 2: Build the frontend first
echo [2/5] Building frontend...
cd ..
if not exist "node_modules\vite" (
    echo       Installing root dependencies...
    call npm install
)
call npx vite build
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
echo       Frontend built successfully.
cd /d "%~dp0"
echo.

:: Step 3: Install Electron dependencies
echo [3/5] Installing Electron dependencies...
if not exist "node_modules\electron" (
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install Electron dependencies!
        pause
        exit /b 1
    )
)
echo       Dependencies installed.
echo.

:: Step 4: Create assets directory with icon
echo [4/5] Setting up assets...
if not exist "assets" mkdir assets

:: Create a simple icon using PowerShell if none exists
if not exist "assets\icon.png" (
    echo       Creating default icon...
    powershell -Command "Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap(256,256); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::FromArgb(37,99,235)); $font = New-Object System.Drawing.Font('Arial',80,[System.Drawing.FontStyle]::Bold); $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White); $g.DrawString('OPMS',$font,$brush,30,80); $bmp.Save('%CD%\assets\icon.png'); $g.Dispose(); $bmp.Dispose()"
    echo       Icon created.
)
echo.

:: Step 5: Build the .exe
echo [5/5] Building standalone .exe...
echo       This may take several minutes...
echo.

:: Clear cached code signing tools that cause permission errors
echo       Cleaning cached build tools...
if exist "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
)

:: Skip code signing to avoid permission issues
set CSC_IDENTITY_AUTO_DISCOVERY=false

call npx electron-builder --win portable
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   [OK] Build Complete!
echo ========================================
echo.
echo   Output: dist\OperaPMS-ServerHub-Portable.exe
echo.
echo   You can now run the .exe directly!
echo   No need for Node.js or start.bat.
echo.
pause
