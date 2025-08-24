@echo off
echo ======================================================
echo     ESM Platform - Parallel Development Setup
echo ======================================================
echo.

cd "C:\Users\admin\Documents\Claude\Account Management"

echo Creating parallel development worktrees...
echo.

REM Create development branches
git checkout -b feature/database-optimization 2>nul
git checkout -b feature/migration-enhancement 2>nul  
git checkout -b feature/frontend-integration 2>nul
git checkout -b feature/comprehensive-testing 2>nul
git checkout -b feature/documentation-complete 2>nul
git checkout main

echo [1/5] Database Optimization Worktree...
git worktree add "..\esm-database" feature/database-optimization
echo     Purpose: PostgreSQL optimization, schema changes, admin tools

echo [2/5] Migration Enhancement Worktree...
git worktree add "..\esm-migration" feature/migration-enhancement
echo     Purpose: Spreadsheet import, data validation, testing

echo [3/5] Frontend Integration Worktree...
git worktree add "..\esm-frontend" feature/frontend-integration
echo     Purpose: UI components, real data integration, UX

echo [4/5] Comprehensive Testing Worktree...
git worktree add "..\esm-testing" feature/comprehensive-testing
echo     Purpose: Testing, validation, quality assurance

echo [5/5] Documentation Complete Worktree...
git worktree add "..\esm-docs" feature/documentation-complete
echo     Purpose: Admin guides, user training, procedures

echo.
echo ✅ Parallel development environment created!
echo.
echo Current worktrees:
git worktree list

echo.
echo 🎯 Usage:
echo   Database:     cd "..\esm-database"
echo   Migration:    cd "..\esm-migration"  
echo   Frontend:     cd "..\esm-frontend"
echo   Testing:      cd "..\esm-testing"
echo   Documentation: cd "..\esm-docs"
echo.
echo Each directory can run Claude Code sessions simultaneously!
echo.
pause
