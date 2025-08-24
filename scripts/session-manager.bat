@echo off
REM ESM Platform - Session Management Script
REM Automates session initialization and parallel development setup

echo ====================================================
echo ESM Platform - Session Management System
echo ====================================================

REM Check if we're in the correct directory
if not exist "PROJECT_CONTEXT.md" (
    echo ERROR: Not in ESM project directory
    echo Please run from: C:\Users\admin\Documents\Claude\Account Management
    pause
    exit /b 1
)

echo [1/5] Checking project status...
if exist ".git" (
    echo     ✓ Git repository detected
    git status --porcelain > temp_status.txt
    for /f %%i in (temp_status.txt) do set HAS_CHANGES=1
    del temp_status.txt
    if defined HAS_CHANGES (
        echo     ⚠ Uncommitted changes detected
        set /p COMMIT_CHANGES=Commit changes? (y/n): 
        if /i "!COMMIT_CHANGES!"=="y" (
            git add .
            git commit -m "Auto-commit: Session initialization $(date)"
        )
    ) else (
        echo     ✓ Working directory clean
    )
) else (
    echo     ⚠ No git repository found
)

echo [2/5] Updating project context...
echo Session Start: %DATE% %TIME% >> SESSION_LOG.txt
echo     ✓ Session logged

echo [3/5] Checking dependencies...
if exist "node_modules" (
    echo     ✓ Node modules installed
) else (
    echo     ⚠ Installing dependencies...
    npm install
)

echo [4/5] Verifying database connection...
node -e "const {testConnection} = require('./lib/database.js'); testConnection().then(r => console.log('DB:', r ? '✓ Connected' : '✗ Failed')).catch(e => console.log('DB: ✗ Error -', e.message));" 2>nul || echo     ⚠ Database not available (install PostgreSQL)

echo [5/5] Checking critical files...
set CRITICAL_FILES=PROJECT_CONTEXT.md NEXT_SESSION_BRIEFING.md database\schema.sql lib\migration-utils.ts
for %%f in (%CRITICAL_FILES%) do (
    if exist "%%f" (
        echo     ✓ %%f
    ) else (
        echo     ✗ MISSING: %%f
    )
)

echo.
echo ====================================================
echo SESSION READY - Choose your workflow:
echo ====================================================
echo 1. Database Setup (Priority 1 - PostgreSQL installation)
echo 2. Migration Testing (Priority 2 - Real data import)
echo 3. Application Integration (Priority 3 - Replace mock data)
echo 4. Documentation (Priority 4 - Administrator guides)
echo 5. Parallel Development (Setup all worktrees)
echo 6. Status Check Only
echo.
set /p WORKFLOW=Select workflow (1-6): 

if "%WORKFLOW%"=="1" goto DATABASE_SETUP
if "%WORKFLOW%"=="2" goto MIGRATION_TESTING
if "%WORKFLOW%"=="3" goto APP_INTEGRATION
if "%WORKFLOW%"=="4" goto DOCUMENTATION
if "%WORKFLOW%"=="5" goto PARALLEL_SETUP
if "%WORKFLOW%"=="6" goto STATUS_CHECK
goto END

:DATABASE_SETUP
echo.
echo Starting Database Setup Workflow...
echo Recommendation: Install PostgreSQL first if not installed
echo Then run: setup-database.js
pause
goto END

:MIGRATION_TESTING
echo.
echo Starting Migration Testing Workflow...
echo Ensure June 2025 spreadsheet is available
echo Run: node lib/migration-utils.ts
pause
goto END

:APP_INTEGRATION
echo.
echo Starting Application Integration Workflow...
echo Replace mock data with database services
echo Focus: lib/db-services.ts integration
pause
goto END

:DOCUMENTATION
echo.
echo Starting Documentation Workflow...
echo Create administrator procedures guide
echo Focus: IT team setup and troubleshooting
pause
goto END

:PARALLEL_SETUP
echo.
echo Setting up Parallel Development Environment...
call setup-worktrees.bat
goto END

:STATUS_CHECK
echo.
echo Current project status checked successfully
goto END

:END
echo.
echo Session manager complete. Check SESSION_LOG.txt for details.
pause
