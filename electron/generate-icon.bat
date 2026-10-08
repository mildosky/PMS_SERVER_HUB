@echo off
:: Generate a simple icon for Opera PMS Server Hub
:: This creates a basic icon if none exists

cd /d "%~dp0"

if not exist "assets" mkdir assets

if exist "assets\icon.png" (
    echo Icon already exists. Skipping generation.
    exit /b 0
)

echo Generating default icon...

powershell -Command ^
"Add-Type -AssemblyName System.Drawing; ^
$bmp = New-Object System.Drawing.Bitmap(256,256); ^
$g = [System.Drawing.Graphics]::FromImage($bmp); ^
$g.SmoothingMode = 'AntiAlias'; ^
$g.Clear([System.Drawing.Color]::FromArgb(37,99,235)); ^
$font = New-Object System.Drawing.Font('Arial',72,[System.Drawing.FontStyle]::Bold); ^
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White); ^
$sf = New-Object System.Drawing.StringFormat; ^
$sf.Alignment = 'Center'; ^
$sf.LineAlignment = 'Center'; ^
$rect = New-Object System.Drawing.RectangleF(0,0,256,256); ^
$g.DrawString('OPMS', $font, $brush, $rect, $sf); ^
$bmp.Save('assets\icon.png', [System.Drawing.Imaging.ImageFormat]::Png); ^
$g.Dispose(); ^
$bmp.Dispose(); ^
Write-Host 'Icon created successfully'"

if %ERRORLEVEL% EQU 0 (
    echo Icon generated: assets\icon.png
) else (
    echo Failed to generate icon. Please add assets\icon.png manually.
)
