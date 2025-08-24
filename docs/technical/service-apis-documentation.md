# Service APIs Documentation for Production Implementation

This document provides real API endpoints, authentication methods, and integration patterns for all 16 services in the ESM Platform.

## Overview

The current implementation uses mock APIs for development and testing. This documentation provides the roadmap for implementing real API integrations for production deployment.

## Service Integration Status

| Service | API Available | Auth Method | Documentation | Priority |
|---------|--------------|-------------|---------------|----------|
| LDAP/Active Directory | ✅ | LDAP Bind/SASL | Microsoft Docs | High |
| Grafana | ✅ | API Key/Basic | Grafana API Docs | High |
| Teleport | ✅ | JWT/Certificate | Teleport API Docs | High |
| Unifi Network | ✅ | Username/Password | Unifi Controller API | Medium |
| Zabbix | ✅ | API Token | Zabbix API Docs | Medium |
| RADIUS | ⚠️ | Shared Secret | RFC 2865/Custom | Medium |
| IPAM | ⚠️ | API Key | Vendor Specific | Medium |
| Kibana | ✅ | Elasticsearch Auth | Elastic API Docs | Medium |
| ITop | ✅ | Basic Auth/API Key | iTop REST API | Low |
| NetEco | ⚠️ | Proprietary | Huawei Docs | Low |
| eSight | ⚠️ | Proprietary | Huawei Docs | Low |
| Mikrotik VPN | ✅ | RouterOS API | Mikrotik Wiki | Medium |
| FortiGate VPN | ✅ | API Key | Fortinet API Docs | Medium |
| NOC Services | ⚠️ | Custom | Internal Docs | Low |
| Biometrics | ⚠️ | Vendor Specific | Vendor Docs | Low |
| Eight Sight | ⚠️ | API Key | Vendor Docs | Low |

## High Priority Integrations

### 1. LDAP/Active Directory
**API Type:** LDAP Protocol  
**Authentication:** LDAP Bind, SASL  
**Documentation:** https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/  

```javascript
// Production Implementation Example
import { Client } from 'ldapts'

const ldapClient = new Client({
  url: 'ldap://ldap.company.com',
  timeout: 30000,
  connectTimeout: 10000,
})

async function syncLDAPUsers() {
  await ldapClient.bind('CN=Service Account,OU=Accounts,DC=company,DC=com', 'password')
  
  const searchResult = await ldapClient.search('OU=Users,DC=company,DC=com', {
    scope: 'sub',
    filter: '(objectClass=user)',
    attributes: ['sAMAccountName', 'displayName', 'mail', 'department']
  })
  
  return searchResult.searchEntries
}
```

**Environment Variables:**
- `LDAP_URL`: LDAP server URL
- `LDAP_BIND_DN`: Service account DN
- `LDAP_BIND_PASSWORD`: Service account password
- `LDAP_BASE_DN`: Base DN for user search

### 2. Grafana Monitoring
**API Type:** REST API  
**Authentication:** API Key, Basic Auth  
**Documentation:** https://grafana.com/docs/grafana/latest/developers/http_api/  

```javascript
// Production Implementation Example
const GRAFANA_API_URL = 'https://grafana.company.com/api'
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY

async function syncGrafanaUsers() {
  const response = await fetch(`${GRAFANA_API_URL}/org/users`, {
    headers: {
      'Authorization': `Bearer ${GRAFANA_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Grafana API error: ${response.status}`)
  }
  
  return await response.json()
}

async function healthCheckGrafana() {
  const response = await fetch(`${GRAFANA_API_URL}/health`, {
    headers: { 'Authorization': `Bearer ${GRAFANA_API_KEY}` }
  })
  
  return {
    status: response.ok ? 'healthy' : 'error',
    responseTime: response.headers.get('x-response-time'),
    version: response.headers.get('x-grafana-version')
  }
}
```

**API Endpoints:**
- `GET /api/org/users` - List organization users
- `GET /api/orgs` - List organizations  
- `GET /api/health` - Health check
- `GET /api/admin/stats` - Statistics

**Environment Variables:**
- `GRAFANA_API_URL`: Grafana instance URL
- `GRAFANA_API_KEY`: API key with admin permissions

### 3. Teleport Secure Access
**API Type:** gRPC/REST API  
**Authentication:** JWT Token, mTLS Certificate  
**Documentation:** https://goteleport.com/docs/api/  

```javascript
// Production Implementation Example
const TELEPORT_PROXY_URL = 'https://teleport.company.com:443'
const TELEPORT_TOKEN = process.env.TELEPORT_TOKEN

async function syncTeleportUsers() {
  const response = await fetch(`${TELEPORT_PROXY_URL}/v1/users`, {
    headers: {
      'Authorization': `Bearer ${TELEPORT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Teleport API error: ${response.status}`)
  }
  
  return await response.json()
}

async function getTeleportRoles() {
  const response = await fetch(`${TELEPORT_PROXY_URL}/v1/roles`, {
    headers: { 'Authorization': `Bearer ${TELEPORT_TOKEN}` }
  })
  
  return await response.json()
}
```

**API Endpoints:**
- `GET /v1/users` - List users
- `GET /v1/roles` - List roles
- `GET /v1/sessions` - Active sessions
- `GET /v1/events` - Audit events

**Environment Variables:**
- `TELEPORT_PROXY_URL`: Teleport proxy URL
- `TELEPORT_TOKEN`: Service account token
- `TELEPORT_CA_CERT`: Certificate authority cert (for mTLS)

## Medium Priority Integrations

### 4. Unifi Network Controller
**API Type:** REST API  
**Authentication:** Username/Password, Session Cookie  
**Documentation:** https://ubntwiki.com/products/software/unifi-controller/api  

```javascript
// Production Implementation Example
const UNIFI_CONTROLLER_URL = 'https://unifi.company.com:8443'

class UnifiAPI {
  constructor() {
    this.baseUrl = UNIFI_CONTROLLER_URL
    this.cookieJar = null
  }
  
  async login() {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.UNIFI_USERNAME,
        password: process.env.UNIFI_PASSWORD
      })
    })
    
    if (response.ok) {
      this.cookieJar = response.headers.get('set-cookie')
    }
  }
  
  async getUsers() {
    await this.login()
    const response = await fetch(`${this.baseUrl}/api/s/default/list/user`, {
      headers: { 'Cookie': this.cookieJar }
    })
    return await response.json()
  }
}
```

### 5. Zabbix Monitoring
**API Type:** JSON-RPC API  
**Authentication:** API Token  
**Documentation:** https://www.zabbix.com/documentation/current/en/manual/api  

```javascript
// Production Implementation Example
const ZABBIX_API_URL = 'https://zabbix.company.com/api_jsonrpc.php'

async function zabbixApiCall(method, params = {}) {
  const requestBody = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    auth: process.env.ZABBIX_API_TOKEN,
    id: 1
  }
  
  const response = await fetch(ZABBIX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
  
  const result = await response.json()
  return result.result
}

async function getZabbixUsers() {
  return await zabbixApiCall('user.get', {
    output: ['userid', 'username', 'name', 'surname', 'url', 'autologin']
  })
}
```

### 6. Kibana Log Analytics
**API Type:** REST API  
**Authentication:** Elasticsearch Authentication  
**Documentation:** https://www.elastic.co/guide/en/kibana/current/api.html  

```javascript
// Production Implementation Example
const KIBANA_URL = 'https://kibana.company.com'

async function getKibanaUsers() {
  const response = await fetch(`${KIBANA_URL}/api/security/user`, {
    headers: {
      'Authorization': `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`,
      'kbn-xsrf': 'true'
    }
  })
  
  return await response.json()
}
```

## API Integration Implementation Strategy

### Phase 1: Core Services (Weeks 1-2)
1. **LDAP/Active Directory** - Primary user source
2. **Grafana** - Most commonly used monitoring
3. **Teleport** - Critical security service

### Phase 2: Network Services (Weeks 3-4)  
1. **Unifi Network** - Network infrastructure
2. **Zabbix** - System monitoring
3. **RADIUS** - Network authentication

### Phase 3: Additional Services (Weeks 5-6)
1. **Kibana** - Log analytics
2. **VPN Services** (Mikrotik, FortiGate)
3. **IPAM** - IP address management

### Phase 4: Specialized Services (Weeks 7-8)
1. **ITop** - ITSM platform
2. **Vendor-specific services** (NetEco, eSight)
3. **Custom services** (NOC, Biometrics, Eight Sight)

## Security Considerations

### Authentication Security
- Store API keys and credentials in environment variables
- Use HashiCorp Vault or similar for production secret management
- Implement API key rotation schedules
- Use least-privilege service accounts

### Network Security
- Use TLS/SSL for all API communications
- Implement IP whitelisting where possible
- Use VPN or private networks for sensitive integrations
- Monitor API access patterns for anomalies

### Error Handling
- Never expose API credentials in error messages
- Implement circuit breakers for failing services
- Log security events to audit trail
- Implement rate limiting and retry logic

## Testing Strategy

### Development Testing
- Mock APIs for unit testing
- Integration testing with staging services
- API response validation and schema checking
- Health check endpoint testing

### Production Readiness
- Load testing with realistic user volumes
- Failover testing when services are unavailable
- Security penetration testing
- Performance benchmarking

## Monitoring and Alerting

### Health Check Implementation
Each service integration should implement:
- Connection health check
- Authentication validation
- Data retrieval test  
- Response time monitoring
- Error rate tracking

### Alerting Rules
- Service unavailable > 5 minutes
- Authentication failures > 3 in 10 minutes
- Response time > 10 seconds
- Error rate > 10% over 15 minutes
- Sync failures > 2 consecutive attempts

## Environment Configuration

```bash
# LDAP/Active Directory
LDAP_URL=ldap://ldap.company.com
LDAP_BIND_DN="CN=ESM Service,OU=Service Accounts,DC=company,DC=com"
LDAP_BIND_PASSWORD=secure_password
LDAP_BASE_DN="OU=Users,DC=company,DC=com"

# Grafana
GRAFANA_API_URL=https://grafana.company.com
GRAFANA_API_KEY=eyJrIjoiXXXXXXXX

# Teleport  
TELEPORT_PROXY_URL=https://teleport.company.com:443
TELEPORT_TOKEN=eyJhbGciOiJSUzI1NiXXXXXX

# Unifi
UNIFI_CONTROLLER_URL=https://unifi.company.com:8443
UNIFI_USERNAME=admin
UNIFI_PASSWORD=secure_password

# Zabbix
ZABBIX_API_URL=https://zabbix.company.com/api_jsonrpc.php
ZABBIX_API_TOKEN=a1b2c3d4e5f6g7h8i9j0

# Elasticsearch/Kibana
ELASTICSEARCH_API_KEY=base64encoded_api_key
KIBANA_URL=https://kibana.company.com
```

## Migration from Mock to Production

### Step-by-Step Process
1. **Configure environment variables** for target service
2. **Update API implementation** in respective route handler
3. **Test connection** using health check endpoint
4. **Validate data format** matches expected schema
5. **Update sync logic** to handle real API responses
6. **Monitor logs** for errors and performance issues
7. **Implement rollback plan** if integration fails

### Validation Checklist
- [ ] API credentials are valid and have required permissions
- [ ] Network connectivity is established
- [ ] Data mapping is correct for user fields
- [ ] Error handling covers all API failure scenarios  
- [ ] Health checks are reporting accurate status
- [ ] Sync processes are completing successfully
- [ ] Performance metrics are within acceptable ranges

## Support and Troubleshooting

### Common Issues
1. **Authentication Failures**: Verify credentials and permissions
2. **Network Timeouts**: Check firewall rules and DNS resolution
3. **API Rate Limiting**: Implement exponential backoff
4. **Data Format Changes**: Monitor API version updates
5. **SSL/TLS Issues**: Verify certificate chains and cipher suites

### Debugging Tools
- API testing tools (Postman, curl)
- Network debugging (tcpdump, Wireshark)
- Log aggregation (ELK Stack)
- Performance monitoring (APM tools)
- Security scanning (OWASP tools)

---

*Document Version: 1.0*  
*Last Updated: 2025-08-24*  
*Next Review: 2025-09-24*