import type React from "react"
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

export type AuthenticationType = "Local" | "LDAP" | "Azure AD" | "SAML SSO"

export type User = {
  id: string
  name: string
  avatar: string
  email: string
  employeeId: string
  position: string
  department: string
  securityClearance: "Public" | "Internal" | "Confidential" | "Restricted" | "Top Secret"
  employmentType: "Permanent" | "Contract" | "Temporary" | "Consultant" | "Intern"
  status: "active" | "inactive" | "suspended" | "pending"
  lastLogin: string
  vpnAccess: boolean
  biometricAccess: boolean
  serviceCount: number
  expiresOn?: string
  authenticationType: AuthenticationType
  ldapDN?: string // Distinguished Name for LDAP users
  adGroups?: string[] // Active Directory groups
  localGroups?: string[] // Local system groups
  serviceGroups: ServiceGroupMembership[] // Service-specific groups
}

export type ServiceGroupMembership = {
  serviceName: string
  groups: string[]
  roles: string[]
  assignedDate: string
  expiresOn?: string
}

export type Service = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: "Network" | "Monitoring" | "Security" | "Management" | "Communication"
  activeUsers: number
  health: "Operational" | "Degraded" | "Outage"
  roles: string[]
  customGroups: ServiceGroup[] // Service-specific groups
  authenticationMethods: AuthenticationType[]
  ldapIntegration: boolean
}

export type ServiceGroup = {
  id: string
  name: string
  description: string
  permissions: string[]
  members: string[] // User IDs
  createdDate: string
  isDefault: boolean
}

export type VpnUser = {
  id: string
  userId: string // Reference to User
  username: string
  vpnType: "Mikrotik" | "FortiGate"
  groups: string[]
  ipPool: string
  allowedNetworks: string[]
  maxSessions: number
  dataLimit?: string // e.g., "10GB"
  timeLimit?: string // e.g., "8h"
  status: "Active" | "Disabled" | "Suspended"
  createdDate: string
  lastConnection?: string
  totalDataUsed: string
  authenticationType: AuthenticationType
  certificate?: string
  sharedSecret?: string
}

export type VpnGroup = {
  id: string
  name: string
  vpnType: "Mikrotik" | "FortiGate"
  description: string
  ipPool: string
  allowedNetworks: string[]
  defaultDataLimit?: string
  defaultTimeLimit?: string
  priority: number
  members: string[] // VPN User IDs
  policies: VpnPolicy[]
}

export type VpnPolicy = {
  id: string
  name: string
  description: string
  rules: VpnRule[]
}

export type VpnRule = {
  action: "Allow" | "Deny"
  source: string
  destination: string
  port?: string
  protocol?: "TCP" | "UDP" | "ICMP" | "Any"
}

export type AuditLog = {
  id: string
  user: {
    name: string
    avatar: string
    authenticationType?: AuthenticationType
  }
  action: string
  actionType: "USER_MANAGEMENT" | "SECURITY" | "SERVICE_UPDATE" | "VPN_CONFIG" | "SYSTEM" | "GROUP_MANAGEMENT"
  timestamp: string
  details: string
  ipAddress?: string
  userAgent?: string
}

export type ComplianceControl = {
  id: string
  name: string
  description: string
  status: "Compliant" | "Non-Compliant" | "In Progress" | "Not Assessed"
  owner: string
  lastReviewed: string
  evidenceCount: number
}

export type ComplianceStandard = {
  name: string
  description: string
  controls: ComplianceControl[]
}

export type AccessMatrixEntry = {
  userId: string
  serviceName: string
  accessLevel: "Full" | "Limited" | "Pending" | "Denied" | "None"
  role: string
  groups: string[] // Service-specific groups
  expiresOn?: string
  grantedBy: string
  grantedDate: string
}

export type DataOperationLog = {
  id: string
  type: "Import" | "Export"
  dataType: "Users" | "Services" | "VPN Users" | "Groups"
  fileName: string
  status: "Completed" | "Processing" | "Failed"
  timestamp: string
  recordsProcessed: number
  user: {
    name: string
  }
}

export type LdapConfiguration = {
  server: string
  port: number
  baseDN: string
  bindDN: string
  searchFilter: string
  userAttributes: {
    username: string
    email: string
    firstName: string
    lastName: string
    department: string
    groups: string
  }
  groupMapping: { [key: string]: string[] }
  syncEnabled: boolean
  lastSync?: string
}

// Authentication & Authorization Types
export type Role = {
  id: number
  name: string
  display_name: string
  description?: string
  permissions: Record<string, string[] | string>
}

export type UserRole = {
  id: number
  user_id: number
  role_id: number
  granted_by?: number
  granted_at: Date
  expires_at?: Date
  active: boolean
}

export type Permission = {
  resource: string
  actions: string[]
}

export type SecurityEvent = {
  id: number
  user_id?: number
  event_type: string
  ip_address?: string
  user_agent?: string
  location_country?: string
  location_city?: string
  device_fingerprint?: string
  session_id?: string
  risk_score: number
  blocked: boolean
  details?: Record<string, any>
  created_at: Date
}

export type AuditLogEntry = {
  id: number
  uuid: string
  user_id?: number
  target_type: string
  target_id?: number
  action: string
  changes?: Record<string, any>
  performed_by?: number
  ip_address?: string
  user_agent?: string
  session_id?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: string
  description?: string
  performed_at: Date
}

// NextAuth.js Type Extensions
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      employeeId: string
      department: string
      position: string
      securityClearance: string
      roles: Role[]
      permissions: Record<string, string[]>
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    username: string
    employeeId: string
    department: string
    position: string
    securityClearance: string
    roles: Role[]
    permissions: Record<string, string[]>
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string
    employeeId: string
    department: string
    position: string
    securityClearance: string
    roles: Role[]
    permissions: Record<string, string[]>
  }
}
