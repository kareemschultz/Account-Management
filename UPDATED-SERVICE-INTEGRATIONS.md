# Updated Service Integration Templates (Based on Official Documentation)

## 🎯 Real API Documentation Integration Updates

Based on official documentation research, here are the corrected service integration templates:

### 1. **phpIPAM (IP Address Management)**
```javascript
{
  name: 'phpIPAM (IP Address Management)',
  description: 'phpIPAM open-source IP address management system',
  category: 'networking',
  authMethod: 'basic_auth',
  defaultUrl: 'https://ipam.company.com',
  version: '1.6.0',
  apiEndpoint: '/api/myapp/user/all/',
  healthCheck: '/api/myapp/user/',
  appName: 'myapp',
  tokenExpiry: '6h',
  sslRequired: true,
  documentation: 'https://phpipam.net/api/api_documentation/'
}
```

**Authentication Process:**
1. POST to `/api/myapp/user/` with Basic Auth header
2. Receive token valid for 6 hours
3. Include token in subsequent requests via `phpipam-token` header

**Production Implementation:**
```javascript
// Get authentication token
const authResponse = await fetch(`${PHPIPAM_URL}/api/myapp/user/`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
    'Content-Type': 'application/json'
  }
});
const { data: { token } } = await authResponse.json();

// Get all users
const usersResponse = await fetch(`${PHPIPAM_URL}/api/myapp/user/all/`, {
  headers: {
    'phpipam-token': token
  }
});
```

### 2. **Zabbix Monitoring**
```javascript
{
  name: 'Zabbix Monitoring',
  description: 'Infrastructure monitoring and alerting platform',
  category: 'monitoring',
  authMethod: 'json_rpc_auth',
  defaultUrl: 'https://zabbix.company.com',
  version: '7.0',
  apiEndpoint: '/api_jsonrpc.php',
  healthCheck: '/api_jsonrpc.php',
  protocol: 'JSON-RPC 2.0',
  tokenExpiry: 'session_based',
  documentation: 'https://www.zabbix.com/documentation/current/en/manual/api'
}
```

**Authentication Process:**
1. POST JSON-RPC request to `/api_jsonrpc.php` with `user.login` method
2. Receive authentication token
3. Include token in `auth` parameter of subsequent JSON-RPC requests

**Production Implementation:**
```javascript
// Authenticate and get token
const loginRequest = {
  jsonrpc: '2.0',
  method: 'user.login',
  params: {
    user: 'Admin',
    password: 'password'
  },
  id: 1
};

const authResponse = await fetch(`${ZABBIX_URL}/api_jsonrpc.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginRequest)
});
const { result: authToken } = await authResponse.json();

// Get all users
const usersRequest = {
  jsonrpc: '2.0',
  method: 'user.get',
  params: {
    output: ['userid', 'username', 'name', 'surname', 'url', 'autologin']
  },
  auth: authToken,
  id: 2
};
```

### 3. **Grafana Monitoring**
```javascript
{
  name: 'Grafana Monitoring',
  description: 'Observability and monitoring dashboards',
  category: 'monitoring',
  authMethod: 'service_account_token',
  defaultUrl: 'https://grafana.company.com',
  version: '10.2.3',
  apiEndpoint: '/api/org/users',
  healthCheck: '/api/health',
  authHeader: 'Authorization: Bearer',
  tokenType: 'Service Account Token',
  documentation: 'https://grafana.com/docs/grafana/latest/developers/http_api/'
}
```

**Authentication Process:**
1. Create Service Account in Grafana UI (Administration > Service Accounts)
2. Generate Service Account Token
3. Use Bearer token in Authorization header

**Production Implementation:**
```javascript
// Get organization users
const response = await fetch(`${GRAFANA_URL}/api/org/users`, {
  headers: {
    'Authorization': `Bearer ${GRAFANA_SERVICE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});
const users = await response.json();

// Health check
const healthResponse = await fetch(`${GRAFANA_URL}/api/health`, {
  headers: { 'Authorization': `Bearer ${GRAFANA_SERVICE_TOKEN}` }
});
```

### 4. **Teleport Secure Access**
```javascript
{
  name: 'Teleport Secure Access',
  description: 'Zero-trust secure access to infrastructure',
  category: 'security',
  authMethod: 'grpc_tls_cert',
  defaultUrl: 'https://teleport.company.com:443',
  version: '14.1.0',
  apiEndpoint: '/v1/users',
  healthCheck: '/v1/ping',
  protocol: 'gRPC with mTLS',
  authType: 'TLS Certificate',
  jwtSupport: true,
  documentation: 'https://goteleport.com/docs/api/getting-started/'
}
```

**Authentication Process:**
1. Use TLS certificates signed by Teleport Auth Service
2. gRPC API with mTLS authentication
3. JWT tokens available for application integration

**Production Implementation:**
```javascript
// Note: Teleport primarily uses gRPC API, not REST
// For REST-like access, use tctl or teleport-api client libraries
import { Client } from '@gravitational/teleport';

const client = new Client({
  addr: 'teleport.company.com:443',
  credentials: tlsCredentials // TLS cert/key pair
});

// Get users (requires proper gRPC implementation)
const users = await client.getUsers();
```

### 5. **Unifi Network Controller**
```javascript
{
  name: 'Unifi Network Controller',
  description: 'Ubiquiti network infrastructure management',
  category: 'networking',
  authMethod: 'session_cookie',
  defaultUrl: 'https://unifi.company.com:8443',
  version: '8.0.24',
  apiEndpoint: '/api/s/default/stat/user',
  healthCheck: '/status',
  loginEndpoint: '/api/login',
  cookieBased: true,
  documentation: 'https://developer.ui.com/site-manager-api/'
}
```

**Authentication Process:**
1. POST credentials to `/api/login`
2. Store session cookies from response
3. Include cookies in subsequent requests

**Production Implementation:**
```javascript
// Login and get session cookies
const loginResponse = await fetch(`${UNIFI_URL}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'password',
    remember: true
  }),
  credentials: 'include' // Important for cookie handling
});

// Get users (cookies automatically included)
const usersResponse = await fetch(`${UNIFI_URL}/api/s/default/stat/user`, {
  credentials: 'include'
});
```

## 🔧 Environment Variables Update

Based on the research, here are the updated environment variables:

```bash
# phpIPAM (IP Address Management)
PHPIPAM_URL=https://ipam.company.com
PHPIPAM_APP_NAME=myapp
PHPIPAM_USERNAME=admin
PHPIPAM_PASSWORD=your-password

# Zabbix Monitoring (JSON-RPC)
ZABBIX_URL=https://zabbix.company.com
ZABBIX_USERNAME=Admin
ZABBIX_PASSWORD=your-password

# Grafana (Service Account Token)
GRAFANA_URL=https://grafana.company.com
GRAFANA_SERVICE_TOKEN=glsa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Teleport (gRPC with TLS)
TELEPORT_PROXY_URL=teleport.company.com:443
TELEPORT_TLS_CERT_PATH=/path/to/cert.pem
TELEPORT_TLS_KEY_PATH=/path/to/key.pem

# Unifi Controller (Session-based)
UNIFI_CONTROLLER_URL=https://unifi.company.com:8443
UNIFI_USERNAME=admin
UNIFI_PASSWORD=your-password
```

## 🎛️ Modal Interface Updates

The service templates in the Add Integration Modal now include:

### Authentication Method Additions
- `json_rpc_auth` - JSON-RPC authentication (Zabbix)
- `service_account_token` - Service Account tokens (Grafana)
- `session_cookie` - Session-based authentication (Unifi)
- `grpc_tls_cert` - gRPC with TLS certificates (Teleport)

### Additional Configuration Fields
- `appName` - Application name (phpIPAM)
- `protocol` - API protocol type (JSON-RPC, gRPC, REST)
- `tokenExpiry` - Token expiration information
- `cookieBased` - Session cookie requirement
- `sslRequired` - SSL/TLS requirement flag

## 📚 Documentation Links

Each service template now includes direct links to official documentation:

- **phpIPAM**: https://phpipam.net/api/api_documentation/
- **Zabbix**: https://www.zabbix.com/documentation/current/en/manual/api
- **Grafana**: https://grafana.com/docs/grafana/latest/developers/http_api/
- **Teleport**: https://goteleport.com/docs/api/getting-started/
- **Unifi**: https://developer.ui.com/site-manager-api/

## 🔄 Migration Path

### Phase 1: Update Templates (Immediate)
1. Update service templates with correct API information
2. Add new authentication methods to modal interface
3. Update environment variable documentation

### Phase 2: Implementation (Next Sprint)
1. Replace mock endpoints with real API calls
2. Implement proper authentication for each service
3. Add error handling for service-specific responses
4. Test connections with real service instances

### Phase 3: Production Deployment
1. Configure production environment variables
2. Set up service accounts and API keys
3. Test end-to-end integration
4. Deploy with monitoring and alerting

### 6. **FreeRADIUS Authentication Server**
```javascript
{
  name: 'FreeRADIUS Authentication',
  description: 'Network access authentication and authorization server',
  category: 'security',
  authMethod: 'radius_shared_secret',
  defaultUrl: 'radius.company.com:1812',
  version: '3.2.0',
  protocol: 'RADIUS Protocol (UDP)',
  accountingPort: '1813',
  sharedSecret: 'configured_secret',
  apiIntegration: 'REST API Relay',
  documentation: 'https://wiki.freeradius.org/'
}
```

**Authentication Process:**
1. RADIUS uses shared secret authentication between NAS and RADIUS server
2. For API integration, use REST API relay method
3. API server authenticates users and responds to RADIUS server

**Production Implementation:**
```javascript
// RADIUS client configuration (for API relay)
const radiusConfig = {
  host: 'radius.company.com',
  port: 1812,
  secret: process.env.RADIUS_SHARED_SECRET,
  timeout: 3000,
  retries: 3
};

// REST API relay configuration
const apiConfig = {
  connect_uri: "https://your-api.company.com",
  authenticate_endpoint: "/authenticate",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.API_TOKEN}`
  }
};

// User authentication via API
const authenticateUser = async (username, password) => {
  const response = await fetch(`${apiConfig.connect_uri}${apiConfig.authenticate_endpoint}`, {
    method: 'POST',
    headers: apiConfig.headers,
    body: JSON.stringify({ username, password })
  });
  return await response.json();
};
```

### 7. **Huawei eSight Server Management**
```javascript
{
  name: 'Huawei eSight Server Management',
  description: 'Huawei enterprise ICT infrastructure management platform',
  category: 'management',
  authMethod: 'token_auth',
  defaultUrl: 'https://esight.company.com:32102',
  version: '22.1.0',
  apiEndpoint: '/rest/plat/smapp/v1/oauth/token',
  userEndpoint: '/rest/uam/v1/users',
  roleEndpoint: '/rest/uam/v1/roles',
  protocol: 'HTTPS REST',
  tokenExpiry: '30min',
  documentation: 'https://support.huawei.com/enterprise/en/network-management/esight-pid-9184477'
}
```

**Authentication Process:**
1. PUT request to `/rest/plat/smapp/v1/oauth/token` with credentials
2. Receive token valid for 30 minutes
3. Include token in `X-Auth-Token` header for subsequent requests

**Production Implementation:**
```javascript
// Authenticate and get token
const authResponse = await fetch(`${ESIGHT_URL}/rest/plat/smapp/v1/oauth/token`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    userName: process.env.ESIGHT_USERNAME,
    password: process.env.ESIGHT_PASSWORD
  })
});
const { accessSession } = await authResponse.json();

// Get users with token
const usersResponse = await fetch(`${ESIGHT_URL}/rest/uam/v1/users`, {
  headers: {
    'X-Auth-Token': accessSession,
    'Content-Type': 'application/json'
  }
});

// Get roles
const rolesResponse = await fetch(`${ESIGHT_URL}/rest/uam/v1/roles`, {
  headers: {
    'X-Auth-Token': accessSession,
    'Content-Type': 'application/json'
  }
});
```

### 8. **Proxmox VE Virtualization**
```javascript
{
  name: 'Proxmox VE Virtualization',
  description: 'Open-source virtualization management platform',
  category: 'management',
  authMethod: 'api_token',
  defaultUrl: 'https://proxmox.company.com:8006',
  version: '8.0',
  apiEndpoint: '/api2/json',
  ticketEndpoint: '/api2/json/access/ticket',
  userEndpoint: '/api2/json/access/users',
  protocol: 'HTTPS REST',
  tokenFormat: 'PVEAPIToken=USER@REALM!TOKENID=UUID',
  csrfRequired: true,
  documentation: 'https://pve.proxmox.com/wiki/Proxmox_VE_API'
}
```

**Authentication Process:**
1. Create API token in Proxmox VE UI for user account
2. Use token in Authorization header with PVEAPIToken format
3. CSRF token required for POST/PUT operations

**Production Implementation:**
```javascript
// Using API Token (recommended)
const headers = {
  'Authorization': `PVEAPIToken=${process.env.PROXMOX_API_TOKEN}`,
  'Content-Type': 'application/json'
};

// Get users
const usersResponse = await fetch(`${PROXMOX_URL}/api2/json/access/users`, {
  headers
});

// Alternative: Ticket-based authentication
const ticketResponse = await fetch(`${PROXMOX_URL}/api2/json/access/ticket`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: `${username}@${realm}`,
    password: password
  })
});
const { data: { ticket, CSRFPreventionToken } } = await ticketResponse.json();

// Use ticket in subsequent requests
const usersWithTicket = await fetch(`${PROXMOX_URL}/api2/json/access/users`, {
  headers: {
    'Cookie': `PVEAuthCookie=${ticket}`,
    'CSRFPreventionToken': CSRFPreventionToken
  }
});
```

## 🔧 Complete Environment Variables

```bash
# FreeRADIUS Authentication
RADIUS_SERVER=radius.company.com
RADIUS_PORT=1812
RADIUS_ACCOUNTING_PORT=1813
RADIUS_SHARED_SECRET=your-radius-shared-secret
RADIUS_API_URL=https://your-api.company.com
RADIUS_API_TOKEN=your-api-relay-token

# Huawei eSight
ESIGHT_URL=https://esight.company.com:32102
ESIGHT_USERNAME=admin
ESIGHT_PASSWORD=your-esight-password
ESIGHT_API_VERSION=v1

# Proxmox VE
PROXMOX_URL=https://proxmox.company.com:8006
PROXMOX_API_TOKEN=USER@REALM!TOKENID=UUID-TOKEN-HERE
# Alternative for ticket auth:
PROXMOX_USERNAME=admin
PROXMOX_REALM=pam
PROXMOX_PASSWORD=your-proxmox-password
```

## 🔌 Mikrotik RouterOS VPN Integration (ROS6 & ROS7)

### Overview
Comprehensive integration with Mikrotik RouterOS for VPN user management, combining Active Directory authentication with legacy PPP secrets and interface-list member automation.

### Architecture
- **Primary Authentication:** Active Directory via RADIUS
- **Legacy Support:** Local PPP secrets for service accounts
- **Interface Management:** Automatic interface-list member assignment
- **Real-time Monitoring:** Active session tracking and statistics

### API Configuration

#### RouterOS 6.x (Traditional API)
```javascript
const mikrotikROS6 = {
  host: 'mikrotik.company.com',
  port: 8728,  // or 8729 for SSL
  username: 'esm-api-user',
  password: 'secure-api-key',
  
  // Core operations
  operations: {
    listActiveSessions: '/ppp/active/print',
    listPPPSecrets: '/ppp/secret/print',
    listInterfaceMembers: '/interface/list/member/print',
    
    // Monitor sessions by authentication type
    getADUserSessions: '/ppp/active/print ?radius=yes',
    getLocalUserSessions: '/ppp/active/print ?radius=no',
    
    // Interface list management
    getVPNUserLists: {
      adUsers: '/interface/list/member/print ?list=vpn-ad-users',
      localUsers: '/interface/list/member/print ?list=vpn-local-users'
    }
  }
}
```

#### RouterOS 7.x (REST API)
```javascript
const mikrotikROS7 = {
  url: 'https://mikrotik.company.com/rest',
  auth: 'Basic ' + btoa('esm-api-user:secure-api-key'),
  
  endpoints: {
    // Active session monitoring
    activeSessions: '/ppp/active',
    pppSecrets: '/ppp/secret',
    interfaceListMembers: '/interface/list/member',
    
    // Statistics and monitoring
    systemHealth: '/system/health',
    resourceUsage: '/system/resource',
    
    // Interface list specific operations
    vpnUserInterfaces: '/interface/list/member?list=vpn-ad-users',
    legacyUserInterfaces: '/interface/list/member?list=vpn-local-users'
  }
}
```

### Hybrid User Management

#### Active Directory Users
```javascript
const adUserManagement = {
  // AD users authenticate via RADIUS automatically
  authentication: 'radius-passthrough',
  
  // Interface assignment happens dynamically
  interfaceAssignment: {
    automatic: true,
    listName: 'vpn-ad-users',
    rule: 'ppp-out-* interfaces from AD auth'
  },
  
  // Sync with platform database
  syncOperations: {
    getUsersFromAD: async () => {
      // Get current AD users from PPP active sessions
      const response = await fetch(`${API_URL}/ppp/active`, {
        method: 'GET',
        headers: { Authorization: `Basic ${authToken}` }
      });
      const sessions = await response.json();
      return sessions.filter(s => s.radius === 'yes');
    }
  }
}
```

#### Legacy PPP Secret Users
```javascript
const legacyUserManagement = {
  // Local PPP secrets for service accounts
  authentication: 'local-ppp-secret',
  
  // Manual interface list management
  interfaceAssignment: {
    automatic: false,
    listName: 'vpn-local-users',
    management: 'manual-esm-platform'
  },
  
  // ESM Platform manages these secrets
  secretOperations: {
    listSecrets: '/ppp/secret/print',
    addSecret: '/ppp/secret/add',
    updateSecret: '/ppp/secret/set',
    removeSecret: '/ppp/secret/remove'
  }
}
```

### Environment Variables
```bash
# Mikrotik Router Configuration
MIKROTIK_HOST=mikrotik.company.com
MIKROTIK_API_PORT=8728
MIKROTIK_API_SSL_PORT=8729
MIKROTIK_REST_URL=https://mikrotik.company.com/rest
MIKROTIK_USERNAME=esm-api-user
MIKROTIK_PASSWORD=secure-api-key

# AD Integration
MIKROTIK_RADIUS_SERVER=dc.company.com
MIKROTIK_RADIUS_SECRET=radius-shared-secret
MIKROTIK_RADIUS_REALM=company.com

# VPN Configuration
MIKROTIK_VPN_POOL=192.168.99.0/24
MIKROTIK_AD_INTERFACE_LIST=vpn-ad-users
MIKROTIK_LOCAL_INTERFACE_LIST=vpn-local-users
```

### Real-time Monitoring Implementation
```javascript
const vpnMonitoring = {
  // Poll active sessions every 30 seconds
  pollInterval: 30000,
  
  // Track both AD and local users
  getSessionStats: async () => {
    const allSessions = await mikrotikApi.query('/ppp/active/print');
    
    return {
      adUsers: {
        count: allSessions.filter(s => s.radius === 'yes').length,
        sessions: allSessions.filter(s => s.radius === 'yes'),
        bandwidth: calculateTotalBandwidth(allSessions.filter(s => s.radius === 'yes'))
      },
      localUsers: {
        count: allSessions.filter(s => s.radius === 'no').length, 
        sessions: allSessions.filter(s => s.radius === 'no'),
        bandwidth: calculateTotalBandwidth(allSessions.filter(s => s.radius === 'no'))
      },
      total: {
        activeConnections: allSessions.length,
        totalBandwidth: calculateTotalBandwidth(allSessions)
      }
    };
  },
  
  // Interface list validation
  validateInterfaceLists: async () => {
    const adInterfaces = await mikrotikApi.query('/interface/list/member/print ?list=vpn-ad-users');
    const localInterfaces = await mikrotikApi.query('/interface/list/member/print ?list=vpn-local-users');
    
    return {
      adUserInterfaces: adInterfaces.length,
      localUserInterfaces: localInterfaces.length,
      healthStatus: 'healthy'
    };
  }
}
```

## 🛡️ FortiGate VPN Integration (FortiOS 7.6.x)

### Overview
Comprehensive integration with FortiGate VPN for user management, combining local users, LDAP/AD authentication, and API-based synchronization. Critical for organizations transitioning from SSL VPN to IPsec VPN.

### Architecture & Authentication Models
- **Hybrid Authentication:** Local FortiGate users + LDAP/AD integration
- **SSL VPN:** Legacy mode (deprecated in 7.6.3+) transitioning to "Agentless VPN"  
- **IPsec VPN:** Primary VPN solution going forward with EAP-TTLS LDAP support
- **Local User Management:** API-driven local user creation and management

### API Configuration

#### FortiGate REST API Setup
```javascript
const fortigateAPI = {
  baseURL: 'https://fortigate.company.com',
  apiVersion: '/api/v2',
  authentication: {
    method: 'bearer-token',
    token: process.env.FORTIGATE_API_TOKEN,  // Generated from System > Administrators > REST API Admin
    headers: {
      'Authorization': `Bearer ${process.env.FORTIGATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Core endpoints for user management
  endpoints: {
    // Local user management
    localUsers: '/api/v2/cmdb/user/local',
    userGroups: '/api/v2/cmdb/user/group',
    
    // VPN configuration
    sslVpnSettings: '/api/v2/cmdb/vpn.ssl/settings',
    sslVpnPortal: '/api/v2/cmdb/vpn.ssl/portal',
    ipsecPhase1: '/api/v2/cmdb/vpn.ipsec/phase1-interface',
    
    // LDAP configuration
    ldapServer: '/api/v2/cmdb/user/ldap',
    
    // Monitor VPN sessions
    sslVpnMonitor: '/api/v2/monitor/vpn/ssl',
    ipsecVpnMonitor: '/api/v2/monitor/vpn/ipsec',
    
    // System monitoring
    systemStatus: '/api/v2/monitor/system/status'
  }
}
```

### User Management Operations

#### Local User Management
```javascript
const localUserOps = {
  // List all local users
  listUsers: async () => {
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/local`, {
      headers: fortigateAPI.authentication.headers
    });
    return await response.json();
  },
  
  // Create local user
  createUser: async (userData) => {
    const userConfig = {
      name: userData.username,
      type: 'password',
      passwd: userData.password,
      status: 'enable',
      'email-to': userData.email,
      'sms-phone': userData.phone,
      comment: 'Created by ESM Platform'
    };
    
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/local`, {
      method: 'POST',
      headers: fortigateAPI.authentication.headers,
      body: JSON.stringify(userConfig)
    });
    
    return await response.json();
  },
  
  // Update user
  updateUser: async (username, updates) => {
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/local/${username}`, {
      method: 'PUT',
      headers: fortigateAPI.authentication.headers,
      body: JSON.stringify(updates)
    });
    
    return await response.json();
  },
  
  // Delete user
  deleteUser: async (username) => {
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/local/${username}`, {
      method: 'DELETE',
      headers: fortigateAPI.authentication.headers
    });
    
    return await response.json();
  }
}
```

#### LDAP/AD Integration
```javascript
const ldapIntegration = {
  // Configure LDAP server
  configureLDAPServer: async (ldapConfig) => {
    const config = {
      name: 'company-ad',
      server: ldapConfig.server,
      port: 636,  // LDAPS
      secure: 'starttls',
      'ca-cert': ldapConfig.caCert,
      'bind-type': 'simple',
      username: ldapConfig.bindUser,
      password: ldapConfig.bindPassword,
      'base-dn': ldapConfig.baseDN,
      'member-attr': 'memberOf',
      comment: 'AD Integration for VPN - ESM Platform'
    };
    
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/ldap`, {
      method: 'POST',
      headers: fortigateAPI.authentication.headers,
      body: JSON.stringify(config)
    });
    
    return await response.json();
  },
  
  // Create user group with LDAP
  createLDAPGroup: async (groupConfig) => {
    const group = {
      name: groupConfig.name,
      member: [
        {
          name: 'company-ad',
          'server-name': 'company-ad'
        }
      ],
      'ldap-memberof': groupConfig.ldapGroup,
      comment: 'LDAP group for VPN access - ESM Platform'
    };
    
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/group`, {
      method: 'POST',  
      headers: fortigateAPI.authentication.headers,
      body: JSON.stringify(group)
    });
    
    return await response.json();
  }
}
```

### VPN Session Monitoring

#### SSL VPN Session Tracking (Legacy)
```javascript
const sslVpnMonitoring = {
  // Get active SSL VPN sessions
  getActiveSessions: async () => {
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/monitor/vpn/ssl`, {
      headers: fortigateAPI.authentication.headers
    });
    const data = await response.json();
    
    return {
      activeSessions: data.results || [],
      sessionCount: data.results?.length || 0,
      users: data.results?.map(session => ({
        username: session.user_name,
        ipAddress: session.assigned_ip,
        loginTime: session.login_time,
        duration: session.duration,
        bytesReceived: session.bytes_recv,
        bytesSent: session.bytes_sent
      })) || []
    };
  }
}
```

#### IPsec VPN Session Tracking (Primary)
```javascript  
const ipsecVpnMonitoring = {
  // Get active IPsec VPN sessions
  getActiveSessions: async () => {
    const response = await fetch(`${fortigateAPI.baseURL}/api/v2/monitor/vpn/ipsec`, {
      headers: fortigateAPI.authentication.headers
    });
    const data = await response.json();
    
    return {
      tunnels: data.results || [],
      activeTunnels: data.results?.filter(t => t.status === 'up').length || 0,
      users: data.results?.map(tunnel => ({
        name: tunnel.name,
        remoteGateway: tunnel['remote-gw'],
        status: tunnel.status,
        uptime: tunnel.uptime,
        bytesReceived: tunnel['bytes-recv'],
        bytesSent: tunnel['bytes-sent']
      })) || []
    };
  }
}
```

### Hybrid Authentication Management

#### User Categorization
```javascript
const hybridUserManagement = {
  // Categorize users by authentication method
  categorizeUsers: async () => {
    // Get local users
    const localUsersResponse = await localUserOps.listUsers();
    const localUsers = localUsersResponse.results || [];
    
    // Get LDAP groups  
    const groupsResponse = await fetch(`${fortigateAPI.baseURL}/api/v2/cmdb/user/group`, {
      headers: fortigateAPI.authentication.headers
    });
    const groups = await groupsResponse.json();
    const ldapGroups = groups.results?.filter(g => g.member?.some(m => m['server-name'])) || [];
    
    return {
      localUsers: {
        count: localUsers.length,
        users: localUsers.map(u => ({
          name: u.name,
          email: u['email-to'],
          status: u.status,
          type: 'local'
        }))
      },
      ldapUsers: {
        count: ldapGroups.length,
        groups: ldapGroups.map(g => ({
          name: g.name,
          ldapGroup: g['ldap-memberof'],
          server: g.member?.[0]?.['server-name'],
          type: 'ldap'
        }))
      }
    };
  },
  
  // Sync users from source files
  syncFromSourceFiles: async () => {
    // Reference to source files for context
    const sourceFiles = {
      adExport: 'ADUsersExport_20240618_v01.docx',
      fortigateDetails: 'FortigateVPNAccessDetails_20240620_v01.xlsx'
    };
    
    // Implementation would parse these files and sync users
    console.log('Syncing users from:', sourceFiles);
    
    return {
      syncedUsers: 0,
      errors: [],
      sourceFiles: sourceFiles
    };
  }
}
```

### Environment Variables
```bash
# FortiGate API Configuration
FORTIGATE_HOST=fortigate.company.com
FORTIGATE_API_TOKEN=your-generated-api-token-here
FORTIGATE_API_VERSION=v2

# SSL VPN Configuration (Legacy - transitioning to IPsec)
FORTIGATE_SSL_VPN_PORT=10443
FORTIGATE_SSL_VPN_PORTAL=web-access

# IPsec VPN Configuration (Primary)
FORTIGATE_IPSEC_ENABLED=true
FORTIGATE_EAP_TTLS_ENABLED=true

# LDAP Integration
FORTIGATE_LDAP_SERVER=dc.company.com
FORTIGATE_LDAP_PORT=636
FORTIGATE_LDAP_BASE_DN=OU=VPN Users,DC=company,DC=com
FORTIGATE_LDAP_BIND_USER=CN=FortiGate Service,OU=Service Accounts,DC=company,DC=com
FORTIGATE_LDAP_BIND_PASSWORD=secure-bind-password

# Data Source References
FORTIGATE_AD_EXPORT_FILE=ADUsersExport_20240618_v01.docx
FORTIGATE_VPN_DETAILS_FILE=FortigateVPNAccessDetails_20240620_v01.xlsx
```

### Migration Considerations (SSL VPN to IPsec)

#### FortiOS 7.6.3+ Transition
```javascript
const migrationPlan = {
  // SSL VPN tunnel mode removal timeline
  deprecationDate: 'FortiOS 7.6.3',
  replacement: 'IPsec VPN with EAP-TTLS',
  webModeRename: 'Agentless VPN',
  
  // Migration steps
  migrationSteps: [
    'Identify existing SSL VPN deployments',
    'Plan IPsec VPN configuration with EAP-TTLS',
    'Test new IPsec configurations',
    'Update FortiClient to version 7.4.3+',
    'Execute phased migration',
    'Update ESM Platform integration endpoints'
  ],
  
  // API changes required
  apiUpdates: {
    removeEndpoints: ['/api/v2/cmdb/vpn.ssl/settings'],
    addEndpoints: ['/api/v2/cmdb/vpn.ipsec/phase1-interface'],
    updateMonitoring: 'Focus on IPsec tunnel monitoring'
  }
}
```

## 🎛️ Additional Authentication Methods

Add these to the modal interface:

```javascript
// New authentication methods to add
const additionalAuthMethods = [
  { value: 'radius_shared_secret', label: 'RADIUS Shared Secret' },
  { value: 'token_auth', label: 'Token Authentication (eSight)' },
  { value: 'api_token', label: 'API Token (Proxmox)' },
  { value: 'ticket_auth', label: 'Ticket-based Authentication' },
  { value: 'json_rpc_auth', label: 'JSON-RPC Authentication (Zabbix)' },
  { value: 'service_account_token', label: 'Service Account Token (Grafana)' },
  { value: 'session_cookie', label: 'Session Cookie (Unifi)' },
  { value: 'grpc_tls_cert', label: 'gRPC with TLS Certificate (Teleport)' }
];
```

## 📊 Service Integration Summary

| Service | Auth Method | Protocol | Port | Token Expiry | API Type |
|---------|-------------|----------|------|-------------|----------|
| phpIPAM | Basic Auth | HTTPS | 443 | 6 hours | REST |
| Zabbix | JSON-RPC Auth | HTTPS | 443 | Session | JSON-RPC |
| Grafana | Service Token | HTTPS | 3000 | Configurable | REST |
| Teleport | TLS Certificate | gRPC | 443 | N/A | gRPC |
| Unifi | Session Cookie | HTTPS | 8443 | Session | REST |
| RADIUS | Shared Secret | UDP | 1812 | N/A | RADIUS |
| eSight | Token Auth | HTTPS | 32102 | 30 minutes | REST |
| Proxmox | API Token | HTTPS | 8006 | Configurable | REST |

---

*This document provides the foundation for implementing real service integrations based on official API documentation for all major enterprise services.*