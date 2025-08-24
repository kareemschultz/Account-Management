# System Administration Manual
*Account Management Platform - Daily Operations & User Management*

## Table of Contents
1. [Overview](#overview)
2. [Daily Operations](#daily-operations)
3. [User Management](#user-management)
4. [Service Administration](#service-administration)
5. [Access Control Management](#access-control-management)
6. [System Monitoring](#system-monitoring)
7. [Troubleshooting Procedures](#troubleshooting-procedures)
8. [Maintenance Tasks](#maintenance-tasks)
9. [Emergency Procedures](#emergency-procedures)
10. [Administrative Workflows](#administrative-workflows)

---

## Overview

This manual provides comprehensive guidance for daily administration of the Account Management Platform, covering all aspects of user management, system operations, and troubleshooting procedures for managing 245+ employee accounts across 16 IT services.

### Administrator Roles
- **Super Administrator:** Full system access, user management, system configuration
- **Department Administrator:** Department-specific user management and reporting
- **Service Administrator:** Service-specific access control and monitoring
- **Security Administrator:** Audit, compliance, and security monitoring

---

## Daily Operations

### 1. Morning System Health Check

```bash
#!/bin/bash
# Daily system health check script

echo "=== Daily System Health Check $(date) ==="

# Check system status
echo "1. System Resources:"
df -h | grep -E "(/)|(postgres)|(app)"
free -h
uptime

# Check database
echo "2. Database Status:"
psql -U esm_app -d esm_platform -h localhost -c "
SELECT 
    'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 
    'Active Sessions', COUNT(*) FROM pg_stat_activity WHERE state = 'active'
UNION ALL
SELECT 
    'Database Size', pg_size_pretty(pg_database_size('esm_platform'))
;"

# Check application health
echo "3. Application Status:"
curl -s https://accounts.yourdomain.com/api/health | jq '.'

# Check recent errors
echo "4. Recent Errors:"
tail -n 50 /var/log/account-management/error.log | grep -i error | tail -10

echo "=== Health Check Complete ==="
```

### 2. User Account Status Review

#### Daily User Status Report
```sql
-- Connect to database
psql -U esm_app -d esm_platform -h localhost

-- Daily user status summary
SELECT 
    status,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users 
GROUP BY status
ORDER BY user_count DESC;

-- New user registrations (last 24 hours)
SELECT 
    username,
    email,
    department,
    created_at
FROM users 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Recent access changes
SELECT 
    u.username,
    s.name as service,
    usa.access_level,
    usa.updated_at,
    usa.updated_by
FROM user_service_access usa
JOIN users u ON usa.user_id = u.id
JOIN services s ON usa.service_id = s.id
WHERE usa.updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY usa.updated_at DESC;
```

### 3. Service Health Monitoring

```bash
# Check all IT services status
echo "=== Service Health Status ==="

# Database services check
echo "Database Connection Test:"
psql -U esm_app -d esm_platform -h localhost -c "SELECT NOW();" > /dev/null && echo "✓ PostgreSQL: OK" || echo "✗ PostgreSQL: ERROR"

# Application endpoints check
services=(
    "https://accounts.yourdomain.com/api/health"
    "https://accounts.yourdomain.com/api/users/optimized"
    "https://accounts.yourdomain.com/api/services"
    "https://accounts.yourdomain.com/api/monitoring/metrics"
)

for service in "${services[@]}"; do
    if curl -s -f "$service" > /dev/null; then
        echo "✓ $(basename "$service"): OK"
    else
        echo "✗ $(basename "$service"): ERROR"
    fi
done

# Check Docker services (if using Docker deployment)
docker-compose ps
```

---

## User Management

### 1. Creating New User Accounts

#### Web Interface Method
1. Navigate to **Users** > **Add New User**
2. Fill required fields:
   - Username (must be unique)
   - Email address
   - Full name
   - Department
   - Employee ID
   - Start date
   - Manager (if applicable)

#### Command Line Method
```sql
-- Connect to database
psql -U esm_app -d esm_platform -h localhost

-- Create new user
INSERT INTO users (
    username, email, first_name, last_name, 
    employee_id, department_id, manager_id, 
    status, created_at, created_by
) VALUES (
    'john.doe', 'john.doe@company.com', 'John', 'Doe',
    'EMP12345', 
    (SELECT id FROM departments WHERE name = 'IT Support'),
    (SELECT id FROM users WHERE username = 'jane.manager'),
    'active', NOW(), 'admin'
);

-- Grant default service access
INSERT INTO user_service_access (user_id, service_id, access_level, granted_by, granted_at)
SELECT 
    (SELECT id FROM users WHERE username = 'john.doe'),
    s.id,
    'user',
    'admin',
    NOW()
FROM services s 
WHERE s.default_access = true;
```

### 2. Modifying User Accounts

#### Update User Information
```sql
-- Update user details
UPDATE users SET 
    email = 'new.email@company.com',
    department_id = (SELECT id FROM departments WHERE name = 'New Department'),
    updated_at = NOW(),
    updated_by = 'admin'
WHERE username = 'john.doe';

-- Update user status
UPDATE users SET 
    status = 'suspended',
    status_reason = 'Policy violation',
    updated_at = NOW(),
    updated_by = 'security_admin'
WHERE username = 'problem.user';
```

#### Bulk User Updates
```sql
-- Bulk department transfer
UPDATE users SET 
    department_id = (SELECT id FROM departments WHERE name = 'New Department'),
    updated_at = NOW(),
    updated_by = 'hr_admin'
WHERE username IN ('user1', 'user2', 'user3');

-- Bulk status change
UPDATE users SET 
    status = 'inactive',
    updated_at = NOW(),
    updated_by = 'admin'
WHERE last_login < NOW() - INTERVAL '90 days'
    AND status = 'active';
```

### 3. User Deactivation Process

#### Standard Deactivation
```sql
-- Begin transaction
BEGIN;

-- Update user status
UPDATE users SET 
    status = 'inactive',
    deactivated_at = NOW(),
    deactivated_by = 'hr_admin',
    deactivation_reason = 'Employment terminated'
WHERE username = 'departing.employee';

-- Revoke all service access
UPDATE user_service_access SET 
    access_level = 'none',
    revoked_at = NOW(),
    revoked_by = 'hr_admin',
    revoke_reason = 'User deactivated'
WHERE user_id = (SELECT id FROM users WHERE username = 'departing.employee')
    AND access_level != 'none';

-- Log audit trail
INSERT INTO audit_logs (
    user_id, action, details, performed_by, performed_at
) VALUES (
    (SELECT id FROM users WHERE username = 'departing.employee'),
    'user_deactivated',
    'User account deactivated - employment terminated',
    'hr_admin',
    NOW()
);

-- Commit transaction
COMMIT;
```

#### Emergency Deactivation
```sql
-- Immediate account suspension
UPDATE users SET 
    status = 'suspended',
    suspended_at = NOW(),
    suspended_by = 'security_admin',
    suspension_reason = 'Security incident - immediate access revoked'
WHERE username = 'security.risk.user';

-- Immediately revoke all active sessions
-- (Application-level session invalidation)
```

---

## Service Administration

### 1. Managing IT Services

#### View Service Status
```sql
-- Service overview
SELECT 
    s.name,
    s.status,
    s.service_type,
    COUNT(usa.user_id) as active_users,
    s.last_health_check
FROM services s
LEFT JOIN user_service_access usa ON s.id = usa.service_id 
    AND usa.access_level != 'none'
GROUP BY s.id, s.name, s.status, s.service_type, s.last_health_check
ORDER BY s.name;

-- Service access distribution
SELECT 
    s.name as service,
    usa.access_level,
    COUNT(*) as user_count
FROM services s
JOIN user_service_access usa ON s.id = usa.service_id
WHERE usa.access_level != 'none'
GROUP BY s.name, usa.access_level
ORDER BY s.name, usa.access_level;
```

#### Service Configuration Management
```sql
-- Add new service
INSERT INTO services (
    name, description, service_type, status, 
    connection_string, health_check_url, 
    default_access, created_by, created_at
) VALUES (
    'New Monitoring Tool',
    'Advanced system monitoring and alerting',
    'monitoring',
    'active',
    'https://monitoring.company.com',
    'https://monitoring.company.com/health',
    false,
    'admin',
    NOW()
);

-- Update service configuration
UPDATE services SET 
    health_check_url = 'https://newurl.company.com/health',
    updated_at = NOW(),
    updated_by = 'admin'
WHERE name = 'Grafana';

-- Disable service temporarily
UPDATE services SET 
    status = 'maintenance',
    maintenance_message = 'Scheduled maintenance 2025-08-22 02:00-04:00',
    updated_at = NOW()
WHERE name = 'IPAM';
```

### 2. Service Access Management

#### Grant Service Access
```sql
-- Grant individual access
INSERT INTO user_service_access (
    user_id, service_id, access_level, 
    granted_by, granted_at, expiry_date
) VALUES (
    (SELECT id FROM users WHERE username = 'new.user'),
    (SELECT id FROM services WHERE name = 'Grafana'),
    'user',
    'admin',
    NOW(),
    NOW() + INTERVAL '1 year'
);

-- Grant bulk access to department
INSERT INTO user_service_access (user_id, service_id, access_level, granted_by, granted_at)
SELECT 
    u.id,
    (SELECT id FROM services WHERE name = 'Zabbix'),
    'user',
    'admin',
    NOW()
FROM users u
JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Infrastructure'
    AND NOT EXISTS (
        SELECT 1 FROM user_service_access usa 
        WHERE usa.user_id = u.id 
            AND usa.service_id = (SELECT id FROM services WHERE name = 'Zabbix')
    );
```

#### Revoke Service Access
```sql
-- Revoke individual access
UPDATE user_service_access SET 
    access_level = 'none',
    revoked_at = NOW(),
    revoked_by = 'admin',
    revoke_reason = 'Role change - access no longer required'
WHERE user_id = (SELECT id FROM users WHERE username = 'changed.role.user')
    AND service_id = (SELECT id FROM services WHERE name = 'Administrative Panel');

-- Revoke expired access
UPDATE user_service_access SET 
    access_level = 'none',
    revoked_at = NOW(),
    revoked_by = 'system',
    revoke_reason = 'Access expired'
WHERE expiry_date < NOW()
    AND access_level != 'none';
```

---

## Access Control Management

### 1. Role-Based Access Control

#### Standard Access Levels
- **none:** No access
- **user:** Standard user access
- **power_user:** Enhanced user privileges
- **admin:** Administrative access
- **super_admin:** Full administrative control

#### Department-Based Access Matrix
```sql
-- View department access patterns
SELECT 
    d.name as department,
    s.name as service,
    usa.access_level,
    COUNT(*) as user_count
FROM departments d
JOIN users u ON d.id = u.department_id
JOIN user_service_access usa ON u.id = usa.user_id
JOIN services s ON usa.service_id = s.id
WHERE usa.access_level != 'none'
GROUP BY d.name, s.name, usa.access_level
ORDER BY d.name, s.name, usa.access_level;
```

### 2. VPN Access Management

#### VPN User Management
```sql
-- Active VPN users
SELECT 
    u.username,
    u.email,
    va.vpn_type,
    va.connection_status,
    va.last_connection,
    va.data_usage_mb
FROM users u
JOIN vpn_access va ON u.id = va.user_id
WHERE va.status = 'active'
ORDER BY va.last_connection DESC;

-- Grant VPN access
INSERT INTO vpn_access (
    user_id, vpn_type, connection_limit, 
    data_limit_mb, expiry_date,
    granted_by, granted_at
) VALUES (
    (SELECT id FROM users WHERE username = 'remote.worker'),
    'FortiGate',
    3,  -- concurrent connections
    10240,  -- 10GB monthly limit
    NOW() + INTERVAL '6 months',
    'admin',
    NOW()
);
```

### 3. Temporary Access Management

#### Temporary Account Creation
```sql
-- Create temporary account
INSERT INTO users (
    username, email, first_name, last_name,
    employee_id, department_id, status,
    account_type, expiry_date,
    created_by, created_at
) VALUES (
    'temp.contractor.001', 'contractor@external.com', 'John', 'Contractor',
    'TEMP001', 
    (SELECT id FROM departments WHERE name = 'External'),
    'active',
    'temporary',
    NOW() + INTERVAL '30 days',
    'admin',
    NOW()
);

-- Grant limited services access
INSERT INTO user_service_access (user_id, service_id, access_level, granted_by, granted_at, expiry_date)
SELECT 
    (SELECT id FROM users WHERE username = 'temp.contractor.001'),
    s.id,
    'user',
    'admin',
    NOW(),
    NOW() + INTERVAL '30 days'
FROM services s 
WHERE s.name IN ('Basic Network Access', 'Email System');
```

---

## System Monitoring

### 1. Performance Monitoring

#### Database Performance Queries
```sql
-- Database connection monitoring
SELECT 
    state,
    COUNT(*) as connection_count,
    AVG(EXTRACT(EPOCH FROM (now() - query_start))) as avg_duration_seconds
FROM pg_stat_activity 
WHERE state IS NOT NULL
GROUP BY state;

-- Top resource consuming queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Table size monitoring
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### Application Performance Monitoring
```bash
# Check application metrics
curl -s https://accounts.yourdomain.com/api/monitoring/metrics | jq '{
    active_users: .active_users,
    response_time_avg: .response_time_avg,
    memory_usage: .memory_usage,
    cpu_usage: .cpu_usage
}'

# Monitor log files for errors
tail -f /var/log/account-management/app.log | grep -E "(ERROR|CRITICAL|FATAL)"

# Check system resources
echo "CPU Usage:"; mpstat 1 1
echo "Memory Usage:"; free -h
echo "Disk Usage:"; df -h
echo "Network:"; iftop -t -s 10
```

### 2. Security Monitoring

#### Failed Login Attempts
```sql
-- Monitor failed login attempts
SELECT 
    username,
    ip_address,
    attempted_at,
    failure_reason,
    COUNT(*) OVER (PARTITION BY username, DATE(attempted_at)) as daily_failures
FROM audit_logs 
WHERE action = 'login_failed'
    AND attempted_at >= NOW() - INTERVAL '24 hours'
ORDER BY attempted_at DESC;

-- Suspicious activity detection
SELECT 
    u.username,
    al.action,
    al.ip_address,
    COUNT(*) as occurrence_count,
    MIN(al.performed_at) as first_occurrence,
    MAX(al.performed_at) as last_occurrence
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.performed_at >= NOW() - INTERVAL '1 hour'
GROUP BY u.username, al.action, al.ip_address
HAVING COUNT(*) > 10  -- More than 10 actions in 1 hour
ORDER BY occurrence_count DESC;
```

### 3. Automated Alerts

#### Create Alert Scripts
```bash
#!/bin/bash
# System alert script

# Check database connections
DB_CONNECTIONS=$(psql -U esm_app -d esm_platform -h localhost -t -c "
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';
")

if [ "$DB_CONNECTIONS" -gt 150 ]; then
    echo "ALERT: High database connection count: $DB_CONNECTIONS"
    # Send alert email or notification
fi

# Check failed logins
FAILED_LOGINS=$(psql -U esm_app -d esm_platform -h localhost -t -c "
SELECT COUNT(*) FROM audit_logs 
WHERE action = 'login_failed' 
    AND performed_at >= NOW() - INTERVAL '1 hour';
")

if [ "$FAILED_LOGINS" -gt 50 ]; then
    echo "ALERT: High failed login attempts: $FAILED_LOGINS in last hour"
    # Trigger security incident response
fi

# Check application response time
RESPONSE_TIME=$(curl -s -w "%{time_total}" https://accounts.yourdomain.com/api/health -o /dev/null)
if (( $(echo "$RESPONSE_TIME > 5.0" | bc -l) )); then
    echo "ALERT: Slow application response: ${RESPONSE_TIME}s"
fi
```

---

## Troubleshooting Procedures

### 1. Common Database Issues

#### Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connectivity
psql -U esm_app -d esm_platform -h localhost -c "SELECT 1;"

# Check connection limits
psql -U postgres -d esm_platform -c "
SELECT setting FROM pg_settings WHERE name = 'max_connections';
SELECT count(*) as active_connections FROM pg_stat_activity;
"

# Kill long-running queries
psql -U postgres -d esm_platform -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
    AND query_start < now() - interval '10 minutes'
    AND query NOT LIKE '%pg_stat_activity%';
"
```

#### Performance Issues
```sql
-- Find blocking queries
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

-- Analyze slow queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT u.username, COUNT(usa.service_id) 
FROM users u 
LEFT JOIN user_service_access usa ON u.id = usa.user_id 
GROUP BY u.id, u.username;
```

### 2. Application Issues

#### Service Startup Problems
```bash
# Check application logs
tail -n 100 /var/log/account-management/app.log

# Verify environment variables
env | grep -E "(DATABASE_URL|NODE_ENV|PORT|NEXTAUTH)"

# Test database connection from application
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('DB Error:', err);
    else console.log('DB Connected:', res.rows[0]);
    process.exit();
});
"

# Restart application services
docker-compose restart app
# OR
sudo systemctl restart account-management
```

#### Authentication Issues
```bash
# Check NextAuth configuration
grep -r "NEXTAUTH" .env*

# Verify JWT secrets
node -e "console.log('JWT Secret length:', process.env.JWT_SECRET?.length)"

# Test authentication endpoint
curl -X POST https://accounts.yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -v
```

### 3. User Access Issues

#### User Cannot Login
```sql
-- Check user account status
SELECT 
    username, status, last_login, failed_login_attempts,
    locked_until, password_last_changed
FROM users 
WHERE username = 'problem.user';

-- Check recent login attempts
SELECT * FROM audit_logs 
WHERE user_id = (SELECT id FROM users WHERE username = 'problem.user')
    AND action LIKE '%login%'
ORDER BY performed_at DESC 
LIMIT 10;

-- Reset user login issues
UPDATE users SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW(),
    updated_by = 'admin'
WHERE username = 'problem.user';
```

#### Service Access Problems
```sql
-- Check user service permissions
SELECT 
    u.username,
    s.name as service,
    usa.access_level,
    usa.granted_at,
    usa.expiry_date,
    usa.status
FROM users u
JOIN user_service_access usa ON u.id = usa.user_id
JOIN services s ON usa.service_id = s.id
WHERE u.username = 'problem.user'
ORDER BY s.name;

-- Grant emergency access
INSERT INTO user_service_access (
    user_id, service_id, access_level, 
    granted_by, granted_at, emergency_grant
) VALUES (
    (SELECT id FROM users WHERE username = 'emergency.user'),
    (SELECT id FROM services WHERE name = 'Critical Service'),
    'user',
    'emergency_admin',
    NOW(),
    true
);
```

---

## Maintenance Tasks

### 1. Daily Maintenance

```bash
#!/bin/bash
# Daily maintenance script

echo "=== Daily Maintenance $(date) ==="

# 1. Database maintenance
echo "Running database maintenance..."
psql -U esm_app -d esm_platform -c "VACUUM ANALYZE;"

# 2. Log rotation
echo "Rotating logs..."
logrotate /etc/logrotate.d/account-management

# 3. Clear temporary files
echo "Cleaning temporary files..."
find /tmp -name "account-mgmt-*" -mtime +1 -delete

# 4. Update service health status
echo "Updating service health checks..."
psql -U esm_app -d esm_platform -c "
UPDATE services SET 
    last_health_check = NOW(),
    health_status = 'checking'
WHERE status = 'active';
"

# 5. Expire old temporary accounts
echo "Expiring temporary accounts..."
psql -U esm_app -d esm_platform -c "
UPDATE users SET 
    status = 'expired',
    expired_at = NOW()
WHERE account_type = 'temporary' 
    AND expiry_date < NOW() 
    AND status = 'active';
"

echo "Daily maintenance complete."
```

### 2. Weekly Maintenance

```bash
#!/bin/bash
# Weekly maintenance script

echo "=== Weekly Maintenance $(date) ==="

# 1. Database optimization
echo "Optimizing database..."
psql -U esm_app -d esm_platform -c "
REINDEX DATABASE esm_platform;
ANALYZE;
"

# 2. Security audit
echo "Running security audit..."
psql -U esm_app -d esm_platform -c "
-- Users with excessive privileges
SELECT u.username, COUNT(usa.service_id) as service_count
FROM users u
JOIN user_service_access usa ON u.id = usa.user_id
WHERE usa.access_level IN ('admin', 'super_admin')
GROUP BY u.username
HAVING COUNT(usa.service_id) > 10;
"

# 3. Performance analysis
echo "Analyzing performance..."
psql -U esm_app -d esm_platform -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# 4. Backup verification
echo "Verifying backups..."
ls -la /backups/account-management-*.sql | tail -7

echo "Weekly maintenance complete."
```

### 3. Monthly Maintenance

```bash
#!/bin/bash
# Monthly maintenance script

echo "=== Monthly Maintenance $(date) ==="

# 1. User access review
echo "Generating user access review report..."
psql -U esm_app -d esm_platform -c "
COPY (
    SELECT 
        u.username,
        u.email,
        d.name as department,
        STRING_AGG(s.name, ', ') as services
    FROM users u
    JOIN departments d ON u.department_id = d.id
    LEFT JOIN user_service_access usa ON u.id = usa.user_id
    LEFT JOIN services s ON usa.service_id = s.id
    WHERE u.status = 'active' AND usa.access_level != 'none'
    GROUP BY u.username, u.email, d.name
    ORDER BY u.username
) TO '/tmp/monthly-access-review.csv' WITH CSV HEADER;
"

# 2. Inactive user cleanup
echo "Identifying inactive users..."
psql -U esm_app -d esm_platform -c "
SELECT 
    username,
    email,
    last_login,
    status
FROM users 
WHERE last_login < NOW() - INTERVAL '60 days'
    AND status = 'active'
ORDER BY last_login;
"

# 3. Audit log cleanup
echo "Archiving old audit logs..."
psql -U esm_app -d esm_platform -c "
CREATE TABLE IF NOT EXISTS audit_logs_archive (LIKE audit_logs);
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs 
WHERE performed_at < NOW() - INTERVAL '6 months';
DELETE FROM audit_logs 
WHERE performed_at < NOW() - INTERVAL '6 months';
"

echo "Monthly maintenance complete."
```

---

## Emergency Procedures

### 1. System Emergency Response

#### Database Emergency
```bash
#!/bin/bash
# Database emergency response

echo "=== DATABASE EMERGENCY RESPONSE ==="

# 1. Immediate backup
echo "Creating emergency backup..."
pg_dump -U postgres -h localhost esm_platform > "/tmp/emergency-backup-$(date +%Y%m%d-%H%M%S).sql"

# 2. Kill all connections except emergency
psql -U postgres -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'esm_platform' 
    AND usename != 'postgres'
    AND application_name != 'emergency_admin';
"

# 3. Check database integrity
psql -U postgres -d esm_platform -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables;
"

# 4. Enable emergency access only
psql -U esm_app -d esm_platform -c "
UPDATE users SET status = 'emergency_only' 
WHERE username NOT IN ('admin', 'emergency_admin');
"

echo "Database secured in emergency mode"
```

#### Application Emergency
```bash
#!/bin/bash
# Application emergency response

echo "=== APPLICATION EMERGENCY RESPONSE ==="

# 1. Stop all services except essential
docker-compose stop app nginx redis
# Keep database running

# 2. Enable maintenance mode
echo "System under emergency maintenance" > /var/www/html/maintenance.html

# 3. Capture current state
docker-compose logs > "/tmp/emergency-logs-$(date +%Y%m%d-%H%M%S).log"

# 4. Start in safe mode
docker-compose up -d db
# Start application with minimal services

echo "Application in emergency safe mode"
```

### 2. Security Incident Response

```bash
#!/bin/bash
# Security incident response

echo "=== SECURITY INCIDENT RESPONSE ==="

# 1. Log the incident
echo "$(date): Security incident detected" >> /var/log/security-incidents.log

# 2. Disable all user accounts except admins
psql -U esm_app -d esm_platform -c "
UPDATE users SET 
    status = 'security_hold',
    updated_at = NOW(),
    updated_by = 'security_incident_response'
WHERE status = 'active' 
    AND username NOT IN ('admin', 'security_admin', 'super_admin');
"

# 3. Revoke all active sessions
# Clear Redis session store
redis-cli FLUSHDB

# 4. Enable audit mode
psql -U esm_app -d esm_platform -c "
INSERT INTO audit_logs (
    action, details, performed_by, performed_at, severity
) VALUES (
    'security_lockdown',
    'Emergency security lockdown activated',
    'security_incident_response',
    NOW(),
    'critical'
);
"

# 5. Notify security team
echo "Security incident lockdown completed. All non-admin accounts disabled."
```

### 3. Data Recovery Procedures

```bash
#!/bin/bash
# Data recovery procedures

echo "=== DATA RECOVERY PROCEDURES ==="

# 1. Assess data corruption
psql -U postgres -d esm_platform -c "
SELECT 
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > n_live_tup * 0.1;  -- More than 10% dead tuples
"

# 2. Find latest good backup
ls -la /backups/ | grep "esm_platform" | tail -5

# 3. Test backup integrity
LATEST_BACKUP=$(ls -t /backups/esm_platform-*.sql | head -1)
echo "Testing backup: $LATEST_BACKUP"
psql -U postgres -d template1 -c "CREATE DATABASE recovery_test;"
psql -U postgres -d recovery_test < "$LATEST_BACKUP"

# 4. Verify critical data
psql -U postgres -d recovery_test -c "
SELECT 
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM services) as service_count,
    (SELECT COUNT(*) FROM user_service_access) as access_count;
"

# 5. If verification passes, restore to production
# CAUTION: This will overwrite current data
read -p "Restore backup to production? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    echo "Restoring production database..."
    psql -U postgres -d esm_platform < "$LATEST_BACKUP"
    echo "Database restored from backup"
fi
```

---

## Administrative Workflows

### 1. New Employee Onboarding

```bash
#!/bin/bash
# New employee onboarding workflow

read -p "Employee Username: " username
read -p "Employee Email: " email
read -p "First Name: " first_name
read -p "Last Name: " last_name
read -p "Employee ID: " employee_id
read -p "Department: " department
read -p "Manager Username: " manager

echo "Creating new employee account for $first_name $last_name..."

psql -U esm_app -d esm_platform -c "
-- Create user account
INSERT INTO users (
    username, email, first_name, last_name,
    employee_id, department_id, manager_id,
    status, account_type, created_by, created_at
) VALUES (
    '$username', '$email', '$first_name', '$last_name',
    '$employee_id',
    (SELECT id FROM departments WHERE name = '$department'),
    (SELECT id FROM users WHERE username = '$manager'),
    'active', 'employee', 'hr_admin', NOW()
);

-- Grant default department access
INSERT INTO user_service_access (user_id, service_id, access_level, granted_by, granted_at)
SELECT 
    (SELECT id FROM users WHERE username = '$username'),
    s.id,
    'user',
    'hr_admin',
    NOW()
FROM services s
JOIN department_default_services dds ON s.id = dds.service_id
WHERE dds.department_id = (SELECT id FROM departments WHERE name = '$department');

-- Log onboarding
INSERT INTO audit_logs (
    user_id, action, details, performed_by, performed_at
) VALUES (
    (SELECT id FROM users WHERE username = '$username'),
    'user_onboarding',
    'New employee onboarding completed',
    'hr_admin',
    NOW()
);
"

echo "Employee onboarding completed for $username"
```

### 2. Employee Offboarding

```bash
#!/bin/bash
# Employee offboarding workflow

read -p "Employee Username to offboard: " username
read -p "Last working day (YYYY-MM-DD): " last_day
read -p "Offboarding reason: " reason

echo "Starting offboarding process for $username..."

psql -U esm_app -d esm_platform -c "
BEGIN;

-- Update user status
UPDATE users SET 
    status = 'offboarding',
    last_working_day = '$last_day',
    offboarding_reason = '$reason',
    updated_at = NOW(),
    updated_by = 'hr_admin'
WHERE username = '$username';

-- Schedule access revocation for last working day
INSERT INTO scheduled_tasks (
    task_type, target_user_id, scheduled_for, 
    task_details, created_by, created_at
) VALUES (
    'revoke_all_access',
    (SELECT id FROM users WHERE username = '$username'),
    '$last_day 23:59:59',
    'Automatic access revocation on last working day',
    'hr_admin',
    NOW()
);

-- Log offboarding start
INSERT INTO audit_logs (
    user_id, action, details, performed_by, performed_at
) VALUES (
    (SELECT id FROM users WHERE username = '$username'),
    'offboarding_started',
    'Employee offboarding process initiated. Last day: $last_day',
    'hr_admin',
    NOW()
);

COMMIT;
"

echo "Offboarding process started for $username. Access will be revoked on $last_day"
```

### 3. Service Access Request Workflow

```bash
#!/bin/bash
# Service access request workflow

read -p "Username requesting access: " username
read -p "Service name: " service
read -p "Access level (user/admin): " access_level
read -p "Business justification: " justification
read -p "Approval duration (days): " duration

echo "Processing access request..."

psql -U esm_app -d esm_platform -c "
-- Create access request
INSERT INTO access_requests (
    user_id, service_id, requested_access_level,
    business_justification, duration_days,
    status, requested_by, requested_at
) VALUES (
    (SELECT id FROM users WHERE username = '$username'),
    (SELECT id FROM services WHERE name = '$service'),
    '$access_level',
    '$justification',
    $duration,
    'pending_approval',
    'service_admin',
    NOW()
);

-- Notify manager for approval
INSERT INTO notifications (
    recipient_user_id, message_type, title, message,
    created_at, expires_at
) VALUES (
    (SELECT manager_id FROM users WHERE username = '$username'),
    'access_request_approval',
    'Service Access Request Requires Approval',
    'User $username has requested $access_level access to $service. Justification: $justification',
    NOW(),
    NOW() + INTERVAL '7 days'
);
"

echo "Access request submitted for approval"
```

---

*Last Updated: 2025-08-22*  
*Document Version: 1.0*  
*Next Review Date: 2025-09-22*