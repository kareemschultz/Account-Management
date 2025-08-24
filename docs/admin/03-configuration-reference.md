# Configuration Reference Guide
*Account Management Platform - Complete Configuration Documentation*

## Table of Contents
1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Database Configuration](#database-configuration)
4. [Application Configuration](#application-configuration)
5. [Security Configuration](#security-configuration)
6. [Docker Configuration](#docker-configuration)
7. [Service Integration Settings](#service-integration-settings)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Performance Tuning](#performance-tuning)
10. [Development vs Production](#development-vs-production)

---

## Overview

This reference guide provides comprehensive documentation for all configuration options, environment variables, and settings available in the Account Management Platform. Use this guide to properly configure your deployment environment.

### Configuration Files Structure
```
/
├── .env.local                    # Local development
├── .env.production              # Production environment
├── .env.staging                 # Staging environment
├── next.config.mjs              # Next.js configuration
├── docker-compose.yml           # Docker development
├── docker-compose.production.yml # Docker production
├── nginx/nginx.conf             # Web server configuration
├── database/postgresql.conf     # Database configuration
└── scripts/config-validator.js  # Configuration validation
```

---

## Environment Variables

### 1. Database Configuration

#### Required Database Variables
```bash
# Primary database connection
DATABASE_URL=postgresql://esm_app:1qazxsw2@localhost:5432/esm_platform

# Individual database components (for manual configuration)
POSTGRES_HOST=localhost           # Database server hostname/IP
POSTGRES_PORT=5432               # Database server port
POSTGRES_DB=esm_platform         # Database name
POSTGRES_USER=esm_app            # Application database user
POSTGRES_PASSWORD=1qazxsw2       # Application database password

# Administrative database access
POSTGRES_ADMIN_USER=postgres     # Database admin user
POSTGRES_ADMIN_PASSWORD=Ajay2628 # Database admin password

# Connection pool settings
DB_POOL_MIN=5                    # Minimum connections in pool
DB_POOL_MAX=20                   # Maximum connections in pool
DB_IDLE_TIMEOUT=30000           # Idle connection timeout (ms)
DB_CONNECTION_TIMEOUT=2000      # Connection timeout (ms)

# Database SSL settings
DB_SSL_MODE=prefer              # SSL mode: disable|allow|prefer|require
DB_SSL_CERT_PATH=               # Path to SSL certificate
DB_SSL_KEY_PATH=                # Path to SSL key
DB_SSL_CA_PATH=                 # Path to CA certificate
```

### 2. Application Core Settings

```bash
# Node.js environment
NODE_ENV=production             # Environment: development|staging|production
PORT=3000                      # Application port
HOST=0.0.0.0                   # Bind address

# Application URLs
NEXT_PUBLIC_APP_URL=https://accounts.yourdomain.com  # Public application URL
NEXT_PUBLIC_API_BASE_URL=https://accounts.yourdomain.com/api  # API base URL

# Internal service URLs
INTERNAL_API_URL=http://localhost:3000/api  # Internal API URL
HEALTH_CHECK_URL=http://localhost:3000/api/health  # Health check endpoint

# Application metadata
APP_NAME="Account Management Platform"
APP_VERSION=2.0.0
APP_DESCRIPTION="Enterprise Account Management System"
SUPPORT_EMAIL=support@yourdomain.com
```

### 3. Authentication & Security

```bash
# NextAuth.js configuration
NEXTAUTH_URL=https://accounts.yourdomain.com  # Authentication base URL
NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters  # NextAuth secret

# JWT configuration
JWT_SECRET=your-jwt-secret-key-minimum-32-characters  # JWT signing secret
JWT_EXPIRY=24h                 # JWT token expiry
JWT_ISSUER=account-management   # JWT issuer
JWT_AUDIENCE=account-users      # JWT audience

# Session management
SESSION_SECRET=your-session-secret-key-minimum-32-characters  # Session secret
SESSION_MAX_AGE=86400          # Session max age (seconds)
SESSION_UPDATE_AGE=3600        # Session update frequency (seconds)

# Password security
PASSWORD_MIN_LENGTH=8          # Minimum password length
PASSWORD_REQUIRE_UPPERCASE=true  # Require uppercase letters
PASSWORD_REQUIRE_LOWERCASE=true  # Require lowercase letters
PASSWORD_REQUIRE_NUMBERS=true   # Require numbers
PASSWORD_REQUIRE_SYMBOLS=true   # Require symbols
PASSWORD_HISTORY_COUNT=5       # Password history to check

# CSRF protection
CSRF_SECRET=your-csrf-secret-key-minimum-32-characters  # CSRF token secret
CSRF_COOKIE_NAME=csrf-token    # CSRF cookie name
CSRF_HEADER_NAME=X-CSRF-Token  # CSRF header name

# Encryption
ENCRYPTION_KEY=exactly-32-character-encryption-key  # Data encryption key
ENCRYPTION_ALGORITHM=aes-256-gcm  # Encryption algorithm

# Rate limiting
RATE_LIMIT_WINDOW=900000       # Rate limit window (15 minutes in ms)
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
RATE_LIMIT_SKIP_SUCCESS=false  # Skip rate limit on successful requests

# Account lockout
ACCOUNT_LOCKOUT_ATTEMPTS=5     # Failed attempts before lockout
ACCOUNT_LOCKOUT_DURATION=1800  # Lockout duration (seconds)
ACCOUNT_LOCKOUT_INCREMENT=true # Increment lockout duration
```

### 4. External Service Integration

```bash
# LDAP Configuration
LDAP_ENABLED=true              # Enable LDAP integration
LDAP_URL=ldap://ldap.yourdomain.com:389  # LDAP server URL
LDAP_BIND_DN=cn=admin,dc=yourdomain,dc=com  # LDAP bind DN
LDAP_BIND_PASSWORD=ldap-admin-password  # LDAP bind password
LDAP_BASE_DN=dc=yourdomain,dc=com  # LDAP search base
LDAP_USER_FILTER=(uid=%s)      # LDAP user filter
LDAP_GROUP_FILTER=(memberUid=%s)  # LDAP group filter
LDAP_SYNC_INTERVAL=3600        # LDAP sync interval (seconds)

# Active Directory
AD_ENABLED=false               # Enable Active Directory
AD_DOMAIN=yourdomain.com       # AD domain
AD_CONTROLLER=dc.yourdomain.com  # Domain controller
AD_BASE_DN=DC=yourdomain,DC=com  # AD base DN
AD_SERVICE_ACCOUNT=service@yourdomain.com  # Service account
AD_SERVICE_PASSWORD=service-password  # Service account password

# Email/SMTP Configuration
SMTP_ENABLED=true              # Enable email notifications
SMTP_HOST=smtp.yourdomain.com  # SMTP server hostname
SMTP_PORT=587                  # SMTP server port
SMTP_SECURE=false             # Use TLS (true for port 465)
SMTP_USER=notifications@yourdomain.com  # SMTP username
SMTP_PASSWORD=smtp-password    # SMTP password
SMTP_FROM=noreply@yourdomain.com  # From email address
SMTP_REPLY_TO=support@yourdomain.com  # Reply-to address

# Notification settings
EMAIL_NOTIFICATIONS_ENABLED=true  # Enable email notifications
EMAIL_DAILY_DIGEST=true        # Send daily digest emails
EMAIL_SECURITY_ALERTS=true     # Send security alert emails
EMAIL_ACCESS_REQUESTS=true     # Send access request emails

# VPN Integration
VPN_FORTIGATE_ENABLED=true     # Enable FortiGate VPN integration
VPN_FORTIGATE_API_URL=https://vpn.yourdomain.com/api  # FortiGate API URL
VPN_FORTIGATE_API_KEY=fortigate-api-key  # FortiGate API key
VPN_FORTIGATE_ADMIN_USER=api_admin  # FortiGate admin user

VPN_MIKROTIK_ENABLED=true      # Enable MikroTik VPN integration
VPN_MIKROTIK_API_URL=https://mikrotik.yourdomain.com/rest  # MikroTik API URL
VPN_MIKROTIK_USERNAME=api_user  # MikroTik username
VPN_MIKROTIK_PASSWORD=mikrotik-password  # MikroTik password

# Monitoring Integration
GRAFANA_ENABLED=true           # Enable Grafana integration
GRAFANA_URL=https://grafana.yourdomain.com  # Grafana URL
GRAFANA_API_KEY=grafana-api-key  # Grafana API key
GRAFANA_ORG_ID=1              # Grafana organization ID

ZABBIX_ENABLED=true            # Enable Zabbix integration
ZABBIX_URL=https://zabbix.yourdomain.com  # Zabbix URL
ZABBIX_USERNAME=api_user       # Zabbix username
ZABBIX_PASSWORD=zabbix-password  # Zabbix password
```

### 5. Caching & Performance

```bash
# Redis Configuration
REDIS_ENABLED=true             # Enable Redis caching
REDIS_URL=redis://localhost:6379  # Redis connection URL
REDIS_HOST=localhost           # Redis hostname
REDIS_PORT=6379               # Redis port
REDIS_PASSWORD=               # Redis password (if required)
REDIS_DB=0                    # Redis database number

# Redis connection pool
REDIS_POOL_MIN=5              # Minimum Redis connections
REDIS_POOL_MAX=20             # Maximum Redis connections
REDIS_IDLE_TIMEOUT=10000      # Redis idle timeout (ms)

# Cache settings
CACHE_TTL_DEFAULT=3600        # Default cache TTL (seconds)
CACHE_TTL_USER_DATA=1800      # User data cache TTL
CACHE_TTL_SERVICE_DATA=7200   # Service data cache TTL
CACHE_TTL_DEPARTMENT_DATA=14400  # Department data cache TTL

# Memory cache settings
MEMORY_CACHE_ENABLED=true     # Enable in-memory caching
MEMORY_CACHE_MAX_SIZE=100     # Max items in memory cache
MEMORY_CACHE_TTL=300          # Memory cache TTL (seconds)

# API response caching
API_CACHE_ENABLED=true        # Enable API response caching
API_CACHE_TTL=600            # API cache TTL (seconds)
API_CACHE_EXCLUDE_ROUTES=/api/auth,/api/health  # Routes to exclude from cache
```

### 6. Logging & Monitoring

```bash
# Logging configuration
LOG_LEVEL=info                # Log level: error|warn|info|debug|trace
LOG_FORMAT=json              # Log format: json|text
LOG_TIMESTAMP=true           # Include timestamps in logs
LOG_FILE_ENABLED=true        # Enable file logging
LOG_FILE_PATH=/var/log/account-management/app.log  # Log file path
LOG_FILE_MAX_SIZE=10mb       # Maximum log file size
LOG_FILE_MAX_FILES=5         # Maximum number of log files

# Database logging
DB_LOG_QUERIES=false         # Log database queries
DB_LOG_SLOW_QUERIES=true     # Log slow queries
DB_SLOW_QUERY_THRESHOLD=1000 # Slow query threshold (ms)

# Audit logging
AUDIT_LOG_ENABLED=true       # Enable audit logging
AUDIT_LOG_LEVEL=info         # Audit log level
AUDIT_LOG_RETENTION_DAYS=2555  # Audit log retention (7 years)

# Performance monitoring
PERFORMANCE_MONITORING=true  # Enable performance monitoring
PERFORMANCE_SAMPLE_RATE=0.1  # Sample rate for performance data
REQUEST_TIMEOUT=30000        # Request timeout (ms)

# Health checks
HEALTH_CHECK_ENABLED=true    # Enable health checks
HEALTH_CHECK_INTERVAL=60000  # Health check interval (ms)
HEALTH_CHECK_TOKEN=health-check-secret-token  # Health check authentication

# Metrics collection
METRICS_ENABLED=true         # Enable metrics collection
METRICS_INTERVAL=60000       # Metrics collection interval (ms)
METRICS_RETENTION_HOURS=168  # Metrics retention (1 week)

# Error tracking
ERROR_TRACKING_ENABLED=true  # Enable error tracking
ERROR_TRACKING_SAMPLE_RATE=1.0  # Error sampling rate
ERROR_TRACKING_DSN=          # External error tracking DSN (Sentry, etc.)
```

### 7. Backup & Maintenance

```bash
# Backup configuration
BACKUP_ENABLED=true          # Enable automated backups
BACKUP_SCHEDULE=0 2 * * *    # Backup cron schedule (daily at 2 AM)
BACKUP_RETENTION_DAYS=30     # Backup retention period
BACKUP_STORAGE_PATH=/backups/account-management  # Backup storage path
BACKUP_COMPRESSION=true      # Enable backup compression
BACKUP_ENCRYPTION=false      # Enable backup encryption

# Database backup
DB_BACKUP_ENABLED=true       # Enable database backups
DB_BACKUP_FORMAT=custom      # Backup format: custom|tar|plain
DB_BACKUP_COMPRESS=9         # Compression level (0-9)

# File backup
FILE_BACKUP_ENABLED=true     # Enable file backups
FILE_BACKUP_EXCLUDE=node_modules,.git,logs,tmp  # Exclude patterns

# Maintenance windows
MAINTENANCE_ENABLED=false    # Enable maintenance mode
MAINTENANCE_MESSAGE=System maintenance in progress  # Maintenance message
MAINTENANCE_START_TIME=02:00  # Maintenance start time
MAINTENANCE_END_TIME=04:00   # Maintenance end time
MAINTENANCE_TIMEZONE=UTC     # Maintenance timezone

# Cleanup tasks
CLEANUP_ENABLED=true         # Enable automatic cleanup
CLEANUP_TEMP_FILES_DAYS=1    # Clean temp files older than X days
CLEANUP_LOG_FILES_DAYS=30    # Clean log files older than X days
CLEANUP_AUDIT_LOGS_DAYS=2555  # Clean audit logs older than X days (7 years)
```

---

## Database Configuration

### 1. PostgreSQL Configuration (postgresql.conf)

```ini
# Connection settings
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory settings
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
work_mem = 4MB                          # For complex queries
maintenance_work_mem = 512MB            # For maintenance operations
wal_buffers = 16MB                      # WAL buffer size

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB

# Query planner settings
random_page_cost = 1.1                  # For SSD storage
effective_io_concurrency = 200          # For SSD storage
default_statistics_target = 100

# Logging settings
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000       # Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'mod'                   # Log data-modifying statements

# Performance monitoring
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all

# Security settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
password_encryption = scram-sha-256
```

### 2. Database Authentication (pg_hba.conf)

```ini
# Database authentication configuration

# Local connections
local   all             postgres                                peer
local   all             all                                     peer

# IPv4 local connections
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# Application connections
host    esm_platform    esm_app         127.0.0.1/32           scram-sha-256
host    esm_platform    esm_app         10.0.0.0/8             scram-sha-256
host    esm_platform    esm_app         172.16.0.0/12          scram-sha-256
host    esm_platform    esm_app         192.168.0.0/16         scram-sha-256

# Backup connections
host    esm_platform    backup_user     192.168.1.100/32       scram-sha-256

# Monitoring connections
host    esm_platform    monitor_user    192.168.1.0/24         scram-sha-256

# Replication connections (if needed)
host    replication     replicator      192.168.1.0/24         scram-sha-256
```

### 3. Database Performance Tuning

```sql
-- Performance optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Index optimization
CREATE INDEX CONCURRENTLY idx_users_username_active 
ON users (username) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_user_service_access_active 
ON user_service_access (user_id, service_id) WHERE access_level != 'none';

CREATE INDEX CONCURRENTLY idx_audit_logs_performed_at 
ON audit_logs (performed_at);

CREATE INDEX CONCURRENTLY idx_audit_logs_user_action 
ON audit_logs (user_id, action, performed_at);

-- Maintenance tasks
CREATE OR REPLACE FUNCTION maintenance_cleanup()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Reindex if needed
    REINDEX INDEX CONCURRENTLY idx_users_username_active;
    
    -- Clean up old connections
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle in transaction'
        AND state_change < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance
SELECT cron.schedule('database-maintenance', '0 2 * * *', 'SELECT maintenance_cleanup();');
```

---

## Application Configuration

### 1. Next.js Configuration (next.config.mjs)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Public runtime config
  publicRuntimeConfig: {
    APP_NAME: process.env.APP_NAME,
    APP_VERSION: process.env.APP_VERSION,
  },
  
  // Server runtime config
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API routing
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configuration
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['pg'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // Generate build ID
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'development';
  },
};

export default nextConfig;
```

### 2. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/types/*": ["./lib/types/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 3. Tailwind CSS Configuration (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Account Management Color Palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Permission level colors
        permission: {
          admin: '#7c3aed',
          manager: '#2563eb',
          user: '#059669',
          blocked: '#dc2626',
        },
        // Account status colors
        status: {
          active: '#059669',
          suspended: '#d97706',
          pending: '#7c3aed',
          expired: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
```

---

## Security Configuration

### 1. Security Headers Configuration

```javascript
// lib/security-headers.ts
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'on',
};

// Apply security headers middleware
export function withSecurityHeaders(handler) {
  return async (req, res) => {
    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return handler(req, res);
  };
}
```

### 2. CORS Configuration

```javascript
// lib/cors-config.ts
export const corsConfig = {
  origin: [
    'https://yourdomain.com',
    'https://accounts.yourdomain.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin',
  ],
  maxAge: 86400, // 24 hours
};
```

### 3. Rate Limiting Configuration

```javascript
// lib/rate-limit.ts
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/api/health';
  },
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.connection.remoteAddress;
  },
};

// API-specific rate limits
export const apiRateLimits = {
  '/api/auth/signin': { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  '/api/users': { max: 50, windowMs: 60 * 1000 }, // 50 requests per minute
  '/api/services': { max: 30, windowMs: 60 * 1000 }, // 30 requests per minute
};
```

---

## Docker Configuration

### 1. Development Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://esm_app:1qazxsw2@db:5432/esm_platform
      - NEXTAUTH_URL=http://localhost:3000
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:17.6
    environment:
      - POSTGRES_DB=esm_platform
      - POSTGRES_USER=esm_app
      - POSTGRES_PASSWORD=1qazxsw2
      - POSTGRES_ROOT_PASSWORD=Ajay2628
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/performance-optimization.sql:/docker-entrypoint-initdb.d/02-optimization.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 2. Production Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://esm_app:1qazxsw2@db:5432/esm_platform
      - NEXTAUTH_URL=https://accounts.yourdomain.com
      - REDIS_URL=redis://redis:6379
    volumes:
      - app_data:/app/data
      - logs:/app/logs
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/ssl/certs
      - logs:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped

  db:
    image: postgres:17.6
    environment:
      - POSTGRES_DB=esm_platform
      - POSTGRES_USER=esm_app
      - POSTGRES_PASSWORD=1qazxsw2
      - POSTGRES_ROOT_PASSWORD=Ajay2628
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
      - ./database/postgresql.conf:/etc/postgresql/postgresql.conf
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped

  backup:
    image: postgres:17.6
    environment:
      - PGPASSWORD=Ajay2628
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh
    command: /bin/bash -c "chmod +x /backup.sh && cron -f"
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  app_data:
  logs:
```

### 3. Dockerfile Configuration

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create directories
RUN mkdir -p /app/logs /app/data
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Service Integration Settings

### 1. LDAP Integration Configuration

```javascript
// lib/ldap-config.ts
export const ldapConfig = {
  enabled: process.env.LDAP_ENABLED === 'true',
  url: process.env.LDAP_URL || 'ldap://localhost:389',
  bindDN: process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
  bindCredentials: process.env.LDAP_BIND_PASSWORD || 'admin',
  searchBase: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
  searchFilter: process.env.LDAP_USER_FILTER || '(uid={{username}})',
  searchAttributes: [
    'uid', 'cn', 'mail', 'givenName', 'sn', 'employeeNumber',
    'department', 'title', 'telephoneNumber', 'manager'
  ],
  groupSearchBase: process.env.LDAP_GROUP_BASE || 'ou=groups,dc=example,dc=com',
  groupSearchFilter: process.env.LDAP_GROUP_FILTER || '(memberUid={{username}})',
  groupSearchAttributes: ['cn', 'description'],
  cache: true,
  reconnect: {
    initialDelay: 100,
    maxDelay: 30000,
    failAfter: 5,
  },
  timeout: 5000,
  connectTimeout: 10000,
  idleTimeout: 30000,
};
```

### 2. VPN Integration Configuration

```javascript
// lib/vpn-config.ts
export const vpnConfigs = {
  fortigate: {
    enabled: process.env.VPN_FORTIGATE_ENABLED === 'true',
    apiUrl: process.env.VPN_FORTIGATE_API_URL,
    apiKey: process.env.VPN_FORTIGATE_API_KEY,
    adminUser: process.env.VPN_FORTIGATE_ADMIN_USER,
    defaultUserGroup: 'employees',
    defaultPolicy: 'standard_access',
    sessionTimeout: 28800, // 8 hours
    idleTimeout: 3600, // 1 hour
    concurrentSessions: 3,
    bandwidth: {
      upload: 10240, // 10 Mbps
      download: 51200, // 50 Mbps
    },
  },
  mikrotik: {
    enabled: process.env.VPN_MIKROTIK_ENABLED === 'true',
    apiUrl: process.env.VPN_MIKROTIK_API_URL,
    username: process.env.VPN_MIKROTIK_USERNAME,
    password: process.env.VPN_MIKROTIK_PASSWORD,
    defaultProfile: 'employee_vpn',
    poolName: 'employee_pool',
    encryption: 'aes256',
    authentication: 'sha256',
  },
};
```

### 3. Monitoring Integration Configuration

```javascript
// lib/monitoring-config.ts
export const monitoringConfigs = {
  grafana: {
    enabled: process.env.GRAFANA_ENABLED === 'true',
    url: process.env.GRAFANA_URL,
    apiKey: process.env.GRAFANA_API_KEY,
    orgId: parseInt(process.env.GRAFANA_ORG_ID || '1'),
    defaultDashboard: 'account-management-overview',
    dataSources: {
      prometheus: 'Prometheus',
      postgres: 'PostgreSQL',
    },
  },
  zabbix: {
    enabled: process.env.ZABBIX_ENABLED === 'true',
    url: process.env.ZABBIX_URL,
    username: process.env.ZABBIX_USERNAME,
    password: process.env.ZABBIX_PASSWORD,
    defaultHostGroup: 'Account Management',
    defaultTemplate: 'Linux by Zabbix agent',
  },
  healthChecks: {
    database: {
      enabled: true,
      interval: 60000, // 1 minute
      timeout: 5000,
      retries: 3,
    },
    redis: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 2000,
      retries: 2,
    },
    external_services: {
      enabled: true,
      interval: 300000, // 5 minutes
      timeout: 10000,
      retries: 2,
    },
  },
};
```

---

## Monitoring and Logging

### 1. Application Logging Configuration

```javascript
// lib/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat === 'json' 
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.simple()
      ),
  defaultMeta: { 
    service: 'account-management',
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    ...(process.env.LOG_FILE_ENABLED === 'true' ? [
      new winston.transports.File({
        filename: process.env.LOG_FILE_PATH || '/var/log/account-management/app.log',
        maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE || '10485760'), // 10MB
        maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5'),
        tailable: true,
      })
    ] : [])
  ],
});

// Audit logger
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'account-management-audit',
    type: 'audit'
  },
  transports: [
    new winston.transports.File({
      filename: '/var/log/account-management/audit.log',
      maxsize: 52428800, // 50MB
      maxFiles: 50,
      tailable: true,
    })
  ],
});
```

### 2. Performance Monitoring Configuration

```javascript
// lib/performance-config.ts
export const performanceConfig = {
  enabled: process.env.PERFORMANCE_MONITORING === 'true',
  sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
  thresholds: {
    database_query: 1000, // 1 second
    api_response: 2000, // 2 seconds
    page_load: 3000, // 3 seconds
  },
  metrics: {
    collection_interval: parseInt(process.env.METRICS_INTERVAL || '60000'),
    retention_hours: parseInt(process.env.METRICS_RETENTION_HOURS || '168'),
    export_format: 'prometheus',
  },
  alerts: {
    error_rate_threshold: 0.05, // 5%
    response_time_threshold: 5000, // 5 seconds
    memory_usage_threshold: 0.9, // 90%
    cpu_usage_threshold: 0.8, // 80%
  },
};
```

---

## Performance Tuning

### 1. Database Performance Settings

```sql
-- Database performance optimization
-- Connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Query optimization
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET default_statistics_target = 100;

-- WAL settings
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- Enable query monitoring
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET track_io_timing = on;

-- Apply settings
SELECT pg_reload_conf();
```

### 2. Application Performance Settings

```javascript
// lib/performance-optimization.ts
export const performanceSettings = {
  // Database connection pooling
  database: {
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idle: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    },
    query: {
      timeout: 30000,
      retry: {
        attempts: 3,
        delay: 1000,
      },
    },
  },
  
  // Caching configuration
  cache: {
    redis: {
      ttl: {
        default: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
        user_data: parseInt(process.env.CACHE_TTL_USER_DATA || '1800'),
        service_data: parseInt(process.env.CACHE_TTL_SERVICE_DATA || '7200'),
      },
      pool: {
        min: parseInt(process.env.REDIS_POOL_MIN || '5'),
        max: parseInt(process.env.REDIS_POOL_MAX || '20'),
      },
    },
    memory: {
      enabled: process.env.MEMORY_CACHE_ENABLED === 'true',
      maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '100'),
      ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300'),
    },
  },
  
  // API optimization
  api: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    pagination: {
      defaultLimit: 25,
      maxLimit: 100,
    },
    compression: {
      enabled: true,
      threshold: 1024,
    },
  },
  
  // Asset optimization
  assets: {
    compression: true,
    minification: true,
    bundleSplitting: true,
    lazyLoading: true,
  },
};
```

---

## Development vs Production

### 1. Development Configuration

```bash
# .env.local (Development)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://esm_app:1qazxsw2@localhost:5432/esm_platform_dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development-specific settings
DEBUG=true
LOG_LEVEL=debug
REACT_STRICT_MODE=true

# Relaxed security for development
CSRF_ENABLED=false
RATE_LIMITING_ENABLED=false
SSL_REQUIRED=false

# Development tools
NEXT_TELEMETRY_DISABLED=1
WEBPACK_BUNDLE_ANALYZER=false
```

### 2. Production Configuration

```bash
# .env.production (Production)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://esm_app:1qazxsw2@db:5432/esm_platform
NEXT_PUBLIC_APP_URL=https://accounts.yourdomain.com

# Production security
DEBUG=false
LOG_LEVEL=warn
REACT_STRICT_MODE=false

# Enhanced security
CSRF_ENABLED=true
RATE_LIMITING_ENABLED=true
SSL_REQUIRED=true
FORCE_HTTPS=true

# Production optimizations
NEXT_TELEMETRY_DISABLED=1
COMPRESSION_ENABLED=true
CACHE_CONTROL_MAX_AGE=31536000
```

### 3. Configuration Validation Script

```javascript
// scripts/config-validator.js
const requiredEnvVars = {
  production: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'NEXTAUTH_URL',
    'POSTGRES_PASSWORD',
  ],
  development: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
  ],
};

function validateConfiguration() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }
  
  // Validate URLs
  if (process.env.NEXTAUTH_URL && !isValidUrl(process.env.NEXTAUTH_URL)) {
    console.error('Invalid NEXTAUTH_URL format');
    process.exit(1);
  }
  
  // Validate database URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('DATABASE_URL must be a valid PostgreSQL connection string');
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

validateConfiguration();
```

---

*Last Updated: 2025-08-22*  
*Document Version: 1.0*  
*Next Review Date: 2025-09-22*