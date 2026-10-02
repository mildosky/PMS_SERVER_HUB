@echo off
:: ============================================================
:: Opera PMS v5 Server Hub - Start Script
:: ============================================================
:: This script starts the Tunnel Manager and opens the Web UI.
:: ============================================================

:: FIX: Always change to the directory where this .bat file lives
cd /d "%~dp0"

title Opera PMS Tunnel Manager
color 0B

echo.
echo ========================================
echo   Opera PMS v5 Server Hub
echo   Starting up...
echo ========================================
echo.

:: ---- Check Node.js ----
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo       Found Node.js %NODE_VERSION%
echo.

:: ---- Install dependencies if needed ----
echo [2/4] Checking dependencies...
if not exist "node_modules\express" (
    echo       Installing dependencies (first time only)...
    call npm install express cors --silent
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies
        echo         Try running: npm install express cors
        echo.
        pause
        exit /b 1
    )
    echo       Dependencies installed.
) else (
    echo       Dependencies already installed.
)
echo.

:: ---- Check if frontend is built ----
echo [3/4] Checking frontend...
if not exist "..\index.html" (
    echo       Frontend not built. Building now...
    cd ..
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Frontend build failed!
        echo         Run "npm run build" manually to see errors.
        echo.
        pause
        exit /b 1
    )
    echo       Frontend built successfully.
    cd /d "%~dp0"
) else (
    echo       Frontend already built.
)
echo.

:: ---- Check if port 3001 is already in use ----
echo [4/4] Starting tunnel manager...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [WARN] Port 3001 is already in use.
    echo        Another instance may be running.
    echo.
    echo        Opening browser to http://localhost:3001 ...
    timeout /t 2 /nobreak >nul
    start "" http://localhost:3001
    echo.
    echo        Press any key to close this window...
    pause >nul
    exit /b 0
)

:: ---- Start the server in background ----
echo.
echo       Launching server on port 3001...
start /B node server.js

:: ---- Wait for server to be ready ----
echo       Waiting for server to start...
set RETRY_COUNT=0
:wait_loop
timeout /t 1 /nobreak >nul
set /a RETRY_COUNT+=1

:: Check if server is responding
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 1 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% EQU 0 goto server_ready

if %RETRY_COUNT% LSS 10 goto wait_loop

echo.
echo [ERROR] Server failed to start within 10 seconds.
echo         Check the error messages above.
echo.
pause
exit /b 1

:server_ready
echo.
echo ========================================
echo   [OK] Server is running!
echo ========================================
echo.
echo   Web UI:  http://localhost:3001
echo   API:     http://localhost:3001/api/health
echo.
echo   Opening browser...
echo.

:: ---- Open the browser ----
start "" http://localhost:3001

echo   The app is now open in your browser.
echo   You can toggle connections directly from the GUI.
echo.
echo   Press Ctrl+C to stop the tunnel manager.
echo.

:: ---- Keep window open and show logs ----
:loop
timeout /t 60 /nobreak >nul
goto loop
