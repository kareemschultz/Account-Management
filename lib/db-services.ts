/**
 * ESM Platform - Database Services
 * Service layer functions for database operations
 * Replaces mock data with real PostgreSQL queries
 */

import { query, queryOne, withTransaction } from './database';
import type {
  User,
  Service,
  AuditLog,
  VpnUser,
  AccessMatrixEntry,
  DataOperationLog
} from './types';

// ==================== USER SERVICES ====================

export async function getAllUsers(): Promise<User[]> {
  const users = await query<any>(`
    SELECT 
      u.id,
      u.name,
      u.username,
      u.email,
      u.employee_id,
      u.position,
      u.employment_status as status,
      u.employment_type,
      u.security_clearance,
      u.hire_date,
      u.last_login,
      u.avatar_url as avatar,
      u.active,
      d.name as department,
      COUNT(usa.id) FILTER (WHERE usa.has_access = true) as service_count,
      EXISTS(SELECT 1 FROM vpn_access va WHERE va.user_id = u.id AND va.has_access = true) as vpn_access,
      EXISTS(SELECT 1 FROM biometric_access ba WHERE ba.user_id = u.id AND ba.has_access = true) as biometric_access
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN user_service_access usa ON u.id = usa.user_id
    WHERE u.active = true
    GROUP BY u.id, d.name
    ORDER BY u.name
  `);

  return users.map(transformUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await queryOne<any>(`
    SELECT 
      u.id,
      u.name,
      u.username,
      u.email,
      u.employee_id,
      u.position,
      u.employment_status as status,
      u.employment_type,
      u.security_clearance,
      u.hire_date,
      u.last_login,
      u.avatar_url as avatar,
      u.active,
      d.name as department,
      COUNT(usa.id) FILTER (WHERE usa.has_access = true) as service_count,
      EXISTS(SELECT 1 FROM vpn_access va WHERE va.user_id = u.id AND va.has_access = true) as vpn_access,
      EXISTS(SELECT 1 FROM biometric_access ba WHERE ba.user_id = u.id AND ba.has_access = true) as biometric_access
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN user_service_access usa ON u.id = usa.user_id
    WHERE u.id = $1 AND u.active = true
    GROUP BY u.id, d.name
  `, [id]);

  return user ? transformUser(user) : null;
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const result = await queryOne<{ id: number }>(`
    INSERT INTO users (
      name, username, email, employee_id, position, 
      employment_status, employment_type, security_clearance,
      department_id, active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
      (SELECT id FROM departments WHERE name = $9), true)
    RETURNING id
  `, [
    userData.name,
    userData.username,
    userData.email,
    userData.employeeId,
    userData.position,
    userData.status || 'active',
    userData.employmentType || 'Permanent',
    userData.securityClearance || 'Internal',
    userData.department
  ]);

  if (!result) throw new Error('Failed to create user');
  
  return getUserById(result.id.toString())!;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  await query(`
    UPDATE users SET
      name = COALESCE($2, name),
      username = COALESCE($3, username),
      email = COALESCE($4, email),
      position = COALESCE($5, position),
      employment_status = COALESCE($6, employment_status),
      employment_type = COALESCE($7, employment_type),
      security_clearance = COALESCE($8, security_clearance),
      department_id = CASE 
        WHEN $9 IS NOT NULL THEN (SELECT id FROM departments WHERE name = $9)
        ELSE department_id 
      END,
      updated_at = NOW()
    WHERE id = $1
  `, [
    id,
    userData.name,
    userData.username,
    userData.email,
    userData.position,
    userData.status,
    userData.employmentType,
    userData.securityClearance,
    userData.department
  ]);

  const user = await getUserById(id);
  if (!user) throw new Error('User not found after update');
  return user;
}

// ==================== SERVICE SERVICES ====================

export async function getAllServices(): Promise<Service[]> {
  const services = await query<any>(`
    SELECT 
      s.id,
      s.name,
      s.display_name,
      s.category,
      s.description,
      s.auth_methods,
      s.access_levels,
      s.account_types,
      s.active,
      COUNT(usa.id) FILTER (WHERE usa.has_access = true) as active_users,
      'Operational' as health -- TODO: Implement real health checks
    FROM services s
    LEFT JOIN user_service_access usa ON s.id = usa.service_id
    WHERE s.active = true
    GROUP BY s.id
    ORDER BY s.display_name
  `);

  return services.map(transformService);
}

export async function getServiceById(id: string): Promise<Service | null> {
  const service = await queryOne<any>(`
    SELECT 
      s.id,
      s.name,
      s.display_name,
      s.category,
      s.description,
      s.auth_methods,
      s.access_levels,
      s.account_types,
      s.active,
      COUNT(usa.id) FILTER (WHERE usa.has_access = true) as active_users
    FROM services s
    LEFT JOIN user_service_access usa ON s.id = usa.service_id
    WHERE s.id = $1 AND s.active = true
    GROUP BY s.id
  `, [id]);

  return service ? transformService(service) : null;
}

// ==================== SERVICE ACCESS SERVICES ====================

export async function getUserServiceAccess(userId: string): Promise<any[]> {
  return await query(`
    SELECT 
      s.name as service_name,
      s.display_name,
      usa.has_access,
      usa.account_type,
      usa.account_status,
      usa.access_level,
      usa.groups,
      usa.granted_date,
      usa.expires_on
    FROM user_service_access usa
    JOIN services s ON usa.service_id = s.id
    WHERE usa.user_id = $1
    ORDER BY s.display_name
  `, [userId]);
}

export async function grantServiceAccess(
  userId: string, 
  serviceId: string, 
  accessData: {
    accountType?: string;
    accessLevel?: string;
    groups?: string[];
    expiresOn?: Date;
  }
): Promise<void> {
  await query(`
    INSERT INTO user_service_access (
      user_id, service_id, has_access, account_type, 
      account_status, access_level, groups, expires_on
    )
    VALUES ($1, $2, true, $3, 'Active', $4, $5, $6)
    ON CONFLICT (user_id, service_id) 
    DO UPDATE SET
      has_access = true,
      account_type = $3,
      account_status = 'Active',
      access_level = $4,
      groups = $5,
      expires_on = $6,
      updated_at = NOW()
  `, [
    userId,
    serviceId,
    accessData.accountType || 'Local',
    accessData.accessLevel || 'User',
    accessData.groups || [],
    accessData.expiresOn
  ]);
}

export async function revokeServiceAccess(userId: string, serviceId: string): Promise<void> {
  await query(`
    UPDATE user_service_access 
    SET has_access = false, account_status = 'Inactive', updated_at = NOW()
    WHERE user_id = $1 AND service_id = $2
  `, [userId, serviceId]);
}

// ==================== VPN SERVICES ====================

export async function getVpnUsers(): Promise<VpnUser[]> {
  const vpnUsers = await query<any>(`
    SELECT 
      va.id,
      va.user_id,
      u.username,
      u.name,
      va.vpn_type,
      va.has_access,
      va.account_status as status,
      va.groups,
      va.ip_pool,
      va.max_sessions,
      va.last_connection,
      va.total_data_used_gb,
      va.connection_count
    FROM vpn_access va
    JOIN users u ON va.user_id = u.id
    WHERE va.has_access = true
    ORDER BY u.name, va.vpn_type
  `);

  return vpnUsers.map(transformVpnUser);
}

export async function getActiveVpnConnections(): Promise<any[]> {
  // This would integrate with actual VPN APIs
  // For now, return sample data based on VPN users
  return await query(`
    SELECT 
      u.name as user_name,
      u.username,
      va.vpn_type,
      va.groups[1] as group_name,
      '192.168.100.' || (va.id + 100) as ip_address,
      NOW() - INTERVAL '2 hours' as connection_time,
      ROUND(RANDOM() * 1000)::integer as data_transfer_mb,
      'Active' as status
    FROM vpn_access va
    JOIN users u ON va.user_id = u.id
    WHERE va.has_access = true AND va.account_status = 'Active'
    LIMIT 20
  `);
}

// ==================== AUDIT SERVICES ====================

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const logs = await query<any>(`
    SELECT 
      al.id,
      al.user_id,
      u.name as user_name,
      al.action,
      al.target_type,
      al.description,
      al.changes,
      al.performed_by,
      performer.name as performed_by_name,
      al.severity,
      al.category,
      al.performed_at as timestamp
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    LEFT JOIN users performer ON al.performed_by = performer.id
    ORDER BY al.performed_at DESC
    LIMIT $1
  `, [limit]);

  return logs.map(transformAuditLog);
}

export async function createAuditLog(logData: {
  userId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  changes?: any;
  performedBy?: string;
  description?: string;
  severity?: string;
  category?: string;
}): Promise<void> {
  await query(`
    INSERT INTO audit_logs (
      user_id, action, target_type, target_id, changes,
      performed_by, description, severity, category
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    logData.userId,
    logData.action,
    logData.targetType,
    logData.targetId,
    JSON.stringify(logData.changes),
    logData.performedBy,
    logData.description,
    logData.severity || 'info',
    logData.category || 'system'
  ]);
}

// ==================== DEPARTMENT SERVICES ====================

export async function getDepartments(): Promise<Array<{ id: number; name: string }>> {
  return await query(`
    SELECT id, name FROM departments WHERE active = true ORDER BY name
  `);
}

// ==================== TRANSFORM FUNCTIONS ====================

function transformUser(dbUser: any): User {
  return {
    id: dbUser.id.toString(),
    name: dbUser.name,
    username: dbUser.username,
    email: dbUser.email || '',
    employeeId: dbUser.employee_id || '',
    position: dbUser.position || '',
    department: dbUser.department || '',
    securityClearance: dbUser.security_clearance || 'Internal',
    employmentType: dbUser.employment_type || 'Permanent',
    status: dbUser.status || 'active',
    lastLogin: dbUser.last_login?.toISOString() || '',
    vpnAccess: dbUser.vpn_access || false,
    biometricAccess: dbUser.biometric_access || false,
    serviceCount: parseInt(dbUser.service_count) || 0,
    avatar: dbUser.avatar || '/placeholder.svg?width=40&height=40',
    authenticationType: 'Local', // TODO: Implement proper auth type detection
    serviceGroups: [] // TODO: Implement service groups
  };
}

function transformService(dbService: any): Service {
  // Map our database services to the expected Service interface
  const serviceIcons: Record<string, any> = {
    'Network': 'Network',
    'Monitoring': 'BarChart',
    'Security': 'Shield',
    'Management': 'Settings',
    'Operations': 'Activity'
  };

  return {
    name: dbService.display_name,
    icon: serviceIcons[dbService.category] || 'Database',
    description: dbService.description || `${dbService.display_name} service`,
    category: dbService.category as any,
    activeUsers: parseInt(dbService.active_users) || 0,
    health: 'Operational' as any, // TODO: Implement health checks
    roles: dbService.access_levels || ['User', 'Admin'],
    customGroups: [], // TODO: Implement custom groups
    authenticationMethods: dbService.auth_methods || ['Local'],
    ldapIntegration: dbService.auth_methods?.includes('LDAP') || false
  };
}

function transformVpnUser(dbVpnUser: any): VpnUser {
  return {
    id: dbVpnUser.id.toString(),
    userId: dbVpnUser.user_id.toString(),
    username: dbVpnUser.username,
    vpnType: dbVpnUser.vpn_type as 'Mikrotik' | 'FortiGate',
    groups: dbVpnUser.groups || [],
    ipPool: dbVpnUser.ip_pool || '',
    allowedNetworks: [],
    maxSessions: dbVpnUser.max_sessions || 1,
    status: dbVpnUser.status as any || 'Active',
    createdDate: '',
    lastConnection: dbVpnUser.last_connection?.toISOString(),
    totalDataUsed: `${dbVpnUser.total_data_used_gb || 0} GB`,
    authenticationType: 'Local'
  };
}

function transformAuditLog(dbLog: any): AuditLog {
  return {
    id: dbLog.id.toString(),
    userId: dbLog.user_id?.toString(),
    userName: dbLog.user_name || 'System',
    action: dbLog.action,
    resource: dbLog.target_type,
    details: dbLog.description || `${dbLog.action} on ${dbLog.target_type}`,
    timestamp: dbLog.timestamp?.toISOString() || new Date().toISOString(),
    severity: dbLog.severity || 'info',
    ipAddress: '127.0.0.1', // TODO: Implement IP tracking
    userAgent: 'ESM Platform'
  };
}

// ==================== STATISTICS ====================

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  totalServices: number;
  activeServices: number;
  vpnUsers: number;
  recentActivity: number;
}> {
  const stats = await queryOne<any>(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE active = true) as total_users,
      (SELECT COUNT(*) FROM users WHERE active = true AND employment_status = 'Active') as active_users,
      (SELECT COUNT(*) FROM services WHERE active = true) as total_services,
      (SELECT COUNT(*) FROM services WHERE active = true) as active_services,
      (SELECT COUNT(DISTINCT user_id) FROM vpn_access WHERE has_access = true) as vpn_users,
      (SELECT COUNT(*) FROM audit_logs WHERE performed_at > NOW() - INTERVAL '24 hours') as recent_activity
  `);

  return {
    totalUsers: parseInt(stats?.total_users) || 0,
    activeUsers: parseInt(stats?.active_users) || 0,
    totalServices: parseInt(stats?.total_services) || 0,
    activeServices: parseInt(stats?.active_services) || 0,
    vpnUsers: parseInt(stats?.vpn_users) || 0,
    recentActivity: parseInt(stats?.recent_activity) || 0,
  };
}