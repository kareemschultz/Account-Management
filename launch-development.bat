@echo off
echo ======================================================
echo     ESM Platform - Parallel Development Launcher
echo ======================================================
echo.

echo Select your development focus:
echo.
echo 1. Database Expert           - PostgreSQL optimization and administration
echo 2. Migration Specialist      - Data import and spreadsheet processing
echo 3. Frontend Integration      - UI components and user experience
echo 4. Testing & QA             - Comprehensive testing and validation
echo 5. Documentation           - Admin guides and user training
echo 6. Main Project             - Integrated development
echo 7. Show Current Worktrees   - List all parallel environments
echo 8. Exit
echo.
choice /c 12345678 /n /m "Enter your choice (1-8): "

if %ERRORLEVEL%==1 goto database
if %ERRORLEVEL%==2 goto migration
if %ERRORLEVEL%==3 goto frontend
if %ERRORLEVEL%==4 goto testing
if %ERRORLEVEL%==5 goto documentation
if %ERRORLEVEL%==6 goto main
if %ERRORLEVEL%==7 goto show
if %ERRORLEVEL%==8 goto exit

:database
echo.
echo 🗄️ Starting Database Expert Environment...
echo   Focus: PostgreSQL optimization, schema management, admin tools
echo   Directory: C:\Users\admin\Documents\Claude\esm-database
echo   Branch: feature/database-optimization
echo.
echo Opening Claude Code with Database Expert specialization...
cd "C:\Users\admin\Documents\Claude\esm-database"
echo.
echo 💡 Database Expert Commands:
echo   - Test database: node test-db-integration.js
echo   - Setup database: node setup-database.js
echo   - Monitor performance: postgres MCP queries
echo   - Optimize schemas: Review and update database/schema.sql
echo.
cmd /k "echo 🗄️ Database Expert Environment Ready && echo Working Directory: %CD%"
goto end

:migration
echo.
echo 📊 Starting Migration Specialist Environment...
echo   Focus: Data import, spreadsheet processing, validation
echo   Directory: C:\Users\admin\Documents\Claude\esm-migration
echo   Branch: feature/migration-enhancement
echo.
echo Opening Claude Code with Migration Specialist specialization...
cd "C:\Users\admin\Documents\Claude\esm-migration"
echo.
echo 💡 Migration Specialist Commands:
echo   - Test migration: node lib/migration-demo.ts
echo   - Analyze spreadsheet: Use excel-processor MCP
echo   - Validate data: node lib/simple-migration-test.js
echo   - Import data: node lib/migration-utils.ts [file.xlsx]
echo.
cmd /k "echo 📊 Migration Specialist Environment Ready && echo Working Directory: %CD%"
goto end

:frontend
echo.
echo 🎨 Starting Frontend Integration Environment...
echo   Focus: UI components, React/Next.js, user experience
echo   Directory: C:\Users\admin\Documents\Claude\esm-frontend
echo   Branch: feature/frontend-integration
echo.
echo Opening Claude Code with Frontend Specialist specialization...
cd "C:\Users\admin\Documents\Claude\esm-frontend"
echo.
echo 💡 Frontend Integration Commands:
echo   - Start dev server: npm run dev
echo   - Test components: Open localhost:3000
echo   - Replace mock data: Update lib/data.ts with lib/db-services.ts
echo   - Build production: npm run build
echo.
cmd /k "echo 🎨 Frontend Integration Environment Ready && echo Working Directory: %CD%"
goto end

:testing
echo.
echo 🧪 Starting Testing & QA Environment...
echo   Focus: Comprehensive testing, validation, quality assurance
echo   Directory: C:\Users\admin\Documents\Claude\esm-testing
echo   Branch: feature/comprehensive-testing
echo.
echo Opening Claude Code with Testing Specialist specialization...
cd "C:\Users\admin\Documents\Claude\esm-testing"
echo.
echo 💡 Testing & QA Commands:
echo   - Database tests: node test-db-integration.js
echo   - Performance tests: Use system-monitor MCP
echo   - Integration tests: npm test (when available)
echo   - Load testing: Run with 300+ user simulation
echo.
cmd /k "echo 🧪 Testing & QA Environment Ready && echo Working Directory: %CD%"
goto end

:documentation
echo.
echo 📚 Starting Documentation Specialist Environment...
echo   Focus: Admin guides, user training, procedures
echo   Directory: C:\Users\admin\Documents\Claude\esm-docs
echo   Branch: feature/documentation-complete
echo.
echo Opening Claude Code with Documentation Specialist specialization...
cd "C:\Users\admin\Documents\Claude\esm-docs"
echo.
echo 💡 Documentation Commands:
echo   - Review existing: Check docs/ directory
echo   - Administrator guide: Create/update admin procedures
echo   - User training: Develop training materials
echo   - API docs: Document integration procedures
echo.
cmd /k "echo 📚 Documentation Environment Ready && echo Working Directory: %CD%"
goto end

:main
echo.
echo 🏠 Starting Main Project Environment...
echo   Focus: Integrated development and coordination
echo   Directory: C:\Users\admin\Documents\Claude\Account Management
echo   Branch: main
echo.
echo Opening Claude Code with main project coordination...
cd "C:\Users\admin\Documents\Claude\Account Management"
echo.
echo 💡 Main Project Commands:
echo   - Start application: npm run dev
echo   - Database setup: node setup-database.js
echo   - Test integration: node test-db-integration.js
echo   - Merge branches: git merge feature/branch-name
echo.
cmd /k "echo 🏠 Main Project Environment Ready && echo Working Directory: %CD%"
goto end

:show
echo.
echo 📋 Current Git Worktrees:
echo =========================
cd "C:\Users\admin\Documents\Claude\Account Management"
git worktree list
echo.
echo 🔄 Branch Status:
echo ================
git branch -a
echo.
pause
goto start

:exit
echo.
echo 👋 Thanks for using ESM Platform Parallel Development!
exit /b 0

:end
echo.
echo 🎯 Pro Tips:
echo   - Each environment can run Claude Code simultaneously
echo   - Use 'git worktree list' to see all environments
echo   - Merge changes back to main when complete
echo   - Each specialized agent has optimized tools and focus
echo.
:start
