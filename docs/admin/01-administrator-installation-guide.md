# Administrator Installation Guide
*Account Management Platform - Enterprise Deployment*

## Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Pre-Installation Checklist](#pre-installation-checklist)
4. [Database Setup](#database-setup)
5. [Application Installation](#application-installation)
6. [Docker Deployment](#docker-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Security Configuration](#security-configuration)
9. [Post-Installation Verification](#post-installation-verification)
10. [Production Deployment](#production-deployment)

---

## Overview

The Account Management Platform is an enterprise-grade web application designed to manage 245+ employee accounts across 16 IT services and 18 departments. This guide provides complete step-by-step installation instructions for administrators.

### Architecture Overview
- **Frontend:** Next.js 15.2.4 with React 19
- **Database:** PostgreSQL 17.6
- **Runtime:** Node.js 18+
- **Deployment:** Docker containers with nginx reverse proxy
- **Monitoring:** Built-in health checks and metrics

---

## System Requirements

### Minimum Requirements
- **OS:** Windows Server 2019+, Ubuntu 20.04+, CentOS 8+
- **CPU:** 4 cores, 2.4GHz
- **Memory:** 8GB RAM
- **Storage:** 100GB SSD
- **Network:** 1Gbps connection

### Recommended Production Requirements
- **OS:** Ubuntu 22.04 LTS or Windows Server 2022
- **CPU:** 8 cores, 3.0GHz+
- **Memory:** 16GB RAM
- **Storage:** 500GB NVMe SSD
- **Network:** 10Gbps connection
- **Backup:** Separate backup storage system

### Software Dependencies
```bash
# Required Software
- Node.js 18.17.0+
- PostgreSQL 17.6
- Docker 24.0+
- Docker Compose 2.20+
- Git 2.30+
- nginx 1.20+ (for production)
```

---

## Pre-Installation Checklist

### 1. Network Configuration
- [ ] Firewall ports configured (80, 443, 5432, 3000)
- [ ] DNS records configured for domain
- [ ] SSL certificates obtained
- [ ] Load balancer configured (if applicable)

### 2. Security Preparation
- [ ] Service accounts created
- [ ] Database credentials secured
- [ ] SSL certificates installed
- [ ] Security scanning completed
- [ ] Backup storage configured

### 3. Database Preparation
- [ ] PostgreSQL server installed and configured
- [ ] Database user created with appropriate permissions
- [ ] Connection testing completed
- [ ] Backup procedures tested

---

## Database Setup

### 1. PostgreSQL Installation

#### Windows Installation
```powershell
# Download PostgreSQL 17.6 installer
# https://www.postgresql.org/download/windows/

# Run installer with these settings:
# - Port: 5432
# - Superuser password: Ajay2628
# - Locale: Default

# Verify installation
psql --version
```

#### Linux Installation (Ubuntu)
```bash
# Add PostgreSQL official repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update

# Install PostgreSQL 17
sudo apt-get install postgresql-17 postgresql-client-17 postgresql-contrib-17

# Set postgres user password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Ajay2628';"
```

### 2. Database Configuration

#### Create Database and User
```sql
-- Connect as postgres superuser
psql -U postgres -h localhost

-- Create database
CREATE DATABASE esm_platform;

-- Create application user
CREATE USER esm_app WITH PASSWORD '1qazxsw2';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE esm_platform TO esm_app;
GRANT ALL ON SCHEMA public TO esm_app;
ALTER USER esm_app CREATEDB;

-- Verify connection
\q
psql -U esm_app -d esm_platform -h localhost
```

#### Configure PostgreSQL Settings
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/17/main/postgresql.conf

# Key settings for production:
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### Configure Authentication
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/17/main/pg_hba.conf

# Add these lines for application access:
host    esm_platform    esm_app         127.0.0.1/32    md5
host    esm_platform    esm_app         ::1/128         md5
host    esm_platform    postgres        127.0.0.1/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Database Schema Deployment

```bash
# Navigate to project directory
cd /path/to/Account Management

# Deploy database schema
psql -U esm_app -d esm_platform -h localhost -f database/schema.sql

# Apply performance optimizations
psql -U esm_app -d esm_platform -h localhost -f database/performance-optimization.sql

# Verify schema deployment
psql -U esm_app -d esm_platform -h localhost -c "\dt"
```

---

## Application Installation

### 1. Source Code Deployment

```bash
# Clone repository
git clone https://github.com/kareemschultz/Account-Management.git
cd Account-Management

# Install Node.js dependencies
npm install

# Verify installation
npm list
```

### 2. Environment Configuration

Create production environment file:
```bash
# Create .env.production
cat > .env.production << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://esm_app:1qazxsw2@localhost:5432/esm_platform
POSTGRES_USER=esm_app
POSTGRES_PASSWORD=1qazxsw2
POSTGRES_DB=esm_platform
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://accounts.yourdomain.com

# Authentication
NEXTAUTH_URL=https://accounts.yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
JWT_SECRET=another-super-secret-key-for-jwt-min-32-chars

# Security
CSRF_SECRET=csrf-secret-key-min-32-chars
SESSION_SECRET=session-secret-key-min-32-chars
ENCRYPTION_KEY=encryption-key-exactly-32-characters

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration (for notifications)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourdomain.com

# Monitoring
HEALTH_CHECK_TOKEN=health-check-secret-token
MONITORING_ENABLED=true

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
EOF
```

### 3. Build Application

```bash
# Build for production
npm run build

# Verify build
ls -la .next/

# Test production build locally
npm start
```

---

## Docker Deployment

### 1. Docker Installation

#### Windows
```powershell
# Download Docker Desktop for Windows
# https://docs.docker.com/desktop/install/windows-install/

# Verify installation
docker --version
docker-compose --version
```

#### Linux
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Production Docker Deployment

```bash
# Copy production docker compose file
cp docker-compose.production.yml docker-compose.yml

# Create required directories
mkdir -p logs backups nginx/ssl

# Set environment variables
export POSTGRES_PASSWORD=Ajay2628
export APP_PASSWORD=1qazxsw2

# Deploy with Docker Compose
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f app
```

### 3. SSL Certificate Configuration

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy SSL certificates
cp /path/to/your-domain.crt nginx/ssl/
cp /path/to/your-domain.key nginx/ssl/

# Update nginx configuration
sudo nano nginx/nginx.conf

# Reload nginx
docker-compose restart nginx
```

---

## Environment Configuration

### 1. Production Environment Variables

```bash
# Set system environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://esm_app:1qazxsw2@db:5432/esm_platform
export NEXTAUTH_URL=https://accounts.yourdomain.com

# Create systemd environment file
sudo tee /etc/environment << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://esm_app:1qazxsw2@localhost:5432/esm_platform
NEXTAUTH_URL=https://accounts.yourdomain.com
PORT=3000
EOF
```

### 2. Service Configuration

Create systemd service for non-Docker deployment:
```bash
sudo tee /etc/systemd/system/account-management.service << 'EOF'
[Unit]
Description=Account Management Platform
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/account-management
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/etc/environment

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable account-management
sudo systemctl start account-management
```

---

## Security Configuration

### 1. Firewall Configuration

```bash
# Ubuntu UFW configuration
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5432/tcp    # PostgreSQL (internal only)
sudo ufw enable

# Windows Firewall
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
```

### 2. Database Security

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create restricted user for application
CREATE ROLE esm_readonly WITH LOGIN PASSWORD '1qazxsw2';
GRANT CONNECT ON DATABASE esm_platform TO esm_readonly;
GRANT USAGE ON SCHEMA public TO esm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO esm_readonly;

-- Set up row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_service_access ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY user_department_policy ON users
  FOR ALL TO esm_app
  USING (department = current_setting('app.current_department', true));
```

### 3. SSL/TLS Configuration

```nginx
# nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name accounts.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Post-Installation Verification

### 1. System Health Checks

```bash
# Check application status
curl -f http://localhost:3000/api/health

# Check database connection
psql -U esm_app -d esm_platform -h localhost -c "SELECT version();"

# Check Docker services
docker-compose ps
docker-compose logs --tail=50 app

# Check system resources
htop
df -h
free -h
```

### 2. Database Verification

```sql
-- Connect to database
psql -U esm_app -d esm_platform -h localhost

-- Verify tables exist
\dt

-- Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM user_service_access;

-- Test queries
SELECT u.username, d.name as department 
FROM users u 
JOIN departments d ON u.department_id = d.id 
LIMIT 5;
```

### 3. Application Testing

```bash
# Test web interface
curl -f https://accounts.yourdomain.com

# Test API endpoints
curl -f https://accounts.yourdomain.com/api/health
curl -f https://accounts.yourdomain.com/api/users/optimized

# Test authentication
curl -X POST https://accounts.yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'
```

---

## Production Deployment

### 1. Pre-Production Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed and tested
- [ ] Database backup and recovery tested
- [ ] Load testing completed
- [ ] Security scanning completed
- [ ] Monitoring and alerting configured
- [ ] Documentation reviewed and updated

### 2. Go-Live Procedure

```bash
# 1. Final backup of existing system
pg_dump -U postgres -h localhost esm_platform > backup_pre_golive.sql

# 2. Deploy production code
git checkout main
git pull origin main
npm run build

# 3. Restart services
docker-compose down
docker-compose up -d

# 4. Verify deployment
./scripts/healthcheck.sh

# 5. Monitor logs
docker-compose logs -f app
tail -f /var/log/nginx/access.log
```

### 3. Rollback Procedure

```bash
# Emergency rollback steps
echo "EMERGENCY ROLLBACK PROCEDURE"

# 1. Stop current deployment
docker-compose down

# 2. Restore previous code version
git checkout previous-release-tag

# 3. Restore database if needed
psql -U postgres -h localhost esm_platform < backup_pre_golive.sql

# 4. Restart with previous version
docker-compose up -d

# 5. Verify rollback
curl -f https://accounts.yourdomain.com/api/health
```

### 4. Post-Deployment Tasks

```bash
# Update monitoring dashboards
# Configure automated backups
# Set up log rotation
# Schedule maintenance windows
# Update documentation
# Train support staff
```

---

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U esm_app -d esm_platform -h localhost

# Check logs
sudo tail -f /var/log/postgresql/postgresql-17-main.log
```

### Application Startup Issues
```bash
# Check Node.js version
node --version

# Check environment variables
env | grep -E "(DATABASE_URL|NODE_ENV|PORT)"

# Check application logs
docker-compose logs app
tail -f logs/app.log
```

### Performance Issues
```bash
# Check system resources
htop
iostat 1
sar -u 1

# Check database performance
psql -U esm_app -d esm_platform -c "SELECT * FROM pg_stat_activity;"

# Check application metrics
curl https://accounts.yourdomain.com/api/monitoring/metrics
```

---

## Support and Maintenance

### Log Locations
- **Application Logs:** `/var/log/account-management/`
- **Database Logs:** `/var/log/postgresql/`
- **Web Server Logs:** `/var/log/nginx/`
- **System Logs:** `/var/log/syslog`

### Monitoring Endpoints
- **Health Check:** `https://accounts.yourdomain.com/api/health`
- **Metrics:** `https://accounts.yourdomain.com/api/monitoring/metrics`
- **Database Status:** `https://accounts.yourdomain.com/api/monitoring/health`

### Emergency Contacts
- **Project Lead:** Kareem Schultz
- **Database Administrator:** [To be assigned]
- **System Administrator:** [To be assigned]
- **Security Team:** [To be assigned]

---

*Last Updated: 2025-08-22*  
*Document Version: 1.0*  
*Next Review Date: 2025-09-22*