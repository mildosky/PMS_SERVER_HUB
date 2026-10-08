@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: Opera PMS Server Hub - Development Mode
:: ============================================================

cd /d "%~dp0"

title Opera PMS Server Hub (Dev Mode)
color 0B

echo.
echo ========================================
echo   Opera PMS Server Hub - Dev Mode
echo ========================================
echo.

:: Check Node.js
echo [1/3] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)
echo       OK
echo.

:: Check dependencies
echo [2/3] Checking dependencies...
if not exist "node_modules\electron" (
    echo       Installing dependencies...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo       OK
echo.

:: Build frontend if needed
echo [3/3] Checking frontend...
cd ..
if not exist "index.html" (
    echo       Building frontend...
    if not exist "node_modules\vite" call npm install
    call npx vite build
)
cd /d "%~dp0"
echo       OK
echo.

:: Start Electron
echo Starting application...
echo.
call npx electron .
