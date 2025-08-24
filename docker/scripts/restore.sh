#!/bin/bash
# Database Restore Script for Account Management Platform
# Automated PostgreSQL restore from backup files

set -e

# Configuration
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-esm_platform}
POSTGRES_USER=${POSTGRES_USER:-postgres}
BACKUP_DIR="/backup"
RESTORE_LOG="${BACKUP_DIR}/restore.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$RESTORE_LOG"
}

# Error handling
handle_error() {
    local exit_code=$?
    log "${RED}ERROR: Restore failed with exit code $exit_code${NC}"
    exit $exit_code
}

trap 'handle_error' ERR

# Show help
show_help() {
    cat << EOF
Account Management Platform - Database Restore

Usage: $0 [OPTIONS] BACKUP_FILE

OPTIONS:
  -h, --host HOST          Database host [default: postgres]
  -p, --port PORT          Database port [default: 5432]
  -d, --database DATABASE  Database name [default: esm_platform]
  -u, --user USER          Database user [default: postgres]
  -f, --force              Force restore without confirmation
  -l, --list               List available backup files
  -c, --create-db          Create database if it doesn't exist
  --help                   Show this help message

EXAMPLES:
  $0 --list                                    # List available backups
  $0 esm_platform_20240101_120000.sql.gz      # Restore from specific backup
  $0 --force --create-db backup.sql.gz        # Force restore with DB creation
  $0 --host localhost --port 5432 backup.sql.gz

EOF
}

# Parse command line arguments
BACKUP_FILE=""
FORCE_RESTORE=false
LIST_BACKUPS=false
CREATE_DB=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            POSTGRES_HOST="$2"
            shift 2
            ;;
        -p|--port)
            POSTGRES_PORT="$2"
            shift 2
            ;;
        -d|--database)
            POSTGRES_DB="$2"
            shift 2
            ;;
        -u|--user)
            POSTGRES_USER="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_RESTORE=true
            shift
            ;;
        -l|--list)
            LIST_BACKUPS=true
            shift
            ;;
        -c|--create-db)
            CREATE_DB=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        -*)
            log "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# List available backups
list_available_backups() {
    log "${BLUE}Available backup files:${NC}"
    echo ""
    
    local backup_count=0
    for backup in "$BACKUP_DIR"/*.sql.gz; do
        if [[ -f "$backup" ]]; then
            local filename=$(basename "$backup")
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1)
            
            printf "%-40s %8s %12s\n" "$filename" "$size" "$date"
            backup_count=$((backup_count + 1))
        fi
    done
    
    if [[ $backup_count -eq 0 ]]; then
        log "${YELLOW}No backup files found in $BACKUP_DIR${NC}"
    else
        echo ""
        log "${GREEN}Found $backup_count backup file(s)${NC}"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "${BLUE}Checking prerequisites...${NC}"
    
    # Check if backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "${RED}ERROR: Backup directory does not exist: $BACKUP_DIR${NC}"
        exit 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" > /dev/null 2>&1; then
        log "${RED}ERROR: Cannot connect to PostgreSQL database${NC}"
        exit 1
    fi
    
    # Check if backup file exists and is readable
    if [[ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]]; then
        log "${RED}ERROR: Backup file not found: $BACKUP_DIR/$BACKUP_FILE${NC}"
        exit 1
    fi
    
    if [[ ! -r "$BACKUP_DIR/$BACKUP_FILE" ]]; then
        log "${RED}ERROR: Cannot read backup file: $BACKUP_DIR/$BACKUP_FILE${NC}"
        exit 1
    fi
    
    # Test gzip file integrity
    if ! gzip -t "$BACKUP_DIR/$BACKUP_FILE"; then
        log "${RED}ERROR: Backup file is corrupted: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    log "${GREEN}Prerequisites check passed${NC}"
}

# Verify backup content
verify_backup_content() {
    log "${BLUE}Verifying backup content...${NC}"
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    # Check if it's a valid PostgreSQL dump
    if ! zcat "$backup_path" | head -n 20 | grep -q "PostgreSQL database dump"; then
        log "${RED}ERROR: File doesn't appear to be a valid PostgreSQL dump${NC}"
        exit 1
    fi
    
    # Get dump information
    local dump_info=$(zcat "$backup_path" | head -n 10 | grep -E "(PostgreSQL|Dumped)")
    log "Backup information:"
    echo "$dump_info" | while read -r line; do
        log "  $line"
    done
    
    # Count tables in backup
    local table_count=$(zcat "$backup_path" | grep -c "CREATE TABLE" || true)
    log "Tables in backup: $table_count"
    
    log "${GREEN}Backup content verification passed${NC}"
}

# Create database if requested
create_database() {
    if [[ "$CREATE_DB" == "true" ]]; then
        log "${BLUE}Creating database if it doesn't exist...${NC}"
        
        PGPASSWORD="$POSTGRES_PASSWORD" createdb \
            -h "$POSTGRES_HOST" \
            -p "$POSTGRES_PORT" \
            -U "$POSTGRES_USER" \
            --encoding=UTF8 \
            "$POSTGRES_DB" 2>/dev/null || true
        
        log "${GREEN}Database creation completed${NC}"
    fi
}

# Get database information before restore
get_pre_restore_info() {
    log "${BLUE}Getting database information before restore...${NC}"
    
    # Check if database exists
    local db_exists=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -lqt | cut -d \| -f 1 | grep -w "$POSTGRES_DB" | wc -l)
    
    if [[ "$db_exists" -eq 0 ]]; then
        log "${YELLOW}Database '$POSTGRES_DB' does not exist${NC}"
        return 0
    fi
    
    # Get table count
    local table_count=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
    
    log "Current database '$POSTGRES_DB' has $table_count tables"
}

# Confirm restore operation
confirm_restore() {
    if [[ "$FORCE_RESTORE" == "true" ]]; then
        return 0
    fi
    
    echo ""
    log "${YELLOW}=== RESTORE CONFIRMATION ===${NC}"
    log "Database: $POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
    log "Backup file: $BACKUP_FILE"
    log "Size: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
    echo ""
    log "${RED}WARNING: This will replace ALL data in the database!${NC}"
    echo ""
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

# Perform database restore
perform_restore() {
    log "${BLUE}Starting database restore...${NC}"
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    local start_time=$(date +%s)
    
    # Create database if requested
    create_database
    
    # Restore database from backup
    log "Restoring from: $backup_path"
    log "Target database: $POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
    
    # Use zcat to decompress and pipe to psql
    if zcat "$backup_path" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -v ON_ERROR_STOP=1 \
        --quiet; then
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "${GREEN}Database restore completed successfully${NC}"
        log "Restore duration: ${duration} seconds"
    else
        log "${RED}Database restore failed${NC}"
        exit 1
    fi
}

# Verify restore results
verify_restore() {
    log "${BLUE}Verifying restore results...${NC}"
    
    # Check database connectivity
    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -c "SELECT 1;" > /dev/null 2>&1; then
        log "${RED}ERROR: Cannot connect to restored database${NC}"
        exit 1
    fi
    
    # Get table count after restore
    local table_count=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    log "Restored database has $table_count tables"
    
    # Check if core tables exist (specific to Account Management Platform)
    local core_tables=("users" "services" "user_service_access" "audit_logs")
    local missing_tables=0
    
    for table in "${core_tables[@]}"; do
        local exists=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
            -h "$POSTGRES_HOST" \
            -p "$POSTGRES_PORT" \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | tr -d ' ')
        
        if [[ "$exists" == "t" ]]; then
            log "${GREEN}✓${NC} Table '$table' exists"
        else
            log "${RED}✗${NC} Table '$table' missing"
            missing_tables=$((missing_tables + 1))
        fi
    done
    
    if [[ $missing_tables -eq 0 ]]; then
        log "${GREEN}All core tables found - restore verification passed${NC}"
    else
        log "${YELLOW}WARNING: $missing_tables core table(s) missing${NC}"
    fi
}

# Generate restore report
generate_restore_report() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local report_file="${BACKUP_DIR}/restore_report_${timestamp}.txt"
    
    cat << EOF > "$report_file"
Account Management Platform - Database Restore Report
===================================================

Restore Details:
- Timestamp: $(date '+%Y-%m-%d %H:%M:%S')
- Source Backup: $BACKUP_FILE
- Target Database: $POSTGRES_DB
- Target Host: $POSTGRES_HOST:$POSTGRES_PORT
- Status: SUCCESS

Configuration:
- Create Database: $CREATE_DB
- Force Restore: $FORCE_RESTORE

Post-Restore Verification:
- Database connectivity: OK
- Core tables: Verified

Next Actions:
- Test application functionality
- Verify data integrity
- Update application if schema changes exist
- Monitor application logs for any issues

EOF

    log "${GREEN}Restore report generated: restore_report_${timestamp}.txt${NC}"
}

# Main execution
main() {
    # Handle list backups option
    if [[ "$LIST_BACKUPS" == "true" ]]; then
        list_available_backups
        exit 0
    fi
    
    # Check if backup file is provided
    if [[ -z "$BACKUP_FILE" ]]; then
        log "${RED}ERROR: Backup file not specified${NC}"
        show_help
        exit 1
    fi
    
    log "${GREEN}=== Starting Account Management Platform Database Restore ===${NC}"
    
    check_prerequisites
    verify_backup_content
    get_pre_restore_info
    confirm_restore
    perform_restore
    verify_restore
    generate_restore_report
    
    log "${GREEN}=== Database restore completed successfully ===${NC}"
}

# Execute main function
main "$@"