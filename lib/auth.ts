import { NextAuthOptions } from 'next-auth'
import { Pool } from 'pg'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { User, Role, UserRole } from './types'
import { logSecurityEvent } from './audit'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/esm_platform',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Simple hardcoded authentication for testing
        // Accept both username and email formats
        if ((credentials.username === 'admin' || credentials.username === 'admin@esm.com') && credentials.password === 'admin') {
          console.log('✅ Hardcoded authentication successful for:', credentials.username);
          return {
            id: '1',
            name: 'Administrator',
            username: 'admin',
            email: 'admin@esm.com',
            image: null,
            employeeId: 'EMP001',
            department: 'IT Operations',
            position: 'System Administrator',
            securityClearance: 'Top Secret',
            roles: [{
              id: 1,
              name: 'super_admin',
              display_name: 'Super Administrator',
              permissions: {"system": "*", "users": "*", "services": "*", "audit": "*"}
            }],
            permissions: {"system": ["*"], "users": ["*"], "services": ["*"], "audit": ["*"]}
          }
        }
        
        console.log('❌ Hardcoded authentication failed for:', credentials.username, 'password length:', credentials.password?.length);

        // Try database authentication as fallback
        try {
          const client = await pool.connect()
          try {
            // Get user with roles
            const userResult = await client.query(`
              SELECT 
                u.*,
                d.name as department_name,
                ARRAY_AGG(
                  CASE WHEN ur.active = true AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
                  THEN jsonb_build_object('id', r.id, 'name', r.name, 'display_name', r.display_name, 'permissions', r.permissions)
                  ELSE NULL END
                ) FILTER (WHERE ur.active = true AND (ur.expires_at IS NULL OR ur.expires_at > NOW())) as roles
              FROM users u
              LEFT JOIN departments d ON u.department_id = d.id
              LEFT JOIN user_roles ur ON u.id = ur.user_id
              LEFT JOIN roles r ON ur.role_id = r.id
              WHERE (u.username = $1 OR u.email = $1) AND u.active = true
              GROUP BY u.id, d.name
            `, [credentials.username])

            if (userResult.rows.length === 0) {
              await logSecurityEvent({
                event_type: 'login_failed',
                details: { reason: 'user_not_found', username: credentials.username },
                ip_address: req.headers?.['x-forwarded-for'] as string || req.ip,
                user_agent: req.headers?.['user-agent'],
                blocked: false
              })
              return null
            }

            const user = userResult.rows[0]

            // Check if account is locked
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
              await logSecurityEvent({
                user_id: user.id,
                event_type: 'login_failed',
                details: { reason: 'account_locked', locked_until: user.locked_until },
                ip_address: req.headers?.['x-forwarded-for'] as string || req.ip,
                user_agent: req.headers?.['user-agent'],
                blocked: true
              })
              return null
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

            if (!isPasswordValid) {
              // Increment login attempts
              const newAttempts = user.login_attempts + 1
              const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 failed attempts

              await client.query(`
                UPDATE users 
                SET login_attempts = $1, locked_until = $2 
                WHERE id = $3
              `, [newAttempts, lockUntil, user.id])

              await logSecurityEvent({
                user_id: user.id,
                event_type: 'login_failed',
                details: { 
                  reason: 'invalid_password', 
                  attempts: newAttempts,
                  locked: !!lockUntil 
                },
                ip_address: req.headers?.['x-forwarded-for'] as string || req.ip,
                user_agent: req.headers?.['user-agent'],
                blocked: !!lockUntil
              })
              return null
            }

            // Reset login attempts on successful login
            await client.query(`
              UPDATE users 
              SET login_attempts = 0, locked_until = NULL, last_login = NOW() 
              WHERE id = $1
            `, [user.id])

            await logSecurityEvent({
              user_id: user.id,
              event_type: 'login_success',
              details: { method: 'credentials' },
              ip_address: req.headers?.['x-forwarded-for'] as string || req.ip,
              user_agent: req.headers?.['user-agent'],
              blocked: false
            })

            return {
              id: user.id.toString(),
              name: user.name,
              username: user.username,
              email: user.email,
              image: user.image || user.avatar_url,
              employeeId: user.employee_id,
              department: user.department_name,
              position: user.position,
              securityClearance: user.security_clearance,
              roles: user.roles || [],
              permissions: extractPermissions(user.roles || [])
            }
          } finally {
            client.release()
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
        token.username = user.username
        token.employeeId = user.employeeId
        token.department = user.department
        token.position = user.position
        token.securityClearance = user.securityClearance
        token.roles = user.roles
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.username = token.username as string
        session.user.employeeId = token.employeeId as string
        session.user.department = token.department as string
        session.user.position = token.position as string
        session.user.securityClearance = token.securityClearance as string
        session.user.roles = token.roles as Role[]
        session.user.permissions = token.permissions as Record<string, string[]>
      }
      return session
    },
  },
  events: {
    async signOut({ token, session }) {
      if (token?.sub) {
        await logSecurityEvent({
          user_id: parseInt(token.sub),
          event_type: 'logout',
          details: { method: 'manual' },
          blocked: false
        })
      }
    },
    async session({ session, token }) {
      // Update last activity
      if (token?.sub) {
        try {
          const client = await pool.connect()
          try {
            await client.query(`
              UPDATE users SET last_login = NOW() WHERE id = $1
            `, [parseInt(token.sub)])
          } finally {
            client.release()
          }
        } catch (error) {
          console.error('Error updating last activity:', error)
        }
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

function extractPermissions(roles: Role[]): Record<string, string[]> {
  const permissions: Record<string, string[]> = {}
  
  for (const role of roles) {
    if (role.permissions) {
      for (const [resource, actions] of Object.entries(role.permissions)) {
        if (actions === '*') {
          permissions[resource] = ['*']
        } else if (Array.isArray(actions)) {
          if (!permissions[resource]) {
            permissions[resource] = []
          }
          permissions[resource] = [...new Set([...permissions[resource], ...actions])]
        }
      }
    }
  }
  
  return permissions
}

export { pool }