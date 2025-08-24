#!/usr/bin/env powershell
# ESM Platform - Parallel Development Environment Setup
# Creates git worktrees for specialized development streams

Write-Host "🚀 Setting up ESM Platform Parallel Development Environment" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

$baseDir = "C:\Users\admin\Documents\Claude"
$mainProject = "$baseDir\Account Management"

# Ensure we're in the main project directory
Set-Location $mainProject

Write-Host "`n📂 Creating parallel development worktrees..." -ForegroundColor Yellow

# Create development branches and worktrees
$worktrees = @(
    @{name="database"; branch="feature/database-optimization"; description="Database schema, performance, and admin tools"},
    @{name="migration"; branch="feature/migration-enhancement"; description="Spreadsheet import and data validation"},
    @{name="frontend"; branch="feature/frontend-integration"; description="UI components and real data integration"},
    @{name="testing"; branch="feature/comprehensive-testing"; description="Testing, validation, and quality assurance"},
    @{name="docs"; branch="feature/documentation-complete"; description="Administrator guides and user training"}
)

foreach ($worktree in $worktrees) {
    $workingDir = "$baseDir\esm-$($worktree.name)"
    
    Write-Host "`n🔧 Setting up: $($worktree.name)" -ForegroundColor Green
    Write-Host "   Purpose: $($worktree.description)" -ForegroundColor Gray
    Write-Host "   Directory: $workingDir" -ForegroundColor Gray
    Write-Host "   Branch: $($worktree.branch)" -ForegroundColor Gray
    
    # Create branch if it doesn't exist
    try {
        git checkout -b $worktree.branch 2>$null
        git checkout main 2>$null
    } catch {
        # Branch might already exist
    }
    
    # Remove existing worktree if it exists
    if (Test-Path $workingDir) {
        Write-Host "   ⚠️ Removing existing worktree..." -ForegroundColor Yellow
        git worktree remove --force $workingDir 2>$null
        Remove-Item -Recurse -Force $workingDir -ErrorAction SilentlyContinue
    }
    
    # Create new worktree
    git worktree add $workingDir $worktree.branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Worktree created successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to create worktree" -ForegroundColor Red
    }
}

Write-Host "`n📋 Created parallel development environment:" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# List all worktrees
git worktree list

Write-Host "`n🎯 Usage Instructions:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Database Work:" -ForegroundColor Green
Write-Host "  cd '$baseDir\esm-database'" -ForegroundColor Gray
Write-Host "  # Focus on PostgreSQL optimization, schema changes, admin tools" -ForegroundColor Gray
Write-Host ""
Write-Host "Migration Work:" -ForegroundColor Green  
Write-Host "  cd '$baseDir\esm-migration'" -ForegroundColor Gray
Write-Host "  # Focus on spreadsheet import, data validation, testing" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend Work:" -ForegroundColor Green
Write-Host "  cd '$baseDir\esm-frontend'" -ForegroundColor Gray
Write-Host "  # Focus on UI components, real data integration, UX" -ForegroundColor Gray
Write-Host ""
Write-Host "Testing Work:" -ForegroundColor Green
Write-Host "  cd '$baseDir\esm-testing'" -ForegroundColor Gray
Write-Host "  # Focus on comprehensive testing, validation, QA" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation Work:" -ForegroundColor Green
Write-Host "  cd '$baseDir\esm-docs'" -ForegroundColor Gray
Write-Host "  # Focus on admin guides, user training, procedures" -ForegroundColor Gray

Write-Host "`n🔄 Merging Changes:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "1. Work in your specialized worktree"
Write-Host "2. Commit changes in that worktree"  
Write-Host "3. Switch to main: cd '$mainProject'"
Write-Host "4. Merge: git merge feature/branch-name"
Write-Host "5. Push: git push origin main"

Write-Host "`n✅ Parallel development environment ready!" -ForegroundColor Green
Write-Host "Each worktree can now run Claude Code sessions simultaneously." -ForegroundColor Gray
