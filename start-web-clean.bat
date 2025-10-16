@echo off
echo ========================================
echo  Motion Web - Clean Start
echo ========================================
echo.

cd /d "%~dp0motion-web"

echo [1/4] Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo [2/4] Cleaning build cache...
if exist .next (
    rmdir /s /q .next
    echo    ✓ Removed .next folder
)

echo [3/4] Installing dependencies...
call npm install

echo [4/4] Starting development server...
echo.
echo ========================================
echo  Web app will be available at:
echo  http://localhost:3000
echo ========================================
echo.

call npm run dev
