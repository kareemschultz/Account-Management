#!/bin/bash
# Container Orchestration Script for Account Management Platform
# Production deployment and management automation

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_DIR="$PROJECT_DIR/docker/envs"

# Default values
ENVIRONMENT="production"
ACTION="deploy"
BACKUP_BEFORE_DEPLOY=true
FORCE_RECREATE=false
SCALE_REPLICAS=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Account Management Platform - Container Orchestration

Usage: $0 [OPTIONS]

ACTIONS:
  deploy              Deploy the application stack (default)
  start               Start existing containers
  stop                Stop all containers
  restart             Restart all containers
  logs                Show container logs
  backup              Create database backup
  restore             Restore database from backup
  health              Check health of all services
  cleanup             Remove unused containers and images
  scale               Scale application containers

OPTIONS:
  -e, --env ENVIRONMENT     Environment (development|staging|production) [default: production]
  -a, --action ACTION       Action to perform [default: deploy]
  -f, --force              Force recreate containers
  -s, --scale REPLICAS     Number of app replicas [default: 1]
  -b, --no-backup          Skip backup before deployment
  -h, --help               Show this help message

EXAMPLES:
  $0 --env development --action deploy
  $0 --env production --action deploy --scale 3
  $0 --action backup
  $0 --action logs
  $0 --action health
  $0 --action cleanup

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_RECREATE=true
            shift
            ;;
        -s|--scale)
            SCALE_REPLICAS="$2"
            shift 2
            ;;
        -b|--no-backup)
            BACKUP_BEFORE_DEPLOY=false
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be development, staging, or production."
        exit 1
    fi
    
    local env_file="$ENV_DIR/.env.$ENVIRONMENT"
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        exit 1
    fi
    
    log_info "Using environment: $ENVIRONMENT"
    export ENV_FILE="$env_file"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Determine Docker Compose command
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    # Check if compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment configuration..."
    
    # Export environment file path for docker-compose
    export ENV_FILE="$ENV_DIR/.env.$ENVIRONMENT"
    
    # Source environment variables
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a  # Stop automatically exporting
    
    log_success "Environment loaded: $ENVIRONMENT"
}

# Create database backup
create_backup() {
    if [[ "$BACKUP_BEFORE_DEPLOY" == "true" && "$ENVIRONMENT" == "production" ]]; then
        log_info "Creating database backup before deployment..."
        
        # Run backup container
        $DOCKER_COMPOSE --env-file "$ENV_FILE" run --rm db_backup
        
        if [[ $? -eq 0 ]]; then
            log_success "Database backup completed"
        else
            log_error "Database backup failed"
            exit 1
        fi
    else
        log_info "Skipping database backup"
    fi
}

# Deploy application stack
deploy_stack() {
    log_info "Deploying Account Management Platform stack..."
    
    local compose_args="--env-file $ENV_FILE"
    
    if [[ "$FORCE_RECREATE" == "true" ]]; then
        compose_args="$compose_args --force-recreate"
    fi
    
    # Pull latest images
    log_info "Pulling latest images..."
    $DOCKER_COMPOSE $compose_args pull
    
    # Create backup if enabled
    create_backup
    
    # Deploy services
    log_info "Starting services..."
    $DOCKER_COMPOSE $compose_args up -d
    
    # Scale application if specified
    if [[ "$SCALE_REPLICAS" -gt 1 ]]; then
        log_info "Scaling application to $SCALE_REPLICAS replicas..."
        $DOCKER_COMPOSE $compose_args up -d --scale app=$SCALE_REPLICAS
    fi
    
    # Wait for services to be healthy
    wait_for_health
    
    log_success "Deployment completed successfully"
}

# Start containers
start_containers() {
    log_info "Starting containers..."
    $DOCKER_COMPOSE --env-file "$ENV_FILE" start
    log_success "Containers started"
}

# Stop containers
stop_containers() {
    log_info "Stopping containers..."
    $DOCKER_COMPOSE --env-file "$ENV_FILE" stop
    log_success "Containers stopped"
}

# Restart containers
restart_containers() {
    log_info "Restarting containers..."
    $DOCKER_COMPOSE --env-file "$ENV_FILE" restart
    log_success "Containers restarted"
}

# Show logs
show_logs() {
    log_info "Showing container logs..."
    $DOCKER_COMPOSE --env-file "$ENV_FILE" logs -f
}

# Wait for services to be healthy
wait_for_health() {
    log_info "Waiting for services to be healthy..."
    
    local max_wait=300  # 5 minutes
    local wait_time=0
    local check_interval=10
    
    while [[ $wait_time -lt $max_wait ]]; do
        local all_healthy=true
        
        # Check each service health
        for service in postgres redis app nginx; do
            local health_status=$($DOCKER_COMPOSE --env-file "$ENV_FILE" ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
            
            if [[ "$health_status" != "healthy" && "$health_status" != "no-health-check" ]]; then
                all_healthy=false
                break
            fi
        done
        
        if [[ "$all_healthy" == "true" ]]; then
            log_success "All services are healthy"
            return 0
        fi
        
        log_info "Waiting for services to be healthy... ($wait_time/$max_wait seconds)"
        sleep $check_interval
        wait_time=$((wait_time + check_interval))
    done
    
    log_error "Timeout waiting for services to be healthy"
    check_service_health
    exit 1
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    # Get service status
    $DOCKER_COMPOSE --env-file "$ENV_FILE" ps
    
    echo ""
    log_info "Individual service health checks:"
    
    # Check each service
    for service in postgres redis app nginx; do
        local container_id=$($DOCKER_COMPOSE --env-file "$ENV_FILE" ps -q $service)
        
        if [[ -n "$container_id" ]]; then
            local status=$(docker inspect --format='{{.State.Status}}' $container_id)
            local health=$(docker inspect --format='{{.State.Health.Status}}' $container_id 2>/dev/null || echo "no-health-check")
            
            if [[ "$status" == "running" && ("$health" == "healthy" || "$health" == "no-health-check") ]]; then
                log_success "$service: $status ($health)"
            else
                log_error "$service: $status ($health)"
            fi
        else
            log_error "$service: container not found"
        fi
    done
}

# Scale application containers
scale_containers() {
    log_info "Scaling application containers to $SCALE_REPLICAS replicas..."
    $DOCKER_COMPOSE --env-file "$ENV_FILE" up -d --scale app=$SCALE_REPLICAS
    log_success "Application scaled to $SCALE_REPLICAS replicas"
}

# Cleanup unused resources
cleanup_resources() {
    log_info "Cleaning up unused Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    if [[ "$ENVIRONMENT" != "production" ]]; then
        docker volume prune -f
    fi
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Restore database from backup
restore_database() {
    log_info "Database restore functionality"
    log_warning "This is a placeholder - implement based on your backup strategy"
    
    # List available backups
    ls -la /backup/*.sql.gz 2>/dev/null || log_info "No backup files found"
    
    # Add restore logic here
    # Example: zcat backup.sql.gz | docker exec -i postgres_container psql -U user -d database
}

# Main execution
main() {
    log_info "=== Account Management Platform Container Orchestration ==="
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    
    validate_environment
    check_prerequisites
    load_environment
    
    case "$ACTION" in
        deploy)
            deploy_stack
            ;;
        start)
            start_containers
            ;;
        stop)
            stop_containers
            ;;
        restart)
            restart_containers
            ;;
        logs)
            show_logs
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_database
            ;;
        health)
            check_service_health
            ;;
        cleanup)
            cleanup_resources
            ;;
        scale)
            scale_containers
            ;;
        *)
            log_error "Unknown action: $ACTION"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"