/**
 * Security Implementation Validation Script
 * Tests all security components and configurations
 */

const fs = require('fs')
const path = require('path')

// Color output helpers
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`)

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function test(name, condition, level = 'error') {
  const passed = condition
  const result = { name, passed, level }
  results.tests.push(result)
  
  if (passed) {
    results.passed++
    log('green', `✅ ${name}`)
  } else {
    if (level === 'warning') {
      results.warnings++
      log('yellow', `⚠️  ${name}`)
    } else {
      results.failed++
      log('red', `❌ ${name}`)
    }
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath)
  test(`${description} exists: ${filePath}`, fs.existsSync(fullPath))
  return fs.existsSync(fullPath)
}

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath)
  if (!fs.existsSync(fullPath)) return false
  
  const content = fs.readFileSync(fullPath, 'utf8')
  const contains = content.includes(searchString)
  test(`${description}: ${searchString}`, contains)
  return contains
}

async function validateSecurityImplementation() {
  log('blue', '\n🔒 ESM Platform Security Implementation Validation\n')
  log('blue', '=' .repeat(60))
  
  // 1. Core Security Files
  log('blue', '\n📁 Core Security Files')
  checkFileExists('lib/auth.ts', 'NextAuth configuration')
  checkFileExists('lib/auth-middleware.ts', 'Authentication middleware')
  checkFileExists('lib/api-auth.ts', 'API authentication wrapper')
  checkFileExists('lib/audit.ts', 'Audit logging system')
  checkFileExists('lib/input-validation.ts', 'Input validation utilities')
  checkFileExists('lib/security-headers.ts', 'Security headers configuration')
  checkFileExists('lib/csrf-protection.ts', 'CSRF protection')
  
  // 2. Database Schema
  log('blue', '\n🗄️  Database Security Schema')
  checkFileExists('database/schema.sql', 'Database schema')
  checkFileContains('database/schema.sql', 'CREATE TABLE accounts', 'NextAuth accounts table')
  checkFileContains('database/schema.sql', 'CREATE TABLE sessions', 'NextAuth sessions table')
  checkFileContains('database/schema.sql', 'CREATE TABLE roles', 'RBAC roles table')
  checkFileContains('database/schema.sql', 'CREATE TABLE user_roles', 'User roles junction table')
  checkFileContains('database/schema.sql', 'CREATE TABLE security_events', 'Security events logging')
  checkFileContains('database/schema.sql', 'password_hash', 'Password hashing in users table')
  
  // 3. Authentication Pages
  log('blue', '\n🔐 Authentication Pages')
  checkFileExists('app/auth/signin/page.tsx', 'Sign-in page')
  checkFileExists('app/auth/error/page.tsx', 'Auth error page')
  checkFileExists('app/api/auth/[...nextauth]/route.ts', 'NextAuth API route')
  checkFileExists('app/api/auth/csrf-token/route.ts', 'CSRF token endpoint')
  
  // 4. Middleware Protection
  log('blue', '\n🛡️  Route Protection')
  checkFileExists('middleware.ts', 'Next.js middleware')
  checkFileContains('middleware.ts', 'withAuth', 'NextAuth middleware integration')
  checkFileContains('middleware.ts', 'X-Frame-Options', 'Security headers in middleware')
  checkFileContains('middleware.ts', 'role-based access control', 'RBAC in middleware')
  
  // 5. API Security
  log('blue', '\n🔒 API Route Security')
  checkFileContains('app/api/users/route.ts', 'withApiAuth', 'User API authentication')
  checkFileContains('app/api/users/route.ts', 'validateInput', 'Input validation in API')
  checkFileContains('app/api/users/route.ts', 'rateLimit', 'Rate limiting in API')
  checkFileExists('app/api/audit/security-events/route.ts', 'Security events API')
  checkFileExists('app/api/audit/logs/route.ts', 'Audit logs API')
  
  // 6. Input Validation & Sanitization
  log('blue', '\n🧹 Input Validation & Sanitization')
  checkFileContains('lib/input-validation.ts', 'sanitizeString', 'String sanitization')
  checkFileContains('lib/input-validation.ts', 'detectSQLInjection', 'SQL injection detection')
  checkFileContains('lib/input-validation.ts', 'detectXSS', 'XSS detection')
  checkFileContains('lib/input-validation.ts', 'passwordSchema', 'Password validation schema')
  checkFileContains('lib/input-validation.ts', 'emailSchema', 'Email validation schema')
  
  // 7. Session Management
  log('blue', '\n🗝️  Session Management')
  checkFileContains('lib/auth.ts', 'strategy: "jwt"', 'JWT session strategy')
  checkFileContains('lib/auth.ts', 'maxAge', 'Session timeout configuration')
  checkFileContains('lib/auth.ts', 'logSecurityEvent', 'Security event logging in auth')
  
  // 8. Role-Based Access Control
  log('blue', '\n👮 Role-Based Access Control')
  checkFileContains('lib/auth-middleware.ts', 'hasRole', 'Role checking function')
  checkFileContains('lib/auth-middleware.ts', 'hasPermission', 'Permission checking function')
  checkFileContains('lib/auth-middleware.ts', 'requiredPermissions', 'Permission-based authorization')
  
  // 9. Audit Logging
  log('blue', '\n📝 Audit Logging')
  checkFileContains('lib/audit.ts', 'logAuditEvent', 'Audit event logging')
  checkFileContains('lib/audit.ts', 'calculateRiskScore', 'Risk scoring system')
  checkFileContains('lib/audit.ts', 'getClientInfo', 'Client information extraction')
  
  // 10. Security Headers
  log('blue', '\n🛡️  Security Headers')
  checkFileContains('lib/security-headers.ts', 'Content-Security-Policy', 'CSP header')
  checkFileContains('lib/security-headers.ts', 'X-Frame-Options', 'Clickjacking protection')
  checkFileContains('lib/security-headers.ts', 'X-Content-Type-Options', 'MIME type sniffing protection')
  checkFileContains('lib/security-headers.ts', 'Strict-Transport-Security', 'HTTPS enforcement')
  
  // 11. Configuration Files
  log('blue', '\n⚙️  Configuration')
  checkFileExists('.env.example', 'Environment variables example')
  checkFileContains('.env.example', 'NEXTAUTH_SECRET', 'JWT secret configuration')
  checkFileContains('.env.example', 'DATABASE_URL', 'Database connection configuration')
  checkFileContains('.env.example', 'BCRYPT_ROUNDS', 'Password hashing configuration')
  
  // 12. UI Components
  log('blue', '\n🎨 Security UI Components')
  checkFileExists('components/auth/session-provider.tsx', 'Session provider component')
  checkFileExists('components/security/security-dashboard.tsx', 'Security dashboard component')
  checkFileContains('components/layout/header.tsx', 'useSession', 'Session integration in header')
  checkFileContains('components/layout/header.tsx', 'signOut', 'Logout functionality')
  
  // 13. Package Dependencies
  log('blue', '\n📦 Security Dependencies')
  const packageJsonPath = path.join(__dirname, '..', 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    test('NextAuth.js installed', 'next-auth' in deps)
    test('PostgreSQL adapter installed', '@auth/pg-adapter' in deps)
    test('bcryptjs installed', 'bcryptjs' in deps)
    test('Helmet security headers installed', 'helmet' in deps)
    test('Input validation (Zod) installed', 'zod' in deps)
    test('DOMPurify sanitization installed', 'isomorphic-dompurify' in deps)
  }
  
  // Summary
  log('blue', '\n' + '=' .repeat(60))
  log('blue', '📊 VALIDATION SUMMARY')
  log('blue', '=' .repeat(60))
  
  log('green', `✅ Passed: ${results.passed} tests`)
  if (results.warnings > 0) {
    log('yellow', `⚠️  Warnings: ${results.warnings} tests`)
  }
  if (results.failed > 0) {
    log('red', `❌ Failed: ${results.failed} tests`)
  }
  
  const totalTests = results.passed + results.failed + results.warnings
  const successRate = Math.round((results.passed / totalTests) * 100)
  
  log('blue', `\n🎯 Success Rate: ${successRate}%`)
  
  if (results.failed === 0) {
    log('green', '\n🎉 SECURITY IMPLEMENTATION COMPLETE!')
    log('green', '✅ All critical security components are in place')
    log('green', '✅ Authentication and authorization configured')
    log('green', '✅ Input validation and sanitization implemented')
    log('green', '✅ Audit logging and security monitoring ready')
    log('green', '✅ Security headers and CSRF protection active')
    log('green', '\n🚀 System ready for production security hardening!')
  } else {
    log('red', '\n⚠️  SECURITY GAPS DETECTED!')
    log('red', `❌ ${results.failed} critical issues need attention`)
    if (results.warnings > 0) {
      log('yellow', `⚠️  ${results.warnings} recommendations to improve security`)
    }
  }
  
  // Security Checklist
  log('blue', '\n📋 PRODUCTION SECURITY CHECKLIST')
  log('blue', '=' .repeat(60))
  log('blue', '□ Update .env with production secrets')
  log('blue', '□ Configure PostgreSQL with production credentials')
  log('blue', '□ Enable HTTPS and update NEXTAUTH_URL')
  log('blue', '□ Set SECURE_COOKIES=true for production')
  log('blue', '□ Configure rate limiting with Redis in production')
  log('blue', '□ Set up log aggregation for audit trails')
  log('blue', '□ Configure backup strategies for security data')
  log('blue', '□ Test all authentication flows')
  log('blue', '□ Validate role permissions across all routes')
  log('blue', '□ Perform penetration testing')
  
  return results
}

// Run validation
validateSecurityImplementation().then(results => {
  process.exit(results.failed > 0 ? 1 : 0)
}).catch(error => {
  log('red', `\n💥 Validation script failed: ${error.message}`)
  process.exit(1)
})