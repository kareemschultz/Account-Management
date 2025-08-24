#!/bin/sh
# Health Check Script for Account Management Platform
# Monitors all services and generates alerts

set -e

# Configuration
CHECK_INTERVAL=${CHECK_INTERVAL:-300}  # 5 minutes default
LOG_FILE="/logs/healthcheck.log"
ALERT_THRESHOLD=3  # Number of failures before alert

# Service endpoints
APP_ENDPOINT="http://app:3000/api/health"
NGINX_ENDPOINT="http://nginx:80/health"
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
REDIS_HOST="redis"
REDIS_PORT="6379"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Install required packages
apk add --no-cache curl postgresql-client redis netcat-openbsd jq > /dev/null 2>&1

log_message "Health check service starting..."

# Function to check HTTP service
check_http_service() {
    local service_name="$1"
    local endpoint="$2"
    local timeout="${3:-10}"
    
    if curl -f -s --max-time "$timeout" "$endpoint" > /dev/null 2>&1; then
        echo "${GREEN}✓${NC} $service_name is healthy"
        return 0
    else
        echo "${RED}✗${NC} $service_name is unhealthy"
        return 1
    fi
}

# Function to check TCP service
check_tcp_service() {
    local service_name="$1"
    local host="$2"
    local port="$3"
    local timeout="${4:-5}"
    
    if nc -z -w "$timeout" "$host" "$port" > /dev/null 2>&1; then
        echo "${GREEN}✓${NC} $service_name is healthy"
        return 0
    else
        echo "${RED}✗${NC} $service_name is unhealthy"
        return 1
    fi
}

# Function to check PostgreSQL
check_postgres() {
    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; then
        echo "${GREEN}✓${NC} PostgreSQL is healthy"
        return 0
    else
        echo "${RED}✗${NC} PostgreSQL is unhealthy"
        return 1
    fi
}

# Function to check Redis
check_redis() {
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; then
        echo "${GREEN}✓${NC} Redis is healthy"
        return 0
    else
        echo "${RED}✗${NC} Redis is unhealthy"
        return 1
    fi
}

# Function to get service metrics
get_service_metrics() {
    local service="$1"
    local metric_endpoint="$2"
    
    if [ -n "$metric_endpoint" ]; then
        curl -s "$metric_endpoint" | jq . 2>/dev/null || echo "Metrics unavailable"
    fi
}

# Function to check disk space
check_disk_space() {
    local usage
    usage=$(df /backup 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt 90 ]; then
        echo "${RED}✗${NC} Disk usage is critical: ${usage}%"
        return 1
    elif [ "$usage" -gt 80 ]; then
        echo "${YELLOW}⚠${NC} Disk usage is high: ${usage}%"
        return 0
    else
        echo "${GREEN}✓${NC} Disk usage is normal: ${usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory_usage() {
    local mem_usage
    mem_usage=$(free | grep '^Mem:' | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$mem_usage" -gt 90 ]; then
        echo "${RED}✗${NC} Memory usage is critical: ${mem_usage}%"
        return 1
    elif [ "$mem_usage" -gt 80 ]; then
        echo "${YELLOW}⚠${NC} Memory usage is high: ${mem_usage}%"
        return 0
    else
        echo "${GREEN}✓${NC} Memory usage is normal: ${mem_usage}%"
        return 0
    fi
}

# Main health check function
perform_health_check() {
    local failed_services=0
    local total_services=0
    
    echo "${BLUE}=== Account Management Platform Health Check ===${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Check Application
    total_services=$((total_services + 1))
    log_message "Checking Application service..."
    if ! check_http_service "Application" "$APP_ENDPOINT"; then
        failed_services=$((failed_services + 1))
        log_message "ERROR: Application service failed health check"
    fi
    
    # Check Nginx
    total_services=$((total_services + 1))
    log_message "Checking Nginx service..."
    if ! check_http_service "Nginx" "$NGINX_ENDPOINT"; then
        failed_services=$((failed_services + 1))
        log_message "ERROR: Nginx service failed health check"
    fi
    
    # Check PostgreSQL
    total_services=$((total_services + 1))
    log_message "Checking PostgreSQL service..."
    if ! check_postgres; then
        failed_services=$((failed_services + 1))
        log_message "ERROR: PostgreSQL service failed health check"
    fi
    
    # Check Redis
    total_services=$((total_services + 1))
    log_message "Checking Redis service..."
    if ! check_redis; then
        failed_services=$((failed_services + 1))
        log_message "ERROR: Redis service failed health check"
    fi
    
    echo ""
    echo "${BLUE}=== System Resources ===${NC}"
    
    # Check system resources
    check_disk_space
    check_memory_usage
    
    echo ""
    echo "${BLUE}=== Summary ===${NC}"
    
    if [ $failed_services -eq 0 ]; then
        echo "${GREEN}All services are healthy (${total_services}/${total_services})${NC}"
        log_message "SUCCESS: All services passed health check"
        return 0
    else
        echo "${RED}${failed_services} out of ${total_services} services failed${NC}"
        log_message "WARNING: ${failed_services}/${total_services} services failed health check"
        return 1
    fi
}

# Function to send alerts (placeholder for integration with monitoring systems)
send_alert() {
    local message="$1"
    local severity="$2"
    
    log_message "ALERT [$severity]: $message"
    
    # Add integration with alerting systems here
    # Examples: Slack webhook, email, PagerDuty, etc.
    
    # Slack webhook example (uncomment and configure)
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"ESM Platform Alert [$severity]: $message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
}

# Continuous monitoring loop
failure_count=0

log_message "Starting continuous health monitoring (interval: ${CHECK_INTERVAL}s)"

while true; do
    if perform_health_check; then
        failure_count=0
    else
        failure_count=$((failure_count + 1))
        
        if [ $failure_count -ge $ALERT_THRESHOLD ]; then
            send_alert "ESM Platform has failed health checks $failure_count times in a row" "CRITICAL"
            failure_count=0  # Reset to avoid spam
        fi
    fi
    
    echo ""
    echo "Next check in ${CHECK_INTERVAL} seconds..."
    echo "=================================================="
    echo ""
    
    sleep "$CHECK_INTERVAL"
done