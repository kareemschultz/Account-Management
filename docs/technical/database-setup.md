# Database Setup Guide - ESM Platform

## Overview

This guide walks you through setting up the PostgreSQL database for the ESM Platform, including schema creation and data migration from your existing spreadsheets.

## Prerequisites

- PostgreSQL 12+ installed and running
- Administrative access to create databases and users
- Access to your current Excel spreadsheet files
- Node.js and npm installed

## Quick Start

```bash
# 1. Install PostgreSQL (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql postgresql-contrib

# 2. Create database and user
sudo -u postgres psql
CREATE DATABASE esm_platform;
CREATE USER esm_user WITH ENCRYPTED PASSWORD 'Ajay2628';
-- Alternative password option: '1qazxsw2'
GRANT ALL PRIVILEGES ON DATABASE esm_platform TO esm_user;
\q

# 3. Run database schema
psql -h localhost -U esm_user -d esm_platform -f database/schema.sql

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# 5. Test connection
npm run test-db
```

## Detailed Setup Instructions

### 1. PostgreSQL Installation

#### Windows Installation
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Remember the password you set for the `postgres` user
4. Default port 5432 is recommended

#### Linux Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### macOS Installation
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### 2. Database Creation

Connect to PostgreSQL as superuser:
```bash
# Method 1: Direct command
sudo -u postgres psql

# Method 2: With password prompt
psql -h localhost -U postgres
```

Create the database and user:
```sql
-- Create database
CREATE DATABASE esm_platform;

-- Create user with secure password
CREATE USER esm_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE esm_platform TO esm_user;

-- Connect to the new database
\c esm_platform

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO esm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO esm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO esm_user;

-- Exit
\q
```

### 3. Schema Installation

Run the database schema to create all tables:

```bash
# From the project root directory
psql -h localhost -U esm_user -d esm_platform -f database/schema.sql
```

This creates the following tables:
- `departments` - Your 18 organizational departments
- `services` - Your 16 IT services (IPAM, Grafana, etc.)
- `users` - Employee information (245+ users)
- `user_service_access` - Service permissions (replaces spreadsheet columns)
- `vpn_access` - VPN access for Mikrotik/FortiGate
- `biometric_access` - Data center physical access
- `audit_logs` - Complete audit trail
- `data_operations` - Import/export tracking

### 4. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:
```bash
# Database Configuration
DATABASE_URL="postgresql://esm_user:your_secure_password@localhost:5432/esm_platform"

# Alternative format
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esm_platform
DB_USER=esm_user
DB_PASSWORD=your_secure_password

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
```

### 5. Verify Installation

Test the database connection:
```bash
# Test basic connectivity
npm run test-db

# Or manually test
psql -h localhost -U esm_user -d esm_platform -c "SELECT version();"
```

Expected output should show PostgreSQL version information.

## Data Migration from Spreadsheets

### Migration Overview

The migration process converts your Excel spreadsheets into normalized database tables:

- **From**: 72+ columns per user in Excel
- **To**: Normalized tables with relationships
- **Benefits**: Eliminates data duplication, enables complex queries, provides audit trails

### Migration Steps

#### 1. Prepare Spreadsheet Files

Place your Excel files in the project root:
- `AccountManagementJune_20250606_v01.xlsx` (latest data)
- `AccountManagementMarch_20250506_v01.xlsx` (historical reference)

#### 2. Run Migration Analysis

```bash
# Analyze spreadsheet structure
npm run analyze-spreadsheet

# Generate migration report
npm run migration-report
```

#### 3. Validate Data

```bash
# Check for data inconsistencies
npm run validate-migration

# Preview generated SQL
npm run preview-migration
```

#### 4. Execute Migration

```bash
# Full migration (use with caution!)
npm run migrate-data

# Or step-by-step approach
npm run migrate-users      # Migrate employee data first
npm run migrate-services   # Then service access
npm run migrate-vpn        # VPN access
npm run migrate-biometrics # Physical access
```

#### 5. Verify Migration

```bash
# Check migration results
npm run verify-migration

# Generate post-migration report
npm run migration-summary
```

## Database Schema Details

### Key Tables

#### users
- Stores employee information from "Employee Data" sheet
- Links to departments table
- Includes employment status, security clearance, etc.

#### services
- Your 16 IT services (IPAM, Grafana, Teleport, etc.)
- Service categories, access levels, authentication methods
- Integration endpoints for future API connections

#### user_service_access
- **Replaces 72 spreadsheet columns!**
- One row per user-service combination
- Tracks access status, account type, permissions, groups

#### vpn_access
- Separate tracking for Mikrotik and FortiGate VPNs
- User groups, connection limits, data usage

#### audit_logs
- Complete change tracking
- Who did what, when, and from where
- Compliance and security monitoring

### Indexes and Performance

The schema includes optimized indexes for:
- User lookups by username and department
- Service access queries
- Audit log searches by date and user
- VPN connection tracking

### Data Relationships

```
departments (18) ←→ users (245+) ←→ user_service_access ←→ services (16)
                              ↓
                         vpn_access (Mikrotik/FortiGate)
                              ↓
                      biometric_access (Data Center)
```

## Backup and Recovery

### Automated Backups

Set up automated daily backups:

```bash
# Create backup script
cat > backup-esm.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/esm-platform"
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U esm_user -d esm_platform > $BACKUP_DIR/esm_backup_$DATE.sql

# Keep last 30 days
find $BACKUP_DIR -name "esm_backup_*.sql" -mtime +30 -delete
EOF

chmod +x backup-esm.sh

# Add to crontab for daily execution at 2 AM
crontab -e
# Add: 0 2 * * * /path/to/backup-esm.sh
```

### Manual Backup

```bash
# Create backup
pg_dump -h localhost -U esm_user -d esm_platform > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U esm_user -d esm_platform < backup_20250820.sql
```

## Security Considerations

### Database Security

1. **Strong Passwords**: Use complex passwords for database users
2. **Limited Access**: Create application-specific users with minimal permissions
3. **Network Security**: Configure pg_hba.conf for secure connections
4. **SSL/TLS**: Enable encrypted connections in production

### Application Security

1. **Environment Variables**: Never commit passwords to version control
2. **Connection Pooling**: Use connection pools to prevent resource exhaustion
3. **Input Validation**: All user inputs are parameterized to prevent SQL injection
4. **Audit Logging**: All changes are tracked in audit_logs table

## Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port 5432 is open
netstat -ln | grep 5432

# Check pg_hba.conf configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

#### Permission Denied
```bash
# Grant permissions to application user
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE esm_platform TO esm_user;
GRANT ALL ON SCHEMA public TO esm_user;
```

#### Migration Errors
```bash
# Check data validation
npm run validate-migration

# Review error logs
tail -f logs/migration.log

# Rollback if needed
psql -h localhost -U esm_user -d esm_platform -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Performance Issues

#### Slow Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE department_id = 1;
```

#### Index Optimization
```sql
-- Check unused indexes
SELECT schemaname, tablename, attname, inherited, n_distinct, correlation 
FROM pg_stats WHERE tablename = 'users';

-- Create additional indexes if needed
CREATE INDEX idx_users_employment_status ON users(employment_status) WHERE active = true;
```

## Monitoring and Maintenance

### Database Health Checks

```bash
# Check database size
psql -h localhost -U esm_user -d esm_platform -c "
SELECT 
  pg_size_pretty(pg_database_size('esm_platform')) as database_size,
  (SELECT count(*) FROM users) as total_users,
  (SELECT count(*) FROM services) as total_services;"
```

### Regular Maintenance

```sql
-- Update table statistics
ANALYZE;

-- Vacuum and reindex (monthly)
VACUUM ANALYZE;
REINDEX DATABASE esm_platform;
```

## Next Steps

After database setup:

1. **Test Migration**: Run migration with sample data
2. **Configure Application**: Update app to use database instead of mock data
3. **User Training**: Prepare documentation for end users
4. **Go-Live Planning**: Plan cutover from spreadsheets to database

## Support

For database setup issues:
- Check PostgreSQL logs: `/var/log/postgresql/`
- Review connection settings in `.env.local`
- Validate schema with: `npm run verify-schema`
- Contact system administrator for permission issues

---

**Next Document**: [Migration Guide](./migration-guide.md)