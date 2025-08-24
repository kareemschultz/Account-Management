#!/bin/bash
# Database Backup Script for Account Management Platform
# Automated PostgreSQL backup with S3 upload and retention management

set -e

# Configuration
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-esm_platform}
POSTGRES_USER=${POSTGRES_USER:-postgres}
BACKUP_DIR="/backup"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/esm_platform_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# S3 Configuration (optional)
S3_BUCKET=${BACKUP_S3_BUCKET:-""}
S3_REGION=${BACKUP_S3_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${BACKUP_DIR}/backup.log"
}

# Error handling
handle_error() {
    local exit_code=$?
    log "${RED}ERROR: Backup failed with exit code $exit_code${NC}"
    cleanup_failed_backup
    exit $exit_code
}

trap 'handle_error' ERR

# Cleanup function for failed backups
cleanup_failed_backup() {
    if [ -f "$BACKUP_FILE" ]; then
        rm -f "$BACKUP_FILE"
        log "${YELLOW}Cleaned up failed backup file: $BACKUP_FILE${NC}"
    fi
    if [ -f "$COMPRESSED_FILE" ]; then
        rm -f "$COMPRESSED_FILE"
        log "${YELLOW}Cleaned up failed compressed file: $COMPRESSED_FILE${NC}"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "${BLUE}Checking prerequisites...${NC}"
    
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "${GREEN}Created backup directory: $BACKUP_DIR${NC}"
    fi
    
    # Check database connectivity
    if ! pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" > /dev/null 2>&1; then
        log "${RED}ERROR: Cannot connect to PostgreSQL database${NC}"
        exit 1
    fi
    
    # Check available disk space (require at least 1GB free)
    available_space=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
    required_space=1048576  # 1GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log "${RED}ERROR: Insufficient disk space. Available: ${available_space}KB, Required: ${required_space}KB${NC}"
        exit 1
    fi
    
    log "${GREEN}Prerequisites check passed${NC}"
}

# Perform database backup
perform_backup() {
    log "${BLUE}Starting database backup...${NC}"
    log "Database: $POSTGRES_DB"
    log "Host: $POSTGRES_HOST:$POSTGRES_PORT"
    log "User: $POSTGRES_USER"
    log "Backup file: $BACKUP_FILE"
    
    # Create database dump with verbose output
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --encoding=UTF8 \
        --no-password \
        > "$BACKUP_FILE"
    
    # Verify backup file was created and has content
    if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
        log "${RED}ERROR: Backup file was not created or is empty${NC}"
        exit 1
    fi
    
    local backup_size=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}Database backup completed successfully${NC}"
    log "Backup size: $backup_size"
}

# Compress backup file
compress_backup() {
    log "${BLUE}Compressing backup file...${NC}"
    
    gzip "$BACKUP_FILE"
    
    if [ ! -f "$COMPRESSED_FILE" ]; then
        log "${RED}ERROR: Compression failed${NC}"
        exit 1
    fi
    
    local compressed_size=$(du -h "$COMPRESSED_FILE" | cut -f1)
    local original_size=$(zcat "$COMPRESSED_FILE" | wc -c | numfmt --to=iec)
    
    log "${GREEN}Backup compression completed${NC}"
    log "Compressed size: $compressed_size (original: $original_size)"
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "${YELLOW}S3 upload skipped (no bucket configured)${NC}"
        return 0
    fi
    
    log "${BLUE}Uploading backup to S3...${NC}"
    
    # Check if AWS CLI is available
    if ! command -v aws > /dev/null 2>&1; then
        log "${YELLOW}AWS CLI not found, installing...${NC}"
        apk add --no-cache aws-cli
    fi
    
    # Upload to S3
    local s3_key="backups/$(basename "$COMPRESSED_FILE")"
    
    if aws s3 cp "$COMPRESSED_FILE" "s3://$S3_BUCKET/$s3_key" --region "$S3_REGION"; then
        log "${GREEN}Backup uploaded to S3: s3://$S3_BUCKET/$s3_key${NC}"
    else
        log "${YELLOW}WARNING: S3 upload failed, backup saved locally only${NC}"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "${BLUE}Cleaning up old backups...${NC}"
    
    # Local cleanup
    local deleted_count=0
    find "$BACKUP_DIR" -name "esm_platform_*.sql.gz" -type f -mtime +$RETENTION_DAYS | while read -r old_backup; do
        rm -f "$old_backup"
        log "Deleted old backup: $(basename "$old_backup")"
        deleted_count=$((deleted_count + 1))
    done
    
    if [ $deleted_count -eq 0 ]; then
        log "No old backups to clean up"
    else
        log "${GREEN}Cleaned up $deleted_count old backup files${NC}"
    fi
    
    # S3 cleanup (if configured)
    if [ -n "$S3_BUCKET" ] && command -v aws > /dev/null 2>&1; then
        log "Cleaning up old S3 backups..."
        
        # Get date threshold for deletion
        local threshold_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        
        aws s3 ls "s3://$S3_BUCKET/backups/" --region "$S3_REGION" | \
        awk '{print $1, $2, $4}' | \
        while read -r date time file; do
            if [[ "$date" < "$threshold_date" ]]; then
                aws s3 rm "s3://$S3_BUCKET/backups/$file" --region "$S3_REGION"
                log "Deleted old S3 backup: $file"
            fi
        done
    fi
}

# Verify backup integrity
verify_backup() {
    log "${BLUE}Verifying backup integrity...${NC}"
    
    # Test gzip file integrity
    if ! gzip -t "$COMPRESSED_FILE"; then
        log "${RED}ERROR: Backup file is corrupted${NC}"
        exit 1
    fi
    
    # Check if backup contains expected PostgreSQL dump structure
    if ! zcat "$COMPRESSED_FILE" | head -n 20 | grep -q "PostgreSQL database dump"; then
        log "${RED}ERROR: Backup file doesn't appear to be a valid PostgreSQL dump${NC}"
        exit 1
    fi
    
    # Count the number of table creations (should be > 0 for our schema)
    local table_count=$(zcat "$COMPRESSED_FILE" | grep -c "CREATE TABLE" || true)
    
    if [ "$table_count" -eq 0 ]; then
        log "${YELLOW}WARNING: No tables found in backup (empty database?)${NC}"
    else
        log "Backup contains $table_count tables"
    fi
    
    log "${GREEN}Backup integrity verification passed${NC}"
}

# Generate backup report
generate_report() {
    local end_time=$(date '+%Y-%m-%d %H:%M:%S')
    local backup_size=$(du -h "$COMPRESSED_FILE" | cut -f1)
    
    cat << EOF > "${BACKUP_DIR}/backup_report_${TIMESTAMP}.txt"
Account Management Platform - Backup Report
==========================================

Backup Details:
- Timestamp: $TIMESTAMP
- Database: $POSTGRES_DB
- Host: $POSTGRES_HOST:$POSTGRES_PORT
- Backup File: $(basename "$COMPRESSED_FILE")
- File Size: $backup_size
- Status: SUCCESS

Configuration:
- Retention Days: $RETENTION_DAYS
- S3 Bucket: ${S3_BUCKET:-"Not configured"}
- S3 Region: $S3_REGION

Timing:
- Started: $(date -d "$TIMESTAMP" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "N/A")
- Completed: $end_time

Next Actions:
- Verify backup can be restored in staging environment
- Monitor backup retention and cleanup
- Review backup logs for any warnings
EOF

    log "${GREEN}Backup report generated: backup_report_${TIMESTAMP}.txt${NC}"
}

# Main execution
main() {
    log "${GREEN}=== Starting Account Management Platform Database Backup ===${NC}"
    
    check_prerequisites
    perform_backup
    compress_backup
    verify_backup
    upload_to_s3
    cleanup_old_backups
    generate_report
    
    log "${GREEN}=== Backup completed successfully ===${NC}"
    log "Backup file: $COMPRESSED_FILE"
    log "Size: $(du -h "$COMPRESSED_FILE" | cut -f1)"
}

# Execute main function
main "$@"