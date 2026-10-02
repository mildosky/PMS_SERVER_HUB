@echo off
title Opera PMS Tunnel Manager
echo ========================================
echo Opera PMS v5 Server Hub - Tunnel Manager
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install express cors
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Start the tunnel manager server in background
echo Starting tunnel manager service...
start /B node server.js

:: Wait a moment for server to start
timeout /t 2 /nobreak >nul

:: Open the browser to the app
echo Opening Opera PMS Server Hub...
start "" "..\index.html"

echo.
echo ========================================
echo Tunnel Manager is running!
echo ========================================
echo.
echo The app is now open in your browser.
echo You can toggle connections directly from the GUI.
echo.
echo Press Ctrl+C to stop the tunnel manager.
echo.

:: Keep window open and monitor
:loop
timeout /t 60 /nobreak >nul
goto loop
