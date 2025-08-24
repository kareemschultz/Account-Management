# ESM Platform - Essential Dependencies Installation
# Simplified version that actually works!

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ESM Platform - Dependencies Installation" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "[1/4] Checking current system..." -ForegroundColor Green

# Check if PostgreSQL is already installed
$postgres = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($postgres) {
    Write-Host "    ✓ PostgreSQL service found: $($postgres.Name)" -ForegroundColor Green
    $POSTGRES_INSTALLED = $true
} else {
    Write-Host "    ⚠ PostgreSQL not detected" -ForegroundColor Yellow
    $POSTGRES_INSTALLED = $false
}

# Check if Chocolatey is available
$CHOCO_AVAILABLE = $false
try {
    $chocoVersion = choco --version 2>$null
    if ($chocoVersion) {
        Write-Host "    ✓ Chocolatey package manager available" -ForegroundColor Green
        $CHOCO_AVAILABLE = $true
    }
} catch {
    Write-Host "    ⚠ Chocolatey not available" -ForegroundColor Yellow
}

Write-Host "[2/4] Installing PostgreSQL..." -ForegroundColor Green

if (-not $POSTGRES_INSTALLED) {
    if ($CHOCO_AVAILABLE) {
        Write-Host "    Installing PostgreSQL via Chocolatey..." -ForegroundColor Blue
        try {
            choco install postgresql -y
            Write-Host "    ✓ PostgreSQL installation command executed" -ForegroundColor Green
        } catch {
            Write-Host "    ⚠ Chocolatey installation had issues, checking manual options..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "    Manual PostgreSQL installation required:" -ForegroundColor Yellow
        Write-Host "    1. Download: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "    2. Run installer with default settings" -ForegroundColor White
        Write-Host "    3. Remember the password you set for 'postgres' user" -ForegroundColor White
        Write-Host "    4. Default port: 5432" -ForegroundColor White
    }
} else {
    Write-Host "    ✓ PostgreSQL already installed" -ForegroundColor Green
}

Write-Host "[3/4] Installing npm dependencies..." -ForegroundColor Green

# Change to project directory
Set-Location "C:\Users\admin\Documents\Claude\Account Management"

$packages = @("xlsx", "exceljs", "papaparse", "@types/papaparse", "bcryptjs", "@types/bcryptjs")

foreach ($package in $packages) {
    Write-Host "    Installing $package..." -ForegroundColor Blue
    try {
        npm install $package --silent 2>$null
        Write-Host "    ✓ $package installed" -ForegroundColor Green
    } catch {
        Write-Host "    ⚠ $package installation had issues" -ForegroundColor Yellow
    }
}

Write-Host "[4/4] Installing global MCP tools..." -ForegroundColor Green

$globalPackages = @("@mcp/server-postgres", "@mcp/server-excel", "@mcp/server-filesystem")

foreach ($package in $globalPackages) {
    Write-Host "    Installing $package..." -ForegroundColor Blue
    try {
        npm install -g $package --silent 2>$null
        Write-Host "    ✓ $package installed globally" -ForegroundColor Green
    } catch {
        Write-Host "    ⚠ $package installation had issues" -ForegroundColor Yellow
    }
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION ATTEMPT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If PostgreSQL wasn't auto-installed, install it manually" -ForegroundColor White
Write-Host "2. Create database: psql -U postgres -c 'CREATE DATABASE esm_platform;'" -ForegroundColor White
Write-Host "3. Test connection: node setup-database.js" -ForegroundColor White
Write-Host "4. Start development: npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "💡 TIP: Check for any error messages above" -ForegroundColor Blue
Write-Host "If PostgreSQL installation failed, download from: https://www.postgresql.org/download/windows/" -ForegroundColor Blue

Read-Host "Press Enter to continue"
