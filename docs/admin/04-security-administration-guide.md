# Security Administration Guide
*Account Management Platform - Security Policies, Role Management & Audit Procedures*

## Table of Contents
1. [Security Overview](#security-overview)
2. [Access Control & Role Management](#access-control--role-management)
3. [Authentication & Authorization](#authentication--authorization)
4. [Security Policies](#security-policies)
5. [Audit & Compliance](#audit--compliance)
6. [Incident Response](#incident-response)
7. [Data Protection](#data-protection)
8. [Security Monitoring](#security-monitoring)
9. [Vulnerability Management](#vulnerability-management)
10. [Security Best Practices](#security-best-practices)

---

## Security Overview

The Account Management Platform implements enterprise-grade security controls to protect 245+ employee accounts and access to 16 critical IT services. This guide covers all security administration procedures and policies.

### Security Architecture
- **Multi-layered Security:** Defense in depth approach
- **Zero Trust Model:** Verify every access request
- **Role-Based Access Control (RBAC):** Granular permissions
- **Audit Logging:** Complete trail of all activities
- **Data Encryption:** At rest and in transit
- **Compliance:** GDPR, SOX, and industry standards

### Security Credentials Reference
```bash
# Database Administrative Access
POSTGRES_ADMIN_USER=postgres
POSTGRES_ADMIN_PASSWORD=Ajay2628

# Application Database Access
POSTGRES_APP_USER=esm_app
POSTGRES_APP_PASSWORD=1qazxsw2

# Emergency Access Accounts
EMERGENCY_ADMIN_USER=emergency_admin
SECURITY_ADMIN_USER=security_admin
```

---

## Access Control & Role Management

### 1. Role Hierarchy

#### System Roles
```sql
-- Role hierarchy in the system
CREATE TYPE user_role AS ENUM (
    'super_admin',      -- Full system control
    'security_admin',   -- Security and audit management
    'system_admin',     -- System configuration and maintenance
    'department_admin', -- Department-specific administration
    'service_admin',    -- Service-specific administration
    'manager',          -- Team management and approvals
    'user',            -- Standard user access
    'guest',           -- Limited read-only access
    'contractor'        -- Temporary external access
);
```

#### Service Access Levels
```sql
-- Service-specific access levels
CREATE TYPE access_level AS ENUM (
    'none',            -- No access
    'read',            -- Read-only access
    'user',            -- Standard user operations
    'power_user',      -- Enhanced user privileges
    'admin',           -- Administrative access
    'super_admin'      -- Full administrative control
);
```

### 2. Role Assignment Procedures

#### Assign Super Administrator Role
```sql
-- Super Admin assignment (requires existing super admin approval)
BEGIN;

-- Log the role assignment request
INSERT INTO audit_logs (
    user_id, action, details, performed_by, performed_at, severity
) VALUES (
    (SELECT id FROM users WHERE username = 'new.super.admin'),
    'role_assignment_requested',
    'Super admin role requested for critical system management',
    'current_super_admin',
    NOW(),
    'critical'
);

-- Assign super admin role (requires dual approval)
UPDATE users SET 
    role = 'super_admin',
    role_assigned_by = 'current_super_admin',
    role_assigned_at = NOW(),
    role_approval_required = true,
    updated_at = NOW()
WHERE username = 'new.super.admin';

-- Require second approval
INSERT INTO pending_approvals (
    approval_type, target_user_id, requested_by, 
    approval_level, expires_at
) VALUES (
    'super_admin_role', 
    (SELECT id FROM users WHERE username = 'new.super.admin'),
    'current_super_admin',
    'dual_approval',
    NOW() + INTERVAL '24 hours'
);

COMMIT;
```

#### Department Administrator Assignment
```sql
-- Assign department administrator
UPDATE users SET 
    role = 'department_admin',
    department_admin_scope = (SELECT id FROM departments WHERE name = 'IT Support'),
    role_assigned_by = 'super_admin',
    role_assigned_at = NOW(),
    updated_at = NOW()
WHERE username = 'dept.admin.user';

-- Grant department management permissions
INSERT INTO user_permissions (user_id, permission, scope, granted_by, granted_at)
SELECT 
    (SELECT id FROM users WHERE username = 'dept.admin.user'),
    perm.permission,
    'department:' || (SELECT name FROM departments WHERE name = 'IT Support'),
    'super_admin',
    NOW()
FROM (VALUES 
    ('manage_department_users'),
    ('assign_service_access'),
    ('view_department_reports'),
    ('approve_access_requests')
) AS perm(permission);
```

### 3. Service Access Management

#### Grant Service Access
```sql
-- Grant service access with approval workflow
INSERT INTO access_requests (
    user_id, service_id, requested_access_level,
    business_justification, requested_by, 
    requires_approval, approval_level
) VALUES (
    (SELECT id FROM users WHERE username = 'requesting.user'),
    (SELECT id FROM services WHERE name = 'Grafana'),
    'admin',
    'Requires admin access for infrastructure monitoring dashboard management',
    'department_admin',
    true,
    'manager_approval'
);

-- Auto-approve standard user access for department members
INSERT INTO user_service_access (
    user_id, service_id, access_level, 
    granted_by, granted_at, auto_approved
)
SELECT 
    u.id,
    s.id,
    'user',
    'system_auto',
    NOW(),
    true
FROM users u
CROSS JOIN services s
JOIN departments d ON u.department_id = d.id
JOIN department_default_services dds ON d.id = dds.department_id AND s.id = dds.service_id
WHERE u.username = 'new.employee'
    AND s.requires_manual_approval = false;
```

#### Revoke Service Access
```sql
-- Emergency access revocation
UPDATE user_service_access SET 
    access_level = 'none',
    revoked_at = NOW(),
    revoked_by = 'security_admin',
    revoke_reason = 'Security incident - immediate access suspension',
    emergency_revocation = true
WHERE user_id = (SELECT id FROM users WHERE username = 'compromised.user')
    AND access_level != 'none';

-- Log emergency revocation
INSERT INTO audit_logs (
    user_id, action, details, performed_by, performed_at, severity
) VALUES (
    (SELECT id FROM users WHERE username = 'compromised.user'),
    'emergency_access_revocation',
    'All service access revoked due to security incident',
    'security_admin',
    NOW(),
    'critical'
);
```

### 4. Temporary Access Management

#### Create Temporary Access
```sql
-- Grant temporary elevated access
INSERT INTO temporary_access (
    user_id, service_id, access_level,
    granted_by, granted_at, expires_at,
    business_justification, approval_id
) VALUES (
    (SELECT id FROM users WHERE username = 'temp.access.user'),
    (SELECT id FROM services WHERE name = 'Production Database'),
    'admin',
    'system_admin',
    NOW(),
    NOW() + INTERVAL '4 hours',
    'Emergency database maintenance for critical issue resolution',
    'TEMP-2025-001'
);

-- Schedule automatic revocation
INSERT INTO scheduled_tasks (
    task_type, target_user_id, target_service_id,
    scheduled_for, task_details
) VALUES (
    'revoke_temporary_access',
    (SELECT id FROM users WHERE username = 'temp.access.user'),
    (SELECT id FROM services WHERE name = 'Production Database'),
    NOW() + INTERVAL '4 hours',
    'Automatic revocation of temporary admin access'
);
```

---

## Authentication & Authorization

### 1. Multi-Factor Authentication (MFA)

#### MFA Configuration
```sql
-- Enable MFA for user
UPDATE users SET 
    mfa_enabled = true,
    mfa_method = 'totp',
    mfa_secret = encode(gen_random_bytes(32), 'base64'),
    mfa_enabled_at = NOW(),
    mfa_enabled_by = 'security_admin'
WHERE username = 'user.requiring.mfa';

-- MFA requirements by role
UPDATE user_roles SET mfa_required = true 
WHERE role IN ('super_admin', 'security_admin', 'system_admin');

-- Service-specific MFA requirements
UPDATE services SET 
    requires_mfa = true,
    mfa_grace_period = INTERVAL '1 hour'
WHERE name IN (
    'Production Database', 'Administrative Panel', 
    'Security Console', 'Backup Systems'
);
```

#### MFA Verification Process
```javascript
// MFA verification workflow
async function verifyMFAToken(userId, token) {
    const user = await getUserById(userId);
    
    if (!user.mfa_enabled) {
        throw new Error('MFA not enabled for user');
    }
    
    // Verify TOTP token
    const isValid = authenticator.verify({
        token: token,
        secret: user.mfa_secret,
        window: 2 // Allow 2 time steps
    });
    
    if (isValid) {
        await logAuditEvent({
            userId: userId,
            action: 'mfa_verification_success',
            details: 'MFA token verified successfully',
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
        });
        
        return { success: true };
    } else {
        await logAuditEvent({
            userId: userId,
            action: 'mfa_verification_failed',
            details: 'Invalid MFA token provided',
            ipAddress: request.ip,
            severity: 'warning'
        });
        
        throw new Error('Invalid MFA token');
    }
}
```

### 2. Session Management

#### Secure Session Configuration
```javascript
// Session security settings
const sessionConfig = {
    name: 'account-mgmt-session',
    secret: process.env.SESSION_SECRET, // minimum 32 characters
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only
        httpOnly: true, // Prevent XSS
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        sameSite: 'strict' // CSRF protection
    },
    store: new RedisStore({
        client: redisClient,
        prefix: 'session:',
        ttl: 8 * 60 * 60 // 8 hours
    })
};

// Session cleanup for security incidents
async function revokeUserSessions(username, reason) {
    const user = await getUserByUsername(username);
    
    // Remove all Redis sessions for user
    const sessions = await redisClient.keys(`session:*`);
    for (const sessionKey of sessions) {
        const sessionData = await redisClient.get(sessionKey);
        if (sessionData && JSON.parse(sessionData).userId === user.id) {
            await redisClient.del(sessionKey);
        }
    }
    
    // Log session revocation
    await logAuditEvent({
        userId: user.id,
        action: 'sessions_revoked',
        details: `All sessions revoked. Reason: ${reason}`,
        performedBy: 'security_admin',
        severity: 'warning'
    });
}
```

### 3. Password Security

#### Password Policy Implementation
```sql
-- Password policy configuration
CREATE TABLE password_policies (
    id SERIAL PRIMARY KEY,
    policy_name VARCHAR(50) NOT NULL,
    min_length INTEGER DEFAULT 8,
    require_uppercase BOOLEAN DEFAULT true,
    require_lowercase BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    require_symbols BOOLEAN DEFAULT true,
    max_age_days INTEGER DEFAULT 90,
    history_count INTEGER DEFAULT 5,
    lockout_attempts INTEGER DEFAULT 5,
    lockout_duration INTERVAL DEFAULT '30 minutes',
    applies_to user_role[] DEFAULT ARRAY['user']
);

-- Insert security policies
INSERT INTO password_policies (
    policy_name, min_length, require_uppercase, require_lowercase,
    require_numbers, require_symbols, max_age_days, history_count,
    lockout_attempts, lockout_duration, applies_to
) VALUES 
(
    'admin_policy', 12, true, true, true, true, 60, 10, 3, '1 hour',
    ARRAY['super_admin', 'security_admin', 'system_admin']
),
(
    'standard_policy', 8, true, true, true, false, 90, 5, 5, '30 minutes',
    ARRAY['user', 'manager', 'department_admin']
),
(
    'contractor_policy', 10, true, true, true, true, 30, 3, 3, '2 hours',
    ARRAY['contractor', 'guest']
);
```

#### Password Validation
```javascript
// Password strength validation
function validatePassword(password, userRole) {
    const policy = getPasswordPolicy(userRole);
    const errors = [];
    
    if (password.length < policy.min_length) {
        errors.push(`Password must be at least ${policy.min_length} characters`);
    }
    
    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letters');
    }
    
    if (policy.require_lowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letters');
    }
    
    if (policy.require_numbers && !/\d/.test(password)) {
        errors.push('Password must contain numbers');
    }
    
    if (policy.require_symbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain special characters');
    }
    
    // Check against common passwords
    if (isCommonPassword(password)) {
        errors.push('Password is too common');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Secure password hashing
async function hashPassword(password) {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Log password change (without storing the password)
    await logAuditEvent({
        action: 'password_changed',
        details: 'User password updated',
        passwordStrength: calculatePasswordStrength(password)
    });
    
    return hash;
}
```

---

## Security Policies

### 1. Account Security Policies

#### Account Lockout Policy
```sql
-- Account lockout management
CREATE OR REPLACE FUNCTION handle_failed_login(p_username VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_user_id INTEGER;
    v_failed_attempts INTEGER;
    v_lockout_duration INTERVAL;
BEGIN
    -- Get user ID and current failed attempts
    SELECT id, failed_login_attempts INTO v_user_id, v_failed_attempts
    FROM users WHERE username = p_username;
    
    -- Increment failed attempts
    UPDATE users SET 
        failed_login_attempts = failed_login_attempts + 1,
        last_failed_login = NOW()
    WHERE id = v_user_id;
    
    -- Get lockout policy
    SELECT pp.lockout_duration INTO v_lockout_duration
    FROM users u
    JOIN password_policies pp ON u.role = ANY(pp.applies_to)
    WHERE u.id = v_user_id;
    
    -- Lock account if threshold exceeded
    IF v_failed_attempts + 1 >= (
        SELECT pp.lockout_attempts
        FROM users u
        JOIN password_policies pp ON u.role = ANY(pp.applies_to)
        WHERE u.id = v_user_id
    ) THEN
        UPDATE users SET 
            locked_until = NOW() + v_lockout_duration,
            status = 'locked'
        WHERE id = v_user_id;
        
        -- Log lockout event
        INSERT INTO audit_logs (
            user_id, action, details, performed_at, severity
        ) VALUES (
            v_user_id, 'account_locked',
            'Account locked due to excessive failed login attempts',
            NOW(), 'warning'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

#### Password Expiry Management
```sql
-- Password expiry enforcement
CREATE OR REPLACE FUNCTION check_password_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if password has expired
    IF NEW.password_last_changed + (
        SELECT (pp.max_age_days || ' days')::INTERVAL
        FROM password_policies pp
        WHERE NEW.role = ANY(pp.applies_to)
    ) < NOW() THEN
        NEW.password_expired = true;
        NEW.status = 'password_expired';
        
        -- Log password expiry
        INSERT INTO audit_logs (
            user_id, action, details, performed_at, severity
        ) VALUES (
            NEW.id, 'password_expired',
            'User password has expired and requires reset',
            NOW(), 'warning'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER password_expiry_check
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_password_expiry();
```

### 2. Data Access Policies

#### Data Classification
```sql
-- Data classification levels
CREATE TYPE data_classification AS ENUM (
    'public',       -- Publicly available information
    'internal',     -- Internal company information
    'confidential', -- Sensitive business information
    'restricted',   -- Highly sensitive information
    'secret'        -- Top secret information
);

-- Apply classification to tables
ALTER TABLE users ADD COLUMN data_classification data_classification DEFAULT 'confidential';
ALTER TABLE user_service_access ADD COLUMN data_classification data_classification DEFAULT 'restricted';
ALTER TABLE audit_logs ADD COLUMN data_classification data_classification DEFAULT 'restricted';
ALTER TABLE vpn_access ADD COLUMN data_classification data_classification DEFAULT 'confidential';

-- Row-level security for sensitive data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for department administrators
CREATE POLICY dept_admin_users_policy ON users
    FOR ALL TO dept_admin_role
    USING (department_id = current_setting('app.user_department_id')::INTEGER);

-- Policy for security administrators
CREATE POLICY security_admin_full_access ON users
    FOR ALL TO security_admin_role
    USING (true);
```

#### Data Retention Policies
```sql
-- Data retention configuration
CREATE TABLE data_retention_policies (
    table_name VARCHAR(50) PRIMARY KEY,
    retention_period INTERVAL NOT NULL,
    archive_before_delete BOOLEAN DEFAULT true,
    archive_table_name VARCHAR(50),
    deletion_schedule CRON DEFAULT '0 2 * * 0' -- Weekly at 2 AM
);

-- Insert retention policies
INSERT INTO data_retention_policies VALUES
('audit_logs', '7 years', true, 'audit_logs_archive', '0 2 * * 0'),
('user_sessions', '30 days', false, null, '0 3 * * *'),
('login_attempts', '1 year', true, 'login_attempts_archive', '0 2 1 * *'),
('temporary_access', '90 days', true, 'temporary_access_archive', '0 2 * * 0');

-- Automated retention enforcement
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS VOID AS $$
DECLARE
    policy_record RECORD;
    archive_sql TEXT;
    delete_sql TEXT;
BEGIN
    FOR policy_record IN SELECT * FROM data_retention_policies LOOP
        -- Archive old data if required
        IF policy_record.archive_before_delete THEN
            archive_sql := format(
                'INSERT INTO %I SELECT * FROM %I WHERE created_at < NOW() - %L',
                policy_record.archive_table_name,
                policy_record.table_name,
                policy_record.retention_period
            );
            EXECUTE archive_sql;
        END IF;
        
        -- Delete old data
        delete_sql := format(
            'DELETE FROM %I WHERE created_at < NOW() - %L',
            policy_record.table_name,
            policy_record.retention_period
        );
        EXECUTE delete_sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## Audit & Compliance

### 1. Comprehensive Audit Logging

#### Audit Event Types
```sql
-- Audit event classification
CREATE TYPE audit_event_type AS ENUM (
    'authentication',    -- Login/logout events
    'authorization',     -- Permission checks and changes
    'data_access',      -- Data read/write operations
    'configuration',    -- System configuration changes
    'user_management',  -- User account operations
    'service_access',   -- Service access operations
    'security_event',   -- Security-related events
    'system_event',     -- System operations
    'compliance_event'  -- Compliance-related events
);

-- Enhanced audit log structure
CREATE TABLE enhanced_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID DEFAULT gen_random_uuid(),
    event_type audit_event_type NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    user_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    compliance_flags TEXT[],
    retention_until TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_performed_at ON enhanced_audit_logs (performed_at);
CREATE INDEX idx_audit_logs_user_id ON enhanced_audit_logs (user_id);
CREATE INDEX idx_audit_logs_event_type ON enhanced_audit_logs (event_type);
CREATE INDEX idx_audit_logs_severity ON enhanced_audit_logs (severity);
CREATE INDEX idx_audit_logs_compliance ON enhanced_audit_logs USING GIN (compliance_flags);
```

#### Audit Event Triggers
```sql
-- Trigger for user changes
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO enhanced_audit_logs (
        event_type, severity, user_id, action, details,
        performed_by, compliance_flags
    ) VALUES (
        'user_management',
        CASE 
            WHEN TG_OP = 'DELETE' THEN 'warning'
            WHEN NEW.status != OLD.status THEN 'warning'
            ELSE 'info'
        END,
        COALESCE(NEW.id, OLD.id),
        TG_OP || '_user',
        jsonb_build_object(
            'old_values', row_to_json(OLD),
            'new_values', row_to_json(NEW),
            'changed_fields', (
                SELECT array_agg(key)
                FROM jsonb_each(to_jsonb(NEW)) 
                WHERE value != coalesce(to_jsonb(OLD)->key, 'null')
            )
        ),
        current_setting('app.current_user', true),
        ARRAY['GDPR', 'SOX']
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_user_changes();
```

### 2. Compliance Reporting

#### GDPR Compliance Report
```sql
-- GDPR data subject access report
CREATE OR REPLACE FUNCTION generate_gdpr_report(p_user_email VARCHAR)
RETURNS TABLE (
    data_category VARCHAR,
    table_name VARCHAR,
    data_count BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE,
    retention_period INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    -- Personal data in users table
    SELECT 
        'Personal Information' as data_category,
        'users' as table_name,
        COUNT(*) as data_count,
        MAX(updated_at) as last_updated,
        '7 years'::INTERVAL as retention_period
    FROM users 
    WHERE email = p_user_email
    
    UNION ALL
    
    -- Access logs
    SELECT 
        'Access Logs' as data_category,
        'enhanced_audit_logs' as table_name,
        COUNT(*) as data_count,
        MAX(performed_at) as last_updated,
        '7 years'::INTERVAL as retention_period
    FROM enhanced_audit_logs eal
    JOIN users u ON eal.user_id = u.id
    WHERE u.email = p_user_email
    
    UNION ALL
    
    -- Service access records
    SELECT 
        'Service Access' as data_category,
        'user_service_access' as table_name,
        COUNT(*) as data_count,
        MAX(updated_at) as last_updated,
        '7 years'::INTERVAL as retention_period
    FROM user_service_access usa
    JOIN users u ON usa.user_id = u.id
    WHERE u.email = p_user_email;
END;
$$ LANGUAGE plpgsql;
```

#### SOX Compliance Monitoring
```sql
-- SOX compliance access controls monitoring
CREATE OR REPLACE VIEW sox_compliance_view AS
SELECT 
    u.username,
    u.role,
    s.name as service_name,
    usa.access_level,
    usa.granted_at,
    usa.granted_by,
    usa.last_used,
    CASE 
        WHEN s.sox_critical = true AND usa.access_level IN ('admin', 'super_admin') 
        THEN 'HIGH_RISK'
        WHEN s.sox_critical = true 
        THEN 'MEDIUM_RISK'
        ELSE 'LOW_RISK'
    END as sox_risk_level,
    CASE 
        WHEN usa.last_used < NOW() - INTERVAL '90 days' 
        THEN 'UNUSED_ACCESS'
        WHEN usa.granted_at < NOW() - INTERVAL '1 year' AND usa.last_reviewed IS NULL
        THEN 'NEEDS_REVIEW'
        ELSE 'COMPLIANT'
    END as compliance_status
FROM users u
JOIN user_service_access usa ON u.id = usa.user_id
JOIN services s ON usa.service_id = s.id
WHERE usa.access_level != 'none'
ORDER BY sox_risk_level DESC, compliance_status;

-- Automated SOX compliance alerts
CREATE OR REPLACE FUNCTION check_sox_compliance()
RETURNS VOID AS $$
DECLARE
    violation_count INTEGER;
BEGIN
    -- Count high-risk violations
    SELECT COUNT(*) INTO violation_count
    FROM sox_compliance_view
    WHERE sox_risk_level = 'HIGH_RISK' 
        AND compliance_status != 'COMPLIANT';
    
    IF violation_count > 0 THEN
        INSERT INTO enhanced_audit_logs (
            event_type, severity, action, details, performed_by, compliance_flags
        ) VALUES (
            'compliance_event', 'critical', 'sox_violation_detected',
            jsonb_build_object(
                'violation_count', violation_count,
                'check_date', NOW()
            ),
            'compliance_monitor',
            ARRAY['SOX']
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 3. Regulatory Compliance

#### Data Subject Rights (GDPR)
```sql
-- Data portability (Right to data portability)
CREATE OR REPLACE FUNCTION export_user_data(p_user_email VARCHAR)
RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'personal_information', (
            SELECT row_to_json(u) 
            FROM users u 
            WHERE email = p_user_email
        ),
        'service_access', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'service_name', s.name,
                    'access_level', usa.access_level,
                    'granted_at', usa.granted_at,
                    'last_used', usa.last_used
                )
            )
            FROM user_service_access usa
            JOIN services s ON usa.service_id = s.id
            JOIN users u ON usa.user_id = u.id
            WHERE u.email = p_user_email
        ),
        'audit_trail', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'action', eal.action,
                    'performed_at', eal.performed_at,
                    'details', eal.details
                )
            )
            FROM enhanced_audit_logs eal
            JOIN users u ON eal.user_id = u.id
            WHERE u.email = p_user_email
                AND eal.performed_at >= NOW() - INTERVAL '2 years'
        )
    ) INTO user_data;
    
    -- Log data export
    INSERT INTO enhanced_audit_logs (
        event_type, severity, action, details, performed_by, compliance_flags
    ) VALUES (
        'compliance_event', 'info', 'data_export_gdpr',
        jsonb_build_object('exported_for', p_user_email),
        current_setting('app.current_user', true),
        ARRAY['GDPR']
    );
    
    RETURN user_data;
END;
$$ LANGUAGE plpgsql;

-- Right to erasure (Right to be forgotten)
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_email VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE email = p_user_email;
    
    -- Anonymize personal data
    UPDATE users SET 
        email = 'anonymized_' || v_user_id || '@anonymized.com',
        first_name = 'Anonymized',
        last_name = 'User',
        phone = NULL,
        address = NULL,
        employee_id = 'ANON_' || v_user_id,
        anonymized_at = NOW(),
        anonymized_by = current_setting('app.current_user', true)
    WHERE id = v_user_id;
    
    -- Keep audit trail but anonymize personal identifiers
    UPDATE enhanced_audit_logs SET 
        details = details || jsonb_build_object('anonymized', true)
    WHERE user_id = v_user_id;
    
    -- Log anonymization
    INSERT INTO enhanced_audit_logs (
        event_type, severity, action, details, performed_by, compliance_flags
    ) VALUES (
        'compliance_event', 'warning', 'user_data_anonymized',
        jsonb_build_object('original_email', p_user_email, 'user_id', v_user_id),
        current_setting('app.current_user', true),
        ARRAY['GDPR']
    );
END;
$$ LANGUAGE plpgsql;
```

---

## Incident Response

### 1. Security Incident Classification

#### Incident Severity Levels
```sql
-- Security incident classification
CREATE TYPE incident_severity AS ENUM (
    'low',          -- Minor security events
    'medium',       -- Moderate security concerns
    'high',         -- Serious security incidents
    'critical'      -- Critical security breaches
);

CREATE TYPE incident_status AS ENUM (
    'reported',     -- Initial report
    'investigating', -- Under investigation
    'contained',    -- Threat contained
    'resolved',     -- Fully resolved
    'closed'        -- Incident closed
);

-- Security incidents table
CREATE TABLE security_incidents (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity incident_severity NOT NULL,
    status incident_status DEFAULT 'reported',
    affected_users INTEGER[],
    affected_services INTEGER[],
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reported_by VARCHAR(100),
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    lessons_learned TEXT,
    related_audit_logs BIGINT[]
);
```

### 2. Automated Incident Detection

#### Suspicious Activity Detection
```sql
-- Automated threat detection
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS VOID AS $$
DECLARE
    suspicious_login RECORD;
    brute_force RECORD;
    privilege_escalation RECORD;
BEGIN
    -- Detect suspicious login patterns
    FOR suspicious_login IN
        SELECT 
            user_id,
            COUNT(*) as attempt_count,
            array_agg(DISTINCT ip_address) as ip_addresses
        FROM enhanced_audit_logs
        WHERE action = 'login_failed'
            AND performed_at >= NOW() - INTERVAL '1 hour'
        GROUP BY user_id
        HAVING COUNT(*) >= 10
    LOOP
        -- Create security incident
        INSERT INTO security_incidents (
            incident_id, title, description, severity,
            affected_users, detected_at, reported_by
        ) VALUES (
            'SEC-' || to_char(NOW(), 'YYYYMMDD') || '-' || nextval('incident_seq'),
            'Suspicious Login Activity Detected',
            'Multiple failed login attempts detected from user ' || suspicious_login.user_id,
            'medium',
            ARRAY[suspicious_login.user_id],
            NOW(),
            'automated_detection'
        );
    END LOOP;
    
    -- Detect privilege escalation attempts
    FOR privilege_escalation IN
        SELECT 
            user_id,
            COUNT(*) as escalation_attempts
        FROM enhanced_audit_logs
        WHERE action LIKE '%permission%'
            AND severity = 'warning'
            AND performed_at >= NOW() - INTERVAL '30 minutes'
        GROUP BY user_id
        HAVING COUNT(*) >= 5
    LOOP
        INSERT INTO security_incidents (
            incident_id, title, description, severity,
            affected_users, detected_at, reported_by
        ) VALUES (
            'SEC-' || to_char(NOW(), 'YYYYMMDD') || '-' || nextval('incident_seq'),
            'Privilege Escalation Attempt',
            'Multiple permission-related activities detected',
            'high',
            ARRAY[privilege_escalation.user_id],
            NOW(),
            'automated_detection'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 3. Incident Response Procedures

#### Emergency Account Lockdown
```bash
#!/bin/bash
# Emergency incident response script

INCIDENT_ID=$1
AFFECTED_USER=$2
LOCKDOWN_REASON=$3

echo "=== EMERGENCY INCIDENT RESPONSE ==="
echo "Incident ID: $INCIDENT_ID"
echo "Affected User: $AFFECTED_USER"
echo "Reason: $LOCKDOWN_REASON"

# 1. Immediately lock user account
psql -U esm_app -d esm_platform -c "
UPDATE users SET 
    status = 'security_locked',
    locked_until = NOW() + INTERVAL '24 hours',
    locked_reason = '$LOCKDOWN_REASON',
    locked_by = 'security_incident_response'
WHERE username = '$AFFECTED_USER';
"

# 2. Revoke all active sessions
psql -U esm_app -d esm_platform -c "
DELETE FROM user_sessions 
WHERE user_id = (SELECT id FROM users WHERE username = '$AFFECTED_USER');
"

# 3. Revoke all service access
psql -U esm_app -d esm_platform -c "
UPDATE user_service_access SET 
    access_level = 'none',
    revoked_at = NOW(),
    revoked_by = 'security_incident_response',
    revoke_reason = 'Security incident: $INCIDENT_ID'
WHERE user_id = (SELECT id FROM users WHERE username = '$AFFECTED_USER')
    AND access_level != 'none';
"

# 4. Create comprehensive audit log
psql -U esm_app -d esm_platform -c "
INSERT INTO enhanced_audit_logs (
    event_type, severity, user_id, action, details,
    performed_by, compliance_flags
) VALUES (
    'security_event', 'critical',
    (SELECT id FROM users WHERE username = '$AFFECTED_USER'),
    'emergency_lockdown',
    '{\"incident_id\": \"$INCIDENT_ID\", \"reason\": \"$LOCKDOWN_REASON\"}',
    'security_incident_response',
    ARRAY['SOX', 'INCIDENT_RESPONSE']
);
"

# 5. Update incident status
psql -U esm_app -d esm_platform -c "
UPDATE security_incidents SET 
    status = 'contained',
    resolution_notes = 'User account locked and access revoked'
WHERE incident_id = '$INCIDENT_ID';
"

echo "Emergency lockdown completed for user: $AFFECTED_USER"
```

#### Forensic Data Collection
```sql
-- Forensic data collection for incident investigation
CREATE OR REPLACE FUNCTION collect_forensic_data(
    p_incident_id VARCHAR,
    p_user_id INTEGER,
    p_time_range INTERVAL DEFAULT '24 hours'
)
RETURNS JSONB AS $$
DECLARE
    forensic_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'incident_id', p_incident_id,
        'collection_time', NOW(),
        'user_profile', (
            SELECT row_to_json(u) 
            FROM users u 
            WHERE id = p_user_id
        ),
        'recent_logins', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', performed_at,
                    'ip_address', ip_address,
                    'user_agent', user_agent,
                    'success', action = 'login_success'
                )
            )
            FROM enhanced_audit_logs
            WHERE user_id = p_user_id
                AND action LIKE '%login%'
                AND performed_at >= NOW() - p_time_range
            ORDER BY performed_at DESC
        ),
        'access_activities', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', performed_at,
                    'action', action,
                    'resource', resource_type,
                    'details', details,
                    'ip_address', ip_address
                )
            )
            FROM enhanced_audit_logs
            WHERE user_id = p_user_id
                AND performed_at >= NOW() - p_time_range
            ORDER BY performed_at DESC
        ),
        'permission_changes', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', updated_at,
                    'service', s.name,
                    'access_level', access_level,
                    'granted_by', granted_by
                )
            )
            FROM user_service_access usa
            JOIN services s ON usa.service_id = s.id
            WHERE usa.user_id = p_user_id
                AND usa.updated_at >= NOW() - p_time_range
        ),
        'system_events', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', performed_at,
                    'event_type', event_type,
                    'severity', severity,
                    'action', action,
                    'details', details
                )
            )
            FROM enhanced_audit_logs
            WHERE event_type = 'system_event'
                AND performed_at >= NOW() - p_time_range
                AND (user_id = p_user_id OR details->>'affected_user' = p_user_id::TEXT)
        )
    ) INTO forensic_data;
    
    -- Log forensic collection
    INSERT INTO enhanced_audit_logs (
        event_type, severity, action, details, performed_by, compliance_flags
    ) VALUES (
        'security_event', 'info', 'forensic_data_collected',
        jsonb_build_object('incident_id', p_incident_id, 'target_user', p_user_id),
        current_setting('app.current_user', true),
        ARRAY['INCIDENT_RESPONSE']
    );
    
    RETURN forensic_data;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Protection

### 1. Encryption Implementation

#### Database Encryption
```sql
-- Enable encryption for sensitive columns
ALTER TABLE users 
    ALTER COLUMN email TYPE TEXT USING pgp_sym_encrypt(email, 'encryption_key'),
    ALTER COLUMN phone TYPE TEXT USING pgp_sym_encrypt(phone, 'encryption_key'),
    ALTER COLUMN address TYPE TEXT USING pgp_sym_encrypt(address, 'encryption_key');

-- Create functions for encrypted data access
CREATE OR REPLACE FUNCTION decrypt_user_email(encrypted_email TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_email::BYTEA, current_setting('app.encryption_key'));
EXCEPTION
    WHEN OTHERS THEN
        RETURN '[ENCRYPTED]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row-level encryption for highly sensitive data
CREATE TABLE encrypted_sensitive_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data_type VARCHAR(50),
    encrypted_data BYTEA,
    encryption_algorithm VARCHAR(50) DEFAULT 'aes-256-gcm',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE
);
```

#### Application-Level Encryption
```javascript
// Encryption utility functions
const crypto = require('crypto');

class DataEncryption {
    constructor(encryptionKey) {
        this.algorithm = 'aes-256-gcm';
        this.key = Buffer.from(encryptionKey, 'hex');
    }
    
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    
    decrypt(encryptedData) {
        const decipher = crypto.createDecipher(
            this.algorithm, 
            this.key, 
            Buffer.from(encryptedData.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

// Usage example
const encryption = new DataEncryption(process.env.ENCRYPTION_KEY);

async function storeEncryptedData(userId, dataType, sensitiveData) {
    const encrypted = encryption.encrypt(sensitiveData);
    
    await query(`
        INSERT INTO encrypted_sensitive_data 
        (user_id, data_type, encrypted_data, encryption_algorithm)
        VALUES ($1, $2, $3, $4)
    `, [userId, dataType, JSON.stringify(encrypted), 'aes-256-gcm']);
    
    // Audit the encryption
    await logAuditEvent({
        eventType: 'data_access',
        severity: 'info',
        userId: userId,
        action: 'data_encrypted',
        details: { dataType: dataType },
        complianceFlags: ['GDPR', 'ENCRYPTION']
    });
}
```

### 2. Backup Security

#### Secure Backup Procedures
```bash
#!/bin/bash
# Secure backup script with encryption

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/secure/backups/account-management"
ENCRYPTION_KEY_FILE="/secure/keys/backup.key"
DATABASE_NAME="esm_platform"

echo "=== Starting Secure Backup Process ==="

# 1. Create encrypted database backup
echo "Creating encrypted database backup..."
pg_dump -U postgres -h localhost $DATABASE_NAME | \
    gpg --symmetric --cipher-algo AES256 --compress-algo 1 \
        --compress-level 9 --batch --quiet \
        --passphrase-file $ENCRYPTION_KEY_FILE \
        --output "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gpg"

# 2. Create encrypted application files backup
echo "Creating encrypted files backup..."
tar -czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs/*' \
    --exclude='tmp/*' \
    /opt/account-management | \
    gpg --symmetric --cipher-algo AES256 --compress-algo 1 \
        --compress-level 9 --batch --quiet \
        --passphrase-file $ENCRYPTION_KEY_FILE \
        --output "$BACKUP_DIR/files_backup_$BACKUP_DATE.tar.gz.gpg"

# 3. Create encrypted configuration backup
echo "Creating encrypted config backup..."
tar -czf - \
    /opt/account-management/.env.production \
    /opt/account-management/nginx/ \
    /opt/account-management/docker/ | \
    gpg --symmetric --cipher-algo AES256 \
        --batch --quiet \
        --passphrase-file $ENCRYPTION_KEY_FILE \
        --output "$BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz.gpg"

# 4. Generate backup manifest
echo "Generating backup manifest..."
cat > "$BACKUP_DIR/manifest_$BACKUP_DATE.json" << EOF
{
    "backup_date": "$BACKUP_DATE",
    "backup_type": "full_encrypted",
    "encryption_algorithm": "AES256",
    "files": {
        "database": "db_backup_$BACKUP_DATE.sql.gpg",
        "application": "files_backup_$BACKUP_DATE.tar.gz.gpg",
        "configuration": "config_backup_$BACKUP_DATE.tar.gz.gpg"
    },
    "checksums": {
        "database": "$(sha256sum $BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gpg | cut -d' ' -f1)",
        "application": "$(sha256sum $BACKUP_DIR/files_backup_$BACKUP_DATE.tar.gz.gpg | cut -d' ' -f1)",
        "configuration": "$(sha256sum $BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz.gpg | cut -d' ' -f1)"
    }
}
EOF

# 5. Log backup completion
psql -U esm_app -d esm_platform -c "
INSERT INTO enhanced_audit_logs (
    event_type, severity, action, details, performed_by, compliance_flags
) VALUES (
    'system_event', 'info', 'encrypted_backup_completed',
    '{\"backup_date\": \"$BACKUP_DATE\", \"backup_location\": \"$BACKUP_DIR\"}',
    'backup_system',
    ARRAY['DATA_PROTECTION']
);
"

echo "Secure backup completed: $BACKUP_DATE"
```

---

## Security Monitoring

### 1. Real-time Security Monitoring

#### Security Metrics Dashboard
```sql
-- Real-time security metrics view
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    -- Active threats
    (SELECT COUNT(*) 
     FROM security_incidents 
     WHERE status IN ('reported', 'investigating') 
       AND detected_at >= NOW() - INTERVAL '24 hours'
    ) as active_incidents,
    
    -- Failed login attempts (last hour)
    (SELECT COUNT(*) 
     FROM enhanced_audit_logs 
     WHERE action = 'login_failed' 
       AND performed_at >= NOW() - INTERVAL '1 hour'
    ) as failed_logins_hour,
    
    -- Locked accounts
    (SELECT COUNT(*) 
     FROM users 
     WHERE status = 'locked' 
       AND locked_until > NOW()
    ) as locked_accounts,
    
    -- Privilege escalations (last 24 hours)
    (SELECT COUNT(*) 
     FROM enhanced_audit_logs 
     WHERE action LIKE '%privilege%' 
       AND severity = 'warning'
       AND performed_at >= NOW() - INTERVAL '24 hours'
    ) as privilege_escalations,
    
    -- Suspicious IP addresses
    (SELECT COUNT(DISTINCT ip_address) 
     FROM enhanced_audit_logs 
     WHERE severity IN ('warning', 'error') 
       AND performed_at >= NOW() - INTERVAL '6 hours'
    ) as suspicious_ips,
    
    -- MFA bypass attempts
    (SELECT COUNT(*) 
     FROM enhanced_audit_logs 
     WHERE action = 'mfa_bypass_attempt' 
       AND performed_at >= NOW() - INTERVAL '24 hours'
    ) as mfa_bypass_attempts;
```

#### Automated Security Alerts
```javascript
// Security monitoring service
class SecurityMonitor {
    constructor() {
        this.alertThresholds = {
            failedLoginsPerHour: 50,
            privilegeEscalationsPerDay: 10,
            suspiciousIpsPerHour: 20,
            newIncidentsPerDay: 5
        };
    }
    
    async checkSecurityMetrics() {
        const metrics = await this.getSecurityMetrics();
        
        // Check failed login threshold
        if (metrics.failed_logins_hour > this.alertThresholds.failedLoginsPerHour) {
            await this.triggerAlert('HIGH_FAILED_LOGINS', {
                count: metrics.failed_logins_hour,
                threshold: this.alertThresholds.failedLoginsPerHour
            });
        }
        
        // Check privilege escalation attempts
        if (metrics.privilege_escalations > this.alertThresholds.privilegeEscalationsPerDay) {
            await this.triggerAlert('PRIVILEGE_ESCALATION_SPIKE', {
                count: metrics.privilege_escalations,
                threshold: this.alertThresholds.privilegeEscalationsPerDay
            });
        }
        
        // Check suspicious IP activity
        if (metrics.suspicious_ips > this.alertThresholds.suspiciousIpsPerHour) {
            await this.triggerAlert('SUSPICIOUS_IP_ACTIVITY', {
                count: metrics.suspicious_ips,
                threshold: this.alertThresholds.suspiciousIpsPerHour
            });
        }
    }
    
    async triggerAlert(alertType, details) {
        // Log security alert
        await logAuditEvent({
            eventType: 'security_event',
            severity: 'warning',
            action: 'security_alert_triggered',
            details: { alertType, ...details },
            performedBy: 'security_monitor',
            complianceFlags: ['SECURITY_MONITORING']
        });
        
        // Send notifications to security team
        await this.notifySecurityTeam(alertType, details);
        
        // If critical, trigger automatic response
        if (this.isCriticalAlert(alertType)) {
            await this.triggerAutomaticResponse(alertType, details);
        }
    }
    
    async triggerAutomaticResponse(alertType, details) {
        switch (alertType) {
            case 'HIGH_FAILED_LOGINS':
                // Temporarily increase rate limiting
                await this.increaseSecurity('rate_limiting');
                break;
                
            case 'PRIVILEGE_ESCALATION_SPIKE':
                // Require additional approval for privilege changes
                await this.enableEmergencyApproval();
                break;
                
            case 'SUSPICIOUS_IP_ACTIVITY':
                // Block suspicious IPs temporarily
                await this.implementTemporaryBlocks(details);
                break;
        }
    }
}
```

### 2. Network Security Monitoring

#### IP Address Monitoring
```sql
-- Suspicious IP tracking
CREATE TABLE ip_reputation (
    ip_address INET PRIMARY KEY,
    reputation_score INTEGER CHECK (reputation_score BETWEEN 0 AND 100),
    threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    blocked_until TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Automated IP reputation scoring
CREATE OR REPLACE FUNCTION update_ip_reputation(p_ip_address INET, p_success BOOLEAN)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ip_reputation (ip_address, reputation_score, threat_level)
    VALUES (p_ip_address, 50, 'low')
    ON CONFLICT (ip_address) DO UPDATE SET
        last_seen = NOW(),
        failure_count = CASE 
            WHEN p_success THEN ip_reputation.failure_count
            ELSE ip_reputation.failure_count + 1
        END,
        success_count = CASE 
            WHEN p_success THEN ip_reputation.success_count + 1
            ELSE ip_reputation.success_count
        END,
        reputation_score = GREATEST(0, LEAST(100,
            CASE 
                WHEN p_success THEN ip_reputation.reputation_score + 1
                ELSE ip_reputation.reputation_score - 5
            END
        )),
        threat_level = CASE 
            WHEN ip_reputation.failure_count > 20 THEN 'critical'
            WHEN ip_reputation.failure_count > 10 THEN 'high'
            WHEN ip_reputation.failure_count > 5 THEN 'medium'
            ELSE 'low'
        END;
        
    -- Auto-block high-threat IPs
    IF (SELECT threat_level FROM ip_reputation WHERE ip_address = p_ip_address) = 'critical' THEN
        UPDATE ip_reputation SET 
            blocked_until = NOW() + INTERVAL '24 hours'
        WHERE ip_address = p_ip_address;
        
        -- Log the block
        INSERT INTO enhanced_audit_logs (
            event_type, severity, action, details, performed_by
        ) VALUES (
            'security_event', 'warning', 'ip_auto_blocked',
            jsonb_build_object('ip_address', p_ip_address, 'reason', 'high_threat_score'),
            'security_monitor'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Vulnerability Management

### 1. Security Scanning

#### Database Security Assessment
```sql
-- Security configuration assessment
CREATE OR REPLACE FUNCTION assess_database_security()
RETURNS TABLE (
    check_name VARCHAR,
    status VARCHAR,
    severity VARCHAR,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check for default passwords
    SELECT 
        'Default Passwords' as check_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_user 
                WHERE usename = 'postgres' 
                    AND passwd = md5('postgres' || 'postgres')
            ) THEN 'FAIL'
            ELSE 'PASS'
        END as status,
        'HIGH' as severity,
        'Change default PostgreSQL passwords immediately' as recommendation
        
    UNION ALL
    
    -- Check SSL configuration
    SELECT 
        'SSL Configuration' as check_name,
        CASE 
            WHEN current_setting('ssl') = 'on' THEN 'PASS'
            ELSE 'FAIL'
        END as status,
        'HIGH' as severity,
        'Enable SSL for all database connections' as recommendation
        
    UNION ALL
    
    -- Check password encryption
    SELECT 
        'Password Encryption' as check_name,
        CASE 
            WHEN current_setting('password_encryption') = 'scram-sha-256' THEN 'PASS'
            ELSE 'WARN'
        END as status,
        'MEDIUM' as severity,
        'Use scram-sha-256 password encryption' as recommendation
        
    UNION ALL
    
    -- Check for unused accounts
    SELECT 
        'Unused Accounts' as check_name,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARN'
            ELSE 'PASS'
        END as status,
        'MEDIUM' as severity,
        'Review and disable unused database accounts' as recommendation
    FROM pg_user u
    LEFT JOIN pg_stat_activity a ON u.usename = a.usename
    WHERE a.usename IS NULL
        AND u.usename NOT IN ('postgres', 'template0', 'template1');
END;
$$ LANGUAGE plpgsql;
```

### 2. Dependency Scanning

#### Node.js Dependency Security Check
```bash
#!/bin/bash
# Security dependency scanning script

echo "=== Dependency Security Scan ==="

# 1. Run npm audit
echo "Running npm audit..."
npm audit --audit-level=moderate --json > audit-results.json

# 2. Check for high/critical vulnerabilities
HIGH_VULNS=$(cat audit-results.json | jq '.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical") | length')

if [ "$HIGH_VULNS" -gt 0 ]; then
    echo "WARNING: Found $HIGH_VULNS high/critical vulnerabilities"
    
    # Log security finding
    psql -U esm_app -d esm_platform -c "
    INSERT INTO enhanced_audit_logs (
        event_type, severity, action, details, performed_by
    ) VALUES (
        'security_event', 'warning', 'dependency_vulnerabilities_found',
        '{\"vulnerability_count\": $HIGH_VULNS, \"scan_date\": \"$(date -Iseconds)\"}',
        'security_scanner'
    );
    "
else
    echo "No high/critical vulnerabilities found"
fi

# 3. Generate security report
cat > security-scan-report.json << EOF
{
    "scan_date": "$(date -Iseconds)",
    "dependency_scan": {
        "tool": "npm audit",
        "high_critical_count": $HIGH_VULNS,
        "full_results_file": "audit-results.json"
    },
    "recommendations": [
        "Review audit-results.json for detailed vulnerability information",
        "Update vulnerable dependencies to secure versions",
        "Consider using npm audit fix for automatic fixes"
    ]
}
EOF

echo "Security scan completed. Report: security-scan-report.json"
```

---

## Security Best Practices

### 1. Secure Development Guidelines

#### Code Security Standards
```javascript
// Security code review checklist
const securityChecklist = {
    authentication: [
        'Strong password requirements implemented',
        'Multi-factor authentication available',
        'Session management secure',
        'Password hashing using bcrypt with appropriate rounds'
    ],
    
    authorization: [
        'Role-based access control implemented',
        'Principle of least privilege followed',
        'Resource-level authorization checks',
        'No hardcoded permissions in code'
    ],
    
    inputValidation: [
        'All user inputs validated and sanitized',
        'SQL injection prevention measures',
        'XSS protection implemented',
        'File upload restrictions in place'
    ],
    
    dataProtection: [
        'Sensitive data encrypted at rest',
        'Secure transmission (TLS/SSL)',
        'Personal data anonymization options',
        'Secure backup procedures'
    ],
    
    errorHandling: [
        'No sensitive information in error messages',
        'Proper error logging without data exposure',
        'Graceful failure handling',
        'No stack traces in production'
    ],
    
    logging: [
        'Security events logged appropriately',
        'Audit trail for critical operations',
        'Log tampering protection',
        'Compliance with retention policies'
    ]
};

// Secure configuration validation
function validateSecurityConfiguration() {
    const securityChecks = [];
    
    // Check environment variables
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        securityChecks.push('JWT_SECRET must be at least 32 characters');
    }
    
    if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
        securityChecks.push('NEXTAUTH_SECRET must be at least 32 characters');
    }
    
    // Check database connection security
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode=require')) {
        securityChecks.push('Database connection should require SSL');
    }
    
    // Check production settings
    if (process.env.NODE_ENV === 'production') {
        if (process.env.DEBUG === 'true') {
            securityChecks.push('Debug mode should be disabled in production');
        }
        
        if (!process.env.RATE_LIMITING_ENABLED || process.env.RATE_LIMITING_ENABLED !== 'true') {
            securityChecks.push('Rate limiting should be enabled in production');
        }
    }
    
    return securityChecks;
}
```

### 2. Operational Security

#### Security Maintenance Schedule
```bash
#!/bin/bash
# Security maintenance schedule

# Daily security tasks (run via cron: 0 6 * * *)
daily_security_tasks() {
    echo "=== Daily Security Tasks ==="
    
    # 1. Review security alerts
    psql -U esm_app -d esm_platform -c "
    SELECT severity, COUNT(*) as alert_count 
    FROM enhanced_audit_logs 
    WHERE event_type = 'security_event' 
        AND performed_at >= NOW() - INTERVAL '24 hours'
    GROUP BY severity;
    "
    
    # 2. Check for locked accounts
    psql -U esm_app -d esm_platform -c "
    SELECT username, locked_until, locked_reason 
    FROM users 
    WHERE status = 'locked' AND locked_until > NOW();
    "
    
    # 3. Monitor failed login attempts
    psql -U esm_app -d esm_platform -c "
    SELECT ip_address, COUNT(*) as attempts 
    FROM enhanced_audit_logs 
    WHERE action = 'login_failed' 
        AND performed_at >= NOW() - INTERVAL '24 hours'
    GROUP BY ip_address 
    HAVING COUNT(*) > 10 
    ORDER BY attempts DESC;
    "
}

# Weekly security tasks (run via cron: 0 6 * * 1)
weekly_security_tasks() {
    echo "=== Weekly Security Tasks ==="
    
    # 1. Password expiry check
    psql -U esm_app -d esm_platform -c "
    SELECT username, password_last_changed 
    FROM users 
    WHERE password_last_changed < NOW() - INTERVAL '75 days'
        AND status = 'active';
    "
    
    # 2. Unused account review
    psql -U esm_app -d esm_platform -c "
    SELECT username, last_login, status 
    FROM users 
    WHERE last_login < NOW() - INTERVAL '60 days'
        AND status = 'active';
    "
    
    # 3. Privilege review
    psql -U esm_app -d esm_platform -c "
    SELECT u.username, s.name, usa.access_level, usa.last_used
    FROM users u
    JOIN user_service_access usa ON u.id = usa.user_id
    JOIN services s ON usa.service_id = s.id
    WHERE usa.access_level IN ('admin', 'super_admin')
        AND (usa.last_used IS NULL OR usa.last_used < NOW() - INTERVAL '30 days');
    "
}

# Monthly security tasks (run via cron: 0 6 1 * *)
monthly_security_tasks() {
    echo "=== Monthly Security Tasks ==="
    
    # 1. Full security assessment
    psql -U esm_app -d esm_platform -c "SELECT * FROM assess_database_security();"
    
    # 2. Dependency security scan
    npm audit --audit-level=moderate
    
    # 3. Generate compliance report
    psql -U esm_app -d esm_platform -c "
    COPY (
        SELECT 
            'Monthly Security Report - ' || to_char(NOW(), 'YYYY-MM') as report_title,
            COUNT(*) FILTER (WHERE event_type = 'security_event') as security_events,
            COUNT(*) FILTER (WHERE action = 'login_failed') as failed_logins,
            COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'authentication') as active_users
        FROM enhanced_audit_logs 
        WHERE performed_at >= date_trunc('month', NOW())
    ) TO '/tmp/monthly-security-report.csv' WITH CSV HEADER;
    "
}

# Run appropriate task based on argument
case "$1" in
    daily)
        daily_security_tasks
        ;;
    weekly)
        weekly_security_tasks
        ;;
    monthly)
        monthly_security_tasks
        ;;
    *)
        echo "Usage: $0 {daily|weekly|monthly}"
        exit 1
        ;;
esac
```

---

*Last Updated: 2025-08-22*  
*Document Version: 1.0*  
*Next Review Date: 2025-09-22*