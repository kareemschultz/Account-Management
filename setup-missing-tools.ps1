# ESM Platform - Quick Setup Script
# Run this script to install missing dependencies and tools

Write-Host "🚀 ESM Platform - Installing Missing Dependencies" -ForegroundColor Green

# 1. Install additional npm dependencies
Write-Host "📦 Installing additional npm packages..." -ForegroundColor Yellow
cd "C:\Users\admin\Documents\Claude\Account Management"

# Install Excel processing and additional utilities
npm install xlsx exceljs papaparse bcryptjs jsonwebtoken
npm install --save-dev @types/papaparse @types/bcryptjs @types/jsonwebtoken ts-node nodemon concurrently cross-env

Write-Host "✅ NPM packages installed" -ForegroundColor Green

# 2. Install PostgreSQL MCP (when available)
Write-Host "📦 Installing PostgreSQL MCP..." -ForegroundColor Yellow
try {
    npm install -g @mcp/server-postgres
    Write-Host "✅ PostgreSQL MCP installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PostgreSQL MCP not available yet - will use direct connection" -ForegroundColor Orange
}

# 3. Install Filesystem MCP (when available)
Write-Host "📦 Installing Filesystem MCP..." -ForegroundColor Yellow
try {
    npm install -g @mcp/server-filesystem
    Write-Host "✅ Filesystem MCP installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Filesystem MCP not available yet - using desktop-commander" -ForegroundColor Orange
}

# 4. Create temp and backup directories
Write-Host "📁 Creating required directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "C:\temp\excel-processing"
New-Item -ItemType Directory -Force -Path "C:\backups\esm-platform"
Write-Host "✅ Directories created" -ForegroundColor Green

# 5. Check if PostgreSQL is installed
Write-Host "🔍 Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "📋 INSTALL POSTGRESQL:" -ForegroundColor Yellow
    Write-Host "   Option 1: Download from https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   Option 2: Run 'choco install postgresql' (if Chocolatey installed)" -ForegroundColor White
    Write-Host "   Option 3: Use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres" -ForegroundColor White
}

# 6. Check package.json for verification
Write-Host "🔍 Verifying package.json updates..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $dependencies = $packageJson.dependencies
    
    $requiredDeps = @("xlsx", "exceljs", "papaparse", "pg")
    $missing = @()
    
    foreach ($dep in $requiredDeps) {
        if (-not $dependencies.$dep) {
            $missing += $dep
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "✅ All required dependencies found in package.json" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Missing dependencies: $($missing -join ', ')" -ForegroundColor Orange
    }
} else {
    Write-Host "❌ package.json not found in current directory" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Install PostgreSQL if not already installed" -ForegroundColor White
Write-Host "2. Copy claude_desktop_config_RECOMMENDED.json to C:\Users\admin\AppData\Roaming\Claude\claude_desktop_config.json" -ForegroundColor White
Write-Host "3. Update DATABASE_URL in the MCP config with your PostgreSQL password" -ForegroundColor White
Write-Host "4. Restart Claude Desktop to load new MCP configuration" -ForegroundColor White
Write-Host "5. Test setup: claude -p 'Check project status and validate all tools are working'" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup script completed!" -ForegroundColor Green
Write-Host "📋 Review MISSING_TOOLS_ANALYSIS.md for detailed installation instructions" -ForegroundColor Yellow