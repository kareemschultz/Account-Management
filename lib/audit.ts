import { pool } from './auth'
import { headers } from 'next/headers'

export interface SecurityEvent {
  user_id?: number
  event_type: string
  ip_address?: string
  user_agent?: string
  location_country?: string
  location_city?: string
  device_fingerprint?: string
  session_id?: string
  risk_score?: number
  blocked?: boolean
  details?: Record<string, any>
}

export interface AuditLogEntry {
  user_id?: number
  target_type: string
  target_id?: number
  action: string
  changes?: Record<string, any>
  performed_by?: number
  ip_address?: string
  user_agent?: string
  session_id?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  category?: string
  description?: string
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    const client = await pool.connect()
    try {
      await client.query(`
        INSERT INTO security_events (
          user_id, event_type, ip_address, user_agent, location_country, 
          location_city, device_fingerprint, session_id, risk_score, blocked, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        event.user_id,
        event.event_type,
        event.ip_address,
        event.user_agent,
        event.location_country,
        event.location_city,
        event.device_fingerprint,
        event.session_id,
        event.risk_score || 0,
        event.blocked || false,
        JSON.stringify(event.details || {})
      ])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    const client = await pool.connect()
    try {
      await client.query(`
        INSERT INTO audit_logs (
          user_id, target_type, target_id, action, changes, performed_by, 
          ip_address, user_agent, session_id, severity, category, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        entry.user_id,
        entry.target_type,
        entry.target_id,
        entry.action,
        JSON.stringify(entry.changes || {}),
        entry.performed_by,
        entry.ip_address,
        entry.user_agent,
        entry.session_id,
        entry.severity || 'info',
        entry.category || 'system',
        entry.description
      ])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

export async function getSecurityEvents(userId?: number, limit: number = 100) {
  try {
    const client = await pool.connect()
    try {
      const query = userId 
        ? `SELECT * FROM security_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
        : `SELECT * FROM security_events ORDER BY created_at DESC LIMIT $1`
      
      const params = userId ? [userId, limit] : [limit]
      const result = await client.query(query, params)
      
      return result.rows.map(row => ({
        ...row,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
      }))
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to fetch security events:', error)
    return []
  }
}

export async function getAuditTrail(targetType?: string, targetId?: number, limit: number = 100) {
  try {
    const client = await pool.connect()
    try {
      let query = `
        SELECT 
          al.*,
          u1.name as user_name,
          u2.name as performed_by_name
        FROM audit_logs al
        LEFT JOIN users u1 ON al.user_id = u1.id
        LEFT JOIN users u2 ON al.performed_by = u2.id
      `
      const params: any[] = []
      const conditions: string[] = []

      if (targetType) {
        conditions.push(`al.target_type = $${params.length + 1}`)
        params.push(targetType)
      }

      if (targetId) {
        conditions.push(`al.target_id = $${params.length + 1}`)
        params.push(targetId)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }

      query += ` ORDER BY al.performed_at DESC LIMIT $${params.length + 1}`
      params.push(limit)

      const result = await client.query(query, params)
      
      return result.rows.map(row => ({
        ...row,
        changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes
      }))
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to fetch audit trail:', error)
    return []
  }
}

export async function calculateRiskScore(
  userId: number,
  ipAddress: string,
  userAgent: string,
  eventType: string
): Promise<number> {
  let riskScore = 0

  try {
    const client = await pool.connect()
    try {
      // Check for unusual login times
      const currentHour = new Date().getHours()
      if (currentHour < 6 || currentHour > 22) {
        riskScore += 20
      }

      // Check for new IP address
      const ipResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE user_id = $1 AND ip_address = $2 AND created_at > NOW() - INTERVAL '30 days'
      `, [userId, ipAddress])
      
      if (parseInt(ipResult.rows[0].count) === 0) {
        riskScore += 30
      }

      // Check for recent failed attempts
      const failedResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE user_id = $1 AND event_type = 'login_failed' AND created_at > NOW() - INTERVAL '1 hour'
      `, [userId])
      
      riskScore += parseInt(failedResult.rows[0].count) * 10

      // Check for multiple concurrent sessions
      const sessionResult = await client.query(`
        SELECT COUNT(DISTINCT ip_address) as count 
        FROM security_events 
        WHERE user_id = $1 AND event_type IN ('login_success', 'session_active') 
        AND created_at > NOW() - INTERVAL '1 hour'
      `, [userId])
      
      if (parseInt(sessionResult.rows[0].count) > 2) {
        riskScore += 25
      }

      return Math.min(riskScore, 100)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to calculate risk score:', error)
    return 50 // Default moderate risk
  }
}

export function getClientInfo(request?: Request) {
  const headersList = headers()
  
  return {
    ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1',
    user_agent: headersList.get('user-agent') || 'unknown',
    device_fingerprint: generateDeviceFingerprint(headersList)
  }
}

function generateDeviceFingerprint(headers: Headers): string {
  const components = [
    headers.get('user-agent') || '',
    headers.get('accept-language') || '',
    headers.get('accept-encoding') || '',
    headers.get('sec-ch-ua') || '',
    headers.get('sec-ch-ua-platform') || ''
  ]
  
  return Buffer.from(components.join('|')).toString('base64').substring(0, 32)
}