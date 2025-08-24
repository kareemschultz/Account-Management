# Migration Guide - From Spreadsheets to ESM Platform

## Migration Overview

This guide provides step-by-step instructions for migrating your account management data from Excel spreadsheets to the ESM Platform database.

**Current State**: 3 Excel files with 245+ employees and 16 services
**Target State**: Normalized PostgreSQL database with automated management

## Pre-Migration Checklist

### ✅ Prerequisites Verification

- [ ] Database setup completed (see [Database Setup Guide](./database-setup.md))
- [ ] Current spreadsheet files available:
  - `AccountManagementJune_20250606_v01.xlsx` (primary source)
  - `AccountManagementMarch_20250506_v01.xlsx` (historical reference)
  - `AllPlatforms_20220405_v01.xlsx` (legacy data)
- [ ] Full backup of current spreadsheets created
- [ ] Migration test environment available
- [ ] Stakeholder approval obtained

### ✅ Risk Assessment

**Low Risk Items**:
- Employee basic information (names, departments, positions)
- Service access status (Yes/No flags)
- VPN access assignments

**Medium Risk Items**:
- Service-specific groups and roles
- Account types and status mappings
- Historical data preservation

**High Risk Items**:
- Custom service configurations
- Temporary account expiration dates
- Complex group memberships

## Migration Strategy

### Phase 1: Data Analysis and Validation (1-2 days)

#### Step 1: Analyze Current Data Structure
```bash
# Run comprehensive data analysis
npm run analyze-spreadsheets

# Generate detailed report
npm run migration-analysis-report
```

This produces:
- User count validation
- Service mapping verification  
- Data quality assessment
- Inconsistency identification

#### Step 2: Validate Data Integrity
```bash
# Check for duplicate users
npm run check-duplicates

# Validate service access patterns
npm run validate-access-patterns

# Identify orphaned records
npm run find-orphaned-data
```

Expected outputs:
- List of users with multiple entries
- Services with inconsistent access patterns
- Missing department mappings

### Phase 2: Test Migration (2-3 days)

#### Step 1: Create Test Database
```bash
# Create isolated test environment
createdb esm_platform_test
psql -d esm_platform_test -f database/schema.sql
```

#### Step 2: Run Sample Migration
```bash
# Migrate first 10 users for testing
npm run migrate-sample --users=10

# Validate results
npm run verify-sample-migration
```

#### Step 3: Department Head Review
```bash
# Generate human-readable report
npm run generate-migration-preview

# Export for stakeholder review
npm run export-migration-preview
```

Share with department heads for validation of:
- Employee information accuracy
- Service access correctness
- Department assignments

### Phase 3: Full Migration (1 day)

#### Step 1: Final Backup
```bash
# Create timestamped backup
DATE=$(date +%Y%m%d_%H%M%S)
cp *.xlsx "backups/pre-migration-$DATE/"

# Document current state
npm run document-current-state > "backups/pre-migration-state-$DATE.txt"
```

#### Step 2: Migration Execution

**Morning (Low Activity Period)**:
```bash
# Start migration
npm run start-migration --source=AccountManagementJune_20250606_v01.xlsx

# Monitor progress
npm run migration-status
```

**Migration Steps Execute**:
1. Import departments (18 departments)
2. Import services (16 services) 
3. Import users (245+ employees)
4. Import service access (thousands of records)
5. Import VPN access (Mikrotik & FortiGate)
6. Import biometric access
7. Validate data integrity
8. Generate final report

#### Step 3: Post-Migration Validation
```bash
# Comprehensive validation
npm run full-migration-validation

# Generate comparison report
npm run compare-before-after

# Performance testing
npm run performance-test
```

## Detailed Migration Procedures

### User Data Migration

**Source**: Employee Data sheet + Services sheet
**Target**: users table + user_service_access table

#### Data Mapping
```
Spreadsheet Column → Database Field
==========================================
Ser. No            → serial_number
NAMES              → name  
Username           → username
Employment Status  → employment_status
CURRENT APPOINTMENT → position
DATE EMPLOYED      → hire_date
```

#### Service Access Mapping
Each service in the spreadsheet (72 columns) maps to rows in `user_service_access`:

```
IPAM Access (Yes/No)     → has_access
IPAM Account Type        → account_type  
IPAM Account Status      → account_status
IPAM Access Level        → access_level
IPAM Groups             → groups
```

### VPN Data Migration

**Source**: VPN sheet
**Target**: vpn_access table

#### Mikrotik VPN Mapping
```
Mikrotik VPN Access      → has_access
Mikrotik VPN Groups      → groups
```

#### FortiGate VPN Mapping  
```
Fortigate VPN Access     → has_access
Fortigate VPN Groups     → groups
```

### Biometric Access Migration

**Source**: Biometrics sheet
**Target**: biometric_access table

```
Registration Status (x/o) → has_access (true/false)
Comments                 → notes
```

## Data Transformation Rules

### Employment Status Normalization
```
Spreadsheet Value → Database Value
==================================
Active           → Active
Dormant          → Dormant
On Leave         → On Leave
(empty)          → Unknown
```

### Service Access Transformation
```
Spreadsheet → Database
=====================
Yes         → has_access = true, account_status = 'Active'
No          → has_access = false, account_status = 'Inactive'
(empty)     → has_access = false, account_status = 'Inactive'
```

### Group Processing
```
Spreadsheet: "Admin,Users,Operators"
Database:    ["Admin", "Users", "Operators"]

Handles:
- Comma-separated values
- Semicolon separation  
- Pipe separation
- Trimming whitespace
```

## Rollback Procedures

### Emergency Rollback
If critical issues are discovered:

```bash
# Immediate rollback to spreadsheets
npm run emergency-rollback

# Restore database from backup
psql -d esm_platform -f "backups/pre-migration-$DATE.sql"

# Notify stakeholders
npm run send-rollback-notification
```

### Partial Rollback
For specific data issues:

```bash
# Rollback specific service
npm run rollback-service --service=ipam

# Rollback user subset
npm run rollback-users --department="Cybersecurity"

# Rollback VPN data only
npm run rollback-vpn-data
```

## Quality Assurance Testing

### Data Accuracy Tests

#### User Information Validation
```sql
-- Verify user count matches spreadsheet
SELECT COUNT(*) FROM users WHERE active = true;
-- Expected: 245

-- Check for missing usernames
SELECT name FROM users WHERE username IS NULL OR username = '';

-- Validate department assignments
SELECT d.name, COUNT(u.id) 
FROM departments d 
LEFT JOIN users u ON d.id = u.department_id 
GROUP BY d.name 
ORDER BY d.name;
```

#### Service Access Validation
```sql
-- Verify service access counts
SELECT s.display_name, COUNT(usa.id) as access_count
FROM services s
LEFT JOIN user_service_access usa ON s.id = usa.service_id AND usa.has_access = true
GROUP BY s.id, s.display_name
ORDER BY s.display_name;

-- Check for orphaned access records
SELECT usa.* FROM user_service_access usa
LEFT JOIN users u ON usa.user_id = u.id
WHERE u.id IS NULL;
```

#### VPN Access Validation  
```sql
-- Verify VPN user counts
SELECT vpn_type, COUNT(*) as user_count
FROM vpn_access 
WHERE has_access = true
GROUP BY vpn_type;

-- Validate group assignments
SELECT vpn_type, unnest(groups) as group_name, COUNT(*)
FROM vpn_access 
WHERE has_access = true AND array_length(groups, 1) > 0
GROUP BY vpn_type, unnest(groups)
ORDER BY vpn_type, group_name;
```

### Performance Testing

#### Database Performance
```bash
# Test query performance
npm run performance-benchmark

# Load testing with concurrent users
npm run load-test --concurrent=50

# Memory usage monitoring
npm run monitor-memory
```

#### Application Response Times
```bash
# Page load testing
npm run test-page-loads

# API endpoint testing
npm run test-api-performance

# Large dataset handling
npm run test-large-datasets
```

## Post-Migration Tasks

### Day 1: Immediate Validation
- [ ] All users can access the system
- [ ] Service access permissions work correctly
- [ ] VPN connectivity maintained
- [ ] Audit logging operational
- [ ] Backup systems functional

### Week 1: User Adoption
- [ ] User training sessions completed
- [ ] Help documentation distributed  
- [ ] Support tickets monitored
- [ ] Feedback collection active
- [ ] Performance monitoring enabled

### Month 1: Optimization
- [ ] Query performance optimized
- [ ] User workflow refinements
- [ ] Additional features requested
- [ ] Integration planning begun
- [ ] Compliance validation completed

## Troubleshooting Common Issues

### Migration Failures

#### Duplicate Username Errors
```bash
# Identify duplicates
npm run find-duplicate-usernames

# Resolve conflicts
npm run resolve-username-conflicts --auto-suffix
```

#### Service Mapping Errors
```bash
# Check service configurations
npm run validate-service-configs

# Fix mapping issues
npm run fix-service-mappings --interactive
```

#### Data Type Mismatches
```bash
# Identify type issues
npm run check-data-types

# Apply corrections
npm run fix-data-types --field=hire_date
```

### Performance Issues

#### Slow Import Times
```bash
# Optimize import process
npm run optimize-import --batch-size=100

# Monitor database performance
npm run monitor-db-performance
```

#### Memory Issues
```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Process in smaller batches
npm run migrate-batched --batch-size=50
```

## Validation Checklist

### ✅ Data Completeness
- [ ] All 245+ users imported
- [ ] All 16 services configured  
- [ ] All service access records migrated
- [ ] VPN access preserved (Mikrotik & FortiGate)
- [ ] Biometric access transferred
- [ ] Department structure maintained
- [ ] Historical data preserved

### ✅ Data Accuracy
- [ ] User names match exactly
- [ ] Usernames consistent
- [ ] Department assignments correct
- [ ] Service access levels accurate
- [ ] Group memberships preserved
- [ ] Employment statuses correct
- [ ] Hire dates accurate

### ✅ System Functionality  
- [ ] Login system operational
- [ ] User management functions work
- [ ] Service access controls active
- [ ] VPN management operational
- [ ] Audit logging functional
- [ ] Reporting system active
- [ ] Backup procedures validated

### ✅ Security Validation
- [ ] Access controls enforced
- [ ] Audit trails complete
- [ ] Password policies active
- [ ] Session management working
- [ ] Data encryption enabled
- [ ] Network security configured

## Success Metrics

### Quantitative Measures
- **Data Accuracy**: >99% of records migrated correctly
- **System Performance**: <2 second response times
- **User Adoption**: >90% of users accessing system within first week
- **Error Rate**: <1% of operations result in errors

### Qualitative Measures
- User feedback surveys positive
- Department heads approve accuracy
- IT team confident in system
- Management satisfied with progress

## Communication Plan

### Stakeholder Updates

#### Before Migration
- Migration plan approval
- Timeline communication
- Risk assessment sharing
- Backup verification

#### During Migration
- Hourly progress updates
- Issue identification alerts
- Completion notifications
- Initial validation results

#### After Migration
- Success confirmation
- User training schedules
- Support contact information
- Feedback collection methods

## Document References

- [Database Setup Guide](./database-setup.md)
- [User Manual](./user-manual.md)
- [Administrator Guide](./admin-guide.md)
- [API Documentation](./api-documentation.md)

---

**Status**: Ready for production migration  
**Last Updated**: 2025-08-20  
**Next Review**: After successful migration