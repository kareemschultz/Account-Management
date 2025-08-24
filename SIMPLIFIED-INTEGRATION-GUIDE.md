# Simplified Integration Configuration Guide

## 🎯 Objective
Transform the Account Management Platform from development/mock mode to production-ready with real service integrations following documented APIs.

## 🚀 Quick Integration Setup

### 1. Environment Configuration

Create or update your `.env.local` file:

```bash
# === CORE APPLICATION ===
NODE_ENV=production
NEXTAUTH_SECRET=your-super-secure-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# === DATABASE (Optional - Mock DB works) ===
DATABASE_URL=postgresql://user:password@host:5432/esm_platform

# === HIGH PRIORITY SERVICE INTEGRATIONS ===

# LDAP/Active Directory
LDAP_URL=ldap://ldap.company.com:389
LDAP_BIND_DN="CN=ESM Service,OU=Service Accounts,DC=company,DC=com"
LDAP_BIND_PASSWORD=your-ldap-service-account-password
LDAP_BASE_DN="OU=Users,DC=company,DC=com"

# Grafana Monitoring
GRAFANA_API_URL=https://grafana.company.com
GRAFANA_API_KEY=eyJrIjoiYWRtaW4tc2VydmljZS1hY2NvdW50LXRva2VuLWhlcmU

# Teleport Secure Access
TELEPORT_PROXY_URL=https://teleport.company.com:443
TELEPORT_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.service-account-token-here

# === MEDIUM PRIORITY INTEGRATIONS ===

# Unifi Network Controller
UNIFI_CONTROLLER_URL=https://unifi.company.com:8443
UNIFI_USERNAME=admin
UNIFI_PASSWORD=your-unifi-password

# Zabbix Monitoring
ZABBIX_API_URL=https://zabbix.company.com/api_jsonrpc.php
ZABBIX_API_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# RADIUS Authentication
RADIUS_SERVER=radius.company.com
RADIUS_PORT=1812
RADIUS_SHARED_SECRET=your-radius-shared-secret

# === SPECIALIZED INTEGRATIONS (Configure as needed) ===

# IPAM (IP Address Management)
IPAM_API_URL=https://ipam.company.com
IPAM_API_KEY=your-ipam-api-key

# Elasticsearch/Kibana
ELASTICSEARCH_API_KEY=base64-encoded-api-key-here
KIBANA_URL=https://kibana.company.com

# VPN Gateways
MIKROTIK_API_URL=https://mikrotik.company.com
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=your-mikrotik-password

FORTIGATE_API_URL=https://fortigate.company.com
FORTIGATE_API_KEY=your-fortigate-api-key

# === VENDOR-SPECIFIC (Huawei, etc.) ===
NETECO_API_URL=https://neteco.company.com
NETECO_USERNAME=admin
NETECO_PASSWORD=your-neteco-password

ESIGHT_API_URL=https://esight.company.com
ESIGHT_USERNAME=admin  
ESIGHT_PASSWORD=your-esight-password
```

### 2. Service Integration Priority

#### Phase 1: Core Services (Week 1)
Start with these 3 services for immediate value:

1. **LDAP/Active Directory** - Primary user source
2. **Grafana** - Most used monitoring service  
3. **Teleport** - Critical security service

#### Phase 2: Network Services (Week 2)
Add network infrastructure:

4. **Unifi Controller** - Network management
5. **RADIUS** - Network authentication
6. **VPN Services** - Remote access

#### Phase 3: Monitoring & Analytics (Week 3)
Complete monitoring stack:

7. **Zabbix** - Infrastructure monitoring
8. **Kibana** - Log analytics
9. **IPAM** - IP management

#### Phase 4: Specialized Services (Week 4)
Add enterprise-specific services:

10-16. **Vendor Services** - ITop, NetEco, eSight, etc.

### 3. Integration Testing Steps

For each service integration:

```bash
# 1. Test connection via health check endpoint
curl -X GET https://your-domain.com/api/integration/grafana/health

# 2. Test authentication
curl -X POST https://your-domain.com/api/integration/grafana/health \
  -H "Content-Type: application/json" \
  -d '{"testType": "connection"}'

# 3. Test user sync
curl -X POST https://your-domain.com/api/integration/grafana/sync \
  -H "Content-Type: application/json"

# 4. Verify in application UI
# Navigate to /integrations and check service status
```

## 🎛️ Using the Modal Interface

### Adding New Service Integration

1. **Navigate to Integrations** - Go to `/integrations` page
2. **Click "Add Integration"** - Green button in top right
3. **Select Service Template** - Choose from 16 predefined services
4. **Configure Service** - Fill in URL, version, sync settings
5. **Set Authentication** - Choose appropriate auth method and credentials
6. **Test Connection** - Use "Test Connection" button to validate
7. **Save Integration** - Service will be added to the platform

### Editing Existing Service

1. **Find Service** - Locate service in the integrations table
2. **Click Edit Button** - Pencil icon in Actions column
3. **Modify Configuration** - Update any settings across 4 tabs:
   - General: Name, category, description, status
   - Connection: URL, auth method, credentials
   - Sync Settings: Intervals, enable/disable
   - Health Check: Monitor configuration
4. **Test Changes** - Validate connection before saving
5. **Save Updates** - Apply changes to service

### Managing Service Health

1. **Monitor Status** - Green/red indicators show service health
2. **Individual Sync** - Click refresh icon to sync specific service
3. **Test Connection** - Click test tube icon to validate connectivity
4. **View Details** - Service URLs and last sync times displayed
5. **Master Sync** - "Sync All Services" button for bulk operations

## 🔧 Service-Specific Configuration

### LDAP/Active Directory
```javascript
// Real implementation replaces mock in:
// app/api/integration/ldap/sync/route.ts

import { Client } from 'ldapts'

const ldapClient = new Client({
  url: process.env.LDAP_URL,
  timeout: 30000,
  connectTimeout: 10000,
})

await ldapClient.bind(
  process.env.LDAP_BIND_DN,
  process.env.LDAP_BIND_PASSWORD
)

const searchResult = await ldapClient.search(process.env.LDAP_BASE_DN, {
  scope: 'sub',
  filter: '(objectClass=user)',
  attributes: ['sAMAccountName', 'displayName', 'mail', 'department']
})
```

### Grafana Monitoring
```javascript
// Real implementation replaces mock in:
// app/api/integration/grafana/sync/route.ts

const response = await fetch(`${process.env.GRAFANA_API_URL}/api/org/users`, {
  headers: {
    'Authorization': `Bearer ${process.env.GRAFANA_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

const users = await response.json()
```

### Teleport Secure Access
```javascript
// Real implementation replaces mock in:
// app/api/integration/teleport/sync/route.ts

const response = await fetch(`${process.env.TELEPORT_PROXY_URL}/v1/users`, {
  headers: {
    'Authorization': `Bearer ${process.env.TELEPORT_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

const users = await response.json()
```

## 🔒 Security Best Practices

### 1. Credential Management
- Store all API keys and passwords in environment variables
- Use HashiCorp Vault or similar for production secrets
- Implement API key rotation schedules
- Never expose credentials in error messages

### 2. Network Security
- Use VPN or private networks for service connections
- Implement IP whitelisting where possible
- Use TLS/SSL for all API communications
- Monitor API access patterns for anomalies

### 3. Access Control
- Use least-privilege service accounts
- Implement rate limiting and retry logic
- Log all API access for audit trails
- Set up alerts for authentication failures

## 🔍 Troubleshooting Common Issues

### Connection Timeouts
```bash
# Check network connectivity
ping grafana.company.com
telnet grafana.company.com 443

# Test DNS resolution
nslookup grafana.company.com

# Validate SSL certificate
openssl s_client -connect grafana.company.com:443
```

### Authentication Failures
1. **Verify Credentials** - Check username/password or API key
2. **Check Permissions** - Ensure service account has required permissions
3. **Validate Token Expiry** - Renew expired tokens
4. **Test Direct API** - Use curl to test service API directly

### API Response Issues
1. **Check Service Version** - Ensure API version compatibility
2. **Validate Data Format** - Check response schema matches expectations
3. **Monitor Rate Limits** - Implement backoff for rate-limited APIs
4. **Handle Error Codes** - Add proper error handling for HTTP status codes

## 📊 Monitoring & Alerts

### Health Check Setup
- All services have health check endpoints
- Monitor response times and availability
- Set up alerts for service failures
- Track API usage and performance metrics

### Operational Metrics
- User sync success rates
- Service availability percentages  
- API response time distributions
- Error rate tracking by service

## 🎯 Success Criteria

### Integration Complete When:
- [x] Service appears in integrations page with "Connected" status
- [x] Health check endpoint returns successful response
- [x] User sync operations complete without errors
- [x] Service metrics are collected and displayed
- [x] Error handling works for service failures

### Production Ready When:
- [x] All critical services (LDAP, Grafana, Teleport) integrated
- [x] Authentication and authorization working
- [x] Monitoring and alerting configured
- [x] Error handling and logging operational
- [x] Performance metrics within acceptable ranges

---

## 📚 Additional Resources

- **Complete API Documentation:** `docs/technical/service-apis-documentation.md`
- **Modal Functionality Guide:** `docs/technical/modal-functionality-summary.md`
- **Production Deployment:** `PRODUCTION-READINESS-CHECKLIST.md`
- **Source of Truth:** `CLAUDE.md`

*For detailed technical implementation, see the complete documentation in the docs/ directory.*