@echo off
echo =========================================
echo ESM Platform - Dependencies Installation
echo =========================================

echo [1/4] Checking current system...

REM Check if PostgreSQL service exists
sc query postgresql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo     ✓ PostgreSQL service found
    set POSTGRES_INSTALLED=true
) else (
    echo     ⚠ PostgreSQL not detected
    set POSTGRES_INSTALLED=false
)

REM Check if Chocolatey is available
where choco >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo     ✓ Chocolatey package manager available
    set CHOCO_AVAILABLE=true
) else (
    echo     ⚠ Chocolatey not available
    set CHOCO_AVAILABLE=false
)

echo [2/4] Installing PostgreSQL...

if "%POSTGRES_INSTALLED%"=="false" (
    if "%CHOCO_AVAILABLE%"=="true" (
        echo     Installing PostgreSQL via Chocolatey...
        choco install postgresql -y
        if %ERRORLEVEL% EQU 0 (
            echo     ✓ PostgreSQL installation completed
        ) else (
            echo     ⚠ PostgreSQL installation had issues
        )
    ) else (
        echo     Manual PostgreSQL installation required:
        echo     1. Download: https://www.postgresql.org/download/windows/
        echo     2. Run installer with default settings
        echo     3. Remember the password you set for 'postgres' user
        echo     4. Default port: 5432
        pause
    )
) else (
    echo     ✓ PostgreSQL already installed
)

echo [3/4] Installing npm dependencies...

cd /d "C:\Users\admin\Documents\Claude\Account Management"

echo     Installing xlsx...
npm install xlsx --silent

echo     Installing exceljs...
npm install exceljs --silent

echo     Installing papaparse...
npm install papaparse --silent

echo     Installing @types/papaparse...
npm install @types/papaparse --silent

echo     Installing bcryptjs...
npm install bcryptjs --silent

echo     Installing @types/bcryptjs...
npm install @types/bcryptjs --silent

echo     ✓ NPM dependencies completed

echo [4/4] Installing global MCP tools...

echo     Installing @mcp/server-postgres...
npm install -g @mcp/server-postgres --silent

echo     Installing @mcp/server-excel...
npm install -g @mcp/server-excel --silent

echo     Installing @mcp/server-filesystem...
npm install -g @mcp/server-filesystem --silent

echo     ✓ MCP tools installation completed

echo =========================================
echo INSTALLATION COMPLETE!
echo =========================================

echo.
echo Next Steps:
echo 1. If PostgreSQL wasn't auto-installed, install it manually
echo 2. Create database: psql -U postgres -c "CREATE DATABASE esm_platform;"
echo 3. Test connection: node setup-database.js
echo 4. Start development: npm run dev

echo.
echo If PostgreSQL installation failed, download from:
echo https://www.postgresql.org/download/windows/

pause
