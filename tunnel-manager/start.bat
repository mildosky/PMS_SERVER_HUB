@echo off
:: ============================================================
:: Opera PMS v5 Server Hub - Start Script
:: ============================================================
:: This script starts the Tunnel Manager and opens the Web UI.
:: It can be run from ANY directory (including System32).
:: ============================================================

:: FIX: Always change to the directory where this .bat file lives
:: This prevents "Cannot find module" errors when run as admin
cd /d "%~dp0"

title Opera PMS Tunnel Manager
echo.
echo ========================================
echo   Opera PMS v5 Server Hub
echo   Starting up...
echo ========================================
echo.

:: ---- Check Node.js ----
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

:: ---- Install dependencies if needed ----
if not exist "node_modules\express" (
    echo [..] Installing tunnel manager dependencies...
    call npm install express cors
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
    echo.
) else (
    echo [OK] Dependencies already installed.
)

:: ---- Check if frontend is built ----
if not exist "..\index.html" (
    echo [WARN] Frontend not built yet.
    echo [..] Building frontend (this may take a moment)...
    cd ..
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Frontend build failed!
        echo         Run "npm run build" manually to see errors.
        pause
        exit /b 1
    )
    echo [OK] Frontend built successfully.
    echo.
    :: Go back to tunnel-manager directory
    cd /d "%~dp0"
) else (
    echo [OK] Frontend already built.
)

:: ---- Check if port 3001 is already in use ----
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [WARN] Port 3001 is already in use.
    echo        Another instance may be running.
    echo.
    echo        Opening browser to http://localhost:3001 ...
    start "" "http://localhost:3001"
    echo.
    echo        If this is not working, close the other instance
    echo        and run this script again.
    echo.
    pause
    exit /b 0
)

:: ---- Start the server ----
echo.
echo [..] Starting tunnel manager service...
echo.

:: Run node server.js in the foreground (keeps the window open)
node server.js

:: If we get here, the server stopped
echo.
echo [INFO] Tunnel manager has stopped.
pause
