-- ESM Platform Database Schema
-- Based on spreadsheet analysis: 245 employees, 16 services, 18 departments
-- Date: 2025-08-20
-- Source: AccountManagementJune_20250606_v01.xlsx analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NextAuth.js required tables for authentication
CREATE TABLE accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE sessions (
  id SERIAL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create roles table for RBAC
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES 
    ('super_admin', 'Super Administrator', 'Full system access with all permissions', '{"system": "*", "users": "*", "services": "*", "audit": "*"}'),
    ('admin', 'Administrator', 'Administrative access to most features', '{"users": ["read", "create", "update"], "services": ["read", "create", "update"], "audit": ["read"]}'),
    ('manager', 'Manager', 'Management level access for department oversight', '{"users": ["read", "update"], "services": ["read"], "audit": ["read"]}'),
    ('user', 'User', 'Standard user with limited access', '{"users": ["read_own"], "services": ["read_own"]}'),
    ('guest', 'Guest', 'Read-only access to basic information', '{"users": ["read_limited"], "services": ["read_limited"]}');

-- User roles junction table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Departments table (18 departments identified from spreadsheet)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert your actual departments from spreadsheet analysis
INSERT INTO departments (name) VALUES 
    ('Secretariat'),
    ('Corporate & Social Responsibility Unit'),
    ('Cybersecurity'),
    ('eServices'),
    ('Infrastructure-Data Communication'),
    ('Cloud Service'),
    ('Data Centre'),
    ('Hinterland & Remote Connectivity'),
    ('Power & Environment'),
    ('Operations'),
    ('Project Management Unit'),
    ('Finance & Admin. Services'),
    ('Accounts'),
    ('Procurement'),
    ('Human Resources'),
    ('Temporary Staff'),
    ('LTE Grafana Unit'),
    ('eSight-SRV-2 Operations');

-- Services table (16 services identified from spreadsheet)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    auth_methods TEXT[] DEFAULT ARRAY['Local'],
    access_levels TEXT[] DEFAULT ARRAY['User', 'Admin'],
    account_types TEXT[] DEFAULT ARRAY['Local', 'Active Directory'],
    default_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
    active BOOLEAN DEFAULT true,
    api_endpoint VARCHAR(255),
    integration_type VARCHAR(50), -- 'manual', 'api', 'ldap'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert your actual services from spreadsheet analysis
INSERT INTO services (name, display_name, category, description, access_levels, account_types) VALUES 
    ('ipam', 'IPAM', 'Network', 'IP Address Management', ARRAY['Admin', 'User', 'Viewer'], ARRAY['Local', 'Active Directory']),
    ('grafana', 'Grafana', 'Monitoring', 'Monitoring Dashboards', ARRAY['Admin', 'Editor', 'Viewer'], ARRAY['Local', 'LDAP']),
    ('teleport', 'Teleport', 'Security', 'Secure Access Platform', ARRAY['Admin', 'User'], ARRAY['Local', 'SSO']),
    ('radius', 'RADIUS', 'Network', 'Network Authentication', ARRAY['Admin', 'User'], ARRAY['Local', 'Active Directory']),
    ('unifi', 'Unifi Network', 'Network', 'Network Management', ARRAY['Super Admin', 'Admin', 'Operator', 'Viewer'], ARRAY['Local']),
    ('zabbix', 'Zabbix', 'Monitoring', 'System Monitoring', ARRAY['Super admin', 'Admin', 'User', 'Guest'], ARRAY['Local', 'LDAP']),
    ('eightsight', 'Eight Sight', 'Analytics', 'Analytics Platform', ARRAY['Admin', 'User'], ARRAY['Local']),
    ('kibana', 'Kibana', 'Monitoring', 'Log Analytics', ARRAY['Admin', 'User', 'Viewer'], ARRAY['Local', 'LDAP']),
    ('itop', 'ITop', 'Management', 'IT Service Management', ARRAY['Admin', 'User', 'Portal user'], ARRAY['Local']),
    ('neteco', 'NetEco', 'Monitoring', 'Network Monitoring', ARRAY['Admin', 'Operator', 'Guest'], ARRAY['Local']),
    ('ivs_neteco', 'IVS NetEco', 'Monitoring', 'IVS Network Monitoring', ARRAY['Admin', 'Operator', 'Guest'], ARRAY['Local']),
    ('lte_grafana', 'LTE Grafana', 'Monitoring', 'LTE Network Monitoring', ARRAY['Admin', 'Editor', 'Viewer'], ARRAY['Local']),
    ('generator_grafana', 'Generator Grafana', 'Monitoring', 'Generator Monitoring', ARRAY['Admin', 'Editor', 'Viewer'], ARRAY['Local']),
    ('nce_fan_atp', 'NCE-FAN ATP', 'Security', 'Network Security Platform', ARRAY['Admin', 'Operator'], ARRAY['Local']),
    ('esight_srv2', 'eSight-SRV-2', 'Management', 'Network Management', ARRAY['Admin', 'Operator', 'Guest'], ARRAY['Local']),
    ('noc_services', 'NOC Services', 'Operations', 'Network Operations Center', ARRAY['Admin', 'Operator'], ARRAY['Local']);

-- Users table (245 employees from spreadsheet + authentication fields)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    employee_id VARCHAR(20) UNIQUE,
    serial_number INTEGER, -- From spreadsheet "Ser. No"
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    email_verified TIMESTAMPTZ,
    password_hash VARCHAR(255), -- For local authentication
    image VARCHAR(255), -- NextAuth.js field
    position VARCHAR(100), -- "CURRENT APPOINTMENT" from Employee Data sheet
    department_id INTEGER REFERENCES departments(id),
    employment_status VARCHAR(20) DEFAULT 'Active', -- Active/Dormant/On Leave
    employment_type VARCHAR(20) DEFAULT 'Permanent',
    security_clearance VARCHAR(20), -- Public/Internal/Confidential/Restricted/Top Secret
    hire_date DATE, -- "DATE EMPLOYED" from spreadsheet
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    avatar_url VARCHAR(255),
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User service access (replaces the 72 spreadsheet columns!)
CREATE TABLE user_service_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    has_access BOOLEAN DEFAULT false,
    account_type VARCHAR(50), -- Local/Active Directory/LDAP/SSO
    account_status VARCHAR(20) DEFAULT 'Inactive', -- Active/Inactive/Suspended
    access_level VARCHAR(50), -- Admin/User/Viewer/etc (service-specific)
    groups TEXT[] DEFAULT ARRAY[]::TEXT[], -- Service-specific groups
    username_in_service VARCHAR(100), -- Their username in that specific service
    granted_date TIMESTAMP DEFAULT NOW(),
    granted_by INTEGER REFERENCES users(id),
    expires_on TIMESTAMP,
    last_sync TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'manual', -- manual/synced/error
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

-- VPN access (separate table for detailed VPN tracking)
CREATE TABLE vpn_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vpn_type VARCHAR(20) NOT NULL, -- Mikrotik/FortiGate
    has_access BOOLEAN DEFAULT false,
    username VARCHAR(100), -- VPN username (may differ from system username)
    account_type VARCHAR(30),
    account_status VARCHAR(20) DEFAULT 'Inactive',
    groups TEXT[] DEFAULT ARRAY[]::TEXT[],
    ip_pool VARCHAR(50),
    allowed_networks TEXT[] DEFAULT ARRAY[]::TEXT[],
    max_sessions INTEGER DEFAULT 1,
    data_limit_gb INTEGER,
    time_limit_hours INTEGER,
    profile VARCHAR(100), -- VPN profile/template
    certificate_info TEXT,
    last_connection TIMESTAMP,
    total_data_used_gb DECIMAL(10,2) DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, vpn_type)
);

-- Biometric access (from Biometrics sheet)
CREATE TABLE biometric_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(100) DEFAULT 'Data Centre',
    has_access BOOLEAN DEFAULT false,
    registration_status VARCHAR(20) DEFAULT 'Not Registered', -- Registered/Not Registered
    fingerprint_enrolled BOOLEAN DEFAULT false,
    card_access BOOLEAN DEFAULT false,
    access_level VARCHAR(50),
    registered_date DATE,
    last_access TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail (comprehensive logging)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER REFERENCES users(id), -- The user being acted upon
    target_type VARCHAR(50) NOT NULL, -- 'user', 'service_access', 'vpn_access', etc
    target_id INTEGER, -- ID of the target record
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'access_granted', etc
    changes JSONB, -- Before/after values
    performed_by INTEGER REFERENCES users(id), -- Who made the change
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    severity VARCHAR(20) DEFAULT 'info', -- info/warning/error/critical
    category VARCHAR(50), -- access_control/user_management/system/security/auth
    description TEXT,
    performed_at TIMESTAMP DEFAULT NOW()
);

-- Security events table for authentication audit
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- login_success, login_failed, logout, password_change, etc
    ip_address INET,
    user_agent TEXT,
    location_country VARCHAR(5),
    location_city VARCHAR(100),
    device_fingerprint VARCHAR(255),
    session_id VARCHAR(255),
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    blocked BOOLEAN DEFAULT false,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Data operations log (for import/export tracking)
CREATE TABLE data_operations (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL, -- import/export/backup/migration
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running', -- running/completed/failed/cancelled
    error_details TEXT,
    started_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    backup_location VARCHAR(500), -- For rollback capability
    operation_details JSONB -- Flexible storage for operation-specific data
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_status ON users(employment_status);
CREATE INDEX idx_service_access_user ON user_service_access(user_id);
CREATE INDEX idx_service_access_service ON user_service_access(service_id);
CREATE INDEX idx_service_access_status ON user_service_access(account_status);
CREATE INDEX idx_vpn_user ON vpn_access(user_id);
CREATE INDEX idx_vpn_type ON vpn_access(vpn_type);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(performed_at);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- NextAuth.js indexes
CREATE UNIQUE INDEX accounts_provider_providerAccountId_key ON accounts(provider, "providerAccountId");
CREATE INDEX accounts_userId_idx ON accounts("userId");
CREATE INDEX sessions_userId_idx ON sessions("userId");
CREATE INDEX security_events_user_idx ON security_events(user_id);
CREATE INDEX security_events_type_idx ON security_events(event_type);
CREATE INDEX security_events_date_idx ON security_events(created_at);

-- Views for common queries
CREATE VIEW active_users AS
SELECT 
    u.*,
    d.name as department_name,
    COUNT(usa.id) as service_count,
    COUNT(va.id) as vpn_count
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN user_service_access usa ON u.id = usa.user_id AND usa.has_access = true
LEFT JOIN vpn_access va ON u.id = va.user_id AND va.has_access = true
WHERE u.active = true AND u.employment_status = 'Active'
GROUP BY u.id, d.name;

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_service_access_timestamp
    BEFORE UPDATE ON user_service_access
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_roles_timestamp
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Foreign key constraints for NextAuth.js tables
ALTER TABLE accounts ADD CONSTRAINT fk_accounts_userId FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_userId FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;