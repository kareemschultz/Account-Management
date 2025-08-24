# Account Management Platform - Docker Configuration

Complete Docker containerization setup for enterprise production deployment with security hardening and high availability.

## 🏗️ Architecture Overview

The containerized setup includes:

- **Next.js Application** - Multi-replica setup with load balancing
- **PostgreSQL 17.6** - High-performance database with backup automation
- **Redis** - Session and cache management
- **Nginx** - Load balancer, reverse proxy, and SSL termination
- **Monitoring** - Health checks and automated alerting
- **Backup Services** - Automated database backups with S3 integration

## 📁 File Structure

```
docker/
├── envs/                    # Environment configurations
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
├── nginx/                   # Nginx configurations
│   ├── nginx.conf
│   └── default.conf
├── redis/                   # Redis configurations
│   └── redis.conf
├── scripts/                 # Automation scripts
│   ├── deploy.sh           # Main deployment orchestration
│   ├── backup.sh           # Database backup automation
│   ├── restore.sh          # Database restore utilities
│   └── healthcheck.sh      # Service monitoring
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- 4GB+ RAM available for containers
- 20GB+ disk space for data volumes

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 2. Development Environment

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Access application
open http://localhost:3000
```

### 3. Production Deployment

```bash
# Use the deployment script
chmod +x docker/scripts/deploy.sh
./docker/scripts/deploy.sh --env production --action deploy

# Or manually with production compose file
docker-compose -f docker-compose.yml -f docker-compose.production.yml --env-file docker/envs/.env.production up -d
```

## 🛠️ Deployment Scripts

### Main Deployment Script

```bash
# Deploy to production with 3 app replicas
./docker/scripts/deploy.sh --env production --scale 3

# Deploy to staging
./docker/scripts/deploy.sh --env staging

# Check service health
./docker/scripts/deploy.sh --action health

# View logs
./docker/scripts/deploy.sh --action logs

# Create backup
./docker/scripts/deploy.sh --action backup
```

### Available Actions

- `deploy` - Deploy complete application stack
- `start` - Start existing containers
- `stop` - Stop all containers
- `restart` - Restart containers
- `logs` - View container logs
- `backup` - Create database backup
- `health` - Check service health
- `cleanup` - Remove unused resources
- `scale` - Scale application containers

## 🔒 Security Features

### Container Security

- **Non-root Users** - All containers run as non-privileged users
- **Read-only Filesystems** - Containers use read-only root filesystems where possible
- **Resource Limits** - Memory and CPU limits prevent resource exhaustion
- **Network Isolation** - Separate networks for database and application layers
- **Security Scanning** - Automated vulnerability scanning in CI/CD

### Application Security

- **SSL/TLS Termination** - Nginx handles SSL with modern cipher suites
- **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- **Rate Limiting** - API and authentication endpoint protection
- **CORS Configuration** - Strict cross-origin request policies

## 📊 Monitoring & Health Checks

### Automated Health Checks

All services include comprehensive health checks:

- **Database** - Connection and query response tests
- **Redis** - Ping and basic operation tests  
- **Application** - HTTP endpoint health verification
- **Nginx** - Proxy functionality and upstream checks

### Monitoring Dashboard

Access monitoring endpoints:

- Application health: `http://localhost/api/health`
- Nginx status: `http://localhost/health`
- Container metrics: `docker stats`

## 💾 Backup & Restore

### Automated Backups

Database backups run automatically with:

- **Daily Snapshots** - Full database dumps
- **Retention Policy** - Configurable retention (default: 30 days)
- **S3 Integration** - Optional cloud backup storage
- **Integrity Verification** - Backup validation and reporting

### Manual Backup

```bash
# Create immediate backup
docker-compose exec postgres /scripts/backup.sh

# Or use deployment script
./docker/scripts/deploy.sh --action backup
```

### Database Restore

```bash
# List available backups
./docker/scripts/restore.sh --list

# Restore specific backup
./docker/scripts/restore.sh esm_platform_20240101_120000.sql.gz

# Force restore without confirmation
./docker/scripts/restore.sh --force backup_file.sql.gz
```

## 🔧 Configuration

### Environment Variables

Key configuration options:

```bash
# Database
POSTGRES_DB=esm_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_PASSWORD=redis_password

# Application
NEXTAUTH_SECRET=auth_secret
NEXTAUTH_URL=https://yourdomain.com

# Backup
BACKUP_S3_BUCKET=esm-backups
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Resource Allocation

Production resource limits:

- **PostgreSQL**: 2GB RAM, 1 CPU
- **Redis**: 512MB RAM, 0.5 CPU  
- **Application** (per replica): 1GB RAM, 0.75 CPU
- **Nginx**: 256MB RAM, 0.5 CPU

## 🚦 CI/CD Integration

### GitHub Actions

Automated pipeline includes:

- **Quality Assurance** - Linting, testing, type checking
- **Security Scanning** - Dependency and container vulnerability checks
- **Build & Push** - Multi-architecture Docker image builds
- **Deployment** - Automated staging and production deployments
- **Monitoring** - Post-deployment health verification

### Pipeline Triggers

- **Pull Requests** - Quality checks and security scans
- **Main Branch** - Build and deploy to staging
- **Tagged Releases** - Production deployment with backup

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Stop conflicting services
   sudo systemctl stop apache2
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres pg_isready
   ```

3. **Memory Issues**
   ```bash
   # Check container memory usage
   docker stats
   
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   ```

4. **SSL Certificate Issues**
   ```bash
   # Generate self-signed certificates for development
   mkdir -p docker/nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/nginx/ssl/key.pem \
     -out docker/nginx/ssl/cert.pem
   ```

### Log Analysis

```bash
# View all container logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f app

# Check health check logs
docker-compose logs healthcheck

# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 📈 Performance Tuning

### Database Optimization

PostgreSQL is configured with production-optimized settings:

- **Connection Pooling** - Limited concurrent connections
- **Memory Settings** - Optimized buffer and cache sizes
- **WAL Configuration** - Performance-tuned write-ahead logging
- **Statistics** - Enhanced query planning statistics

### Application Scaling

Scale application for high load:

```bash
# Scale to 5 app instances
./docker/scripts/deploy.sh --scale 5

# Or with docker-compose
docker-compose up -d --scale app=5
```

### Cache Configuration

Redis is optimized for:

- **Memory Management** - LRU eviction policy
- **Persistence** - AOF and RDB snapshots
- **Security** - Password protection and command filtering

## 🔄 Updates & Maintenance

### Rolling Updates

Production deployments use rolling updates:

1. New version deployed alongside existing
2. Health checks verify new version
3. Traffic gradually shifted to new version
4. Old version removed after verification

### Maintenance Windows

Schedule maintenance tasks:

```bash
# Weekly cleanup (non-production)
./docker/scripts/deploy.sh --action cleanup

# Database maintenance
docker-compose exec postgres vacuumdb --all --analyze

# Log rotation
docker-compose exec nginx logrotate -f /etc/logrotate.conf
```

## 📞 Support

For deployment issues or questions:

1. Check container logs: `docker-compose logs [service]`
2. Verify health status: `./docker/scripts/deploy.sh --action health`
3. Review environment configuration
4. Consult the main project documentation in `/docs`

## 🔗 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

*This Docker setup provides enterprise-grade containerization for the Account Management Platform with production security, monitoring, and automation capabilities.*