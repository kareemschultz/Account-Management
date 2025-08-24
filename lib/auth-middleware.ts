import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logSecurityEvent } from './audit'

export interface AuthMiddlewareOptions {
  requiredRole?: string
  requiredPermissions?: { resource: string, action: string }[]
  allowedRoles?: string[]
  requireAuth?: boolean
}

const secret = process.env.NEXTAUTH_SECRET

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  const {
    requiredRole,
    requiredPermissions = [],
    allowedRoles = [],
    requireAuth = true
  } = options

  try {
    // Get the JWT token from the request
    const token = await getToken({
      req: request,
      secret,
    })

    // Check if authentication is required
    if (requireAuth && !token) {
      await logSecurityEvent({
        event_type: 'unauthorized_access_attempt',
        ip_address: request.headers.get('x-forwarded-for') || request.ip,
        user_agent: request.headers.get('user-agent') || undefined,
        details: {
          url: request.url,
          method: request.method,
          reason: 'no_token'
        },
        blocked: true
      })

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // If no auth required and no token, continue without user context
    if (!requireAuth && !token) {
      return handler(request, null)
    }

    const user = token ? {
      id: token.sub,
      name: token.name,
      username: token.username,
      email: token.email,
      employeeId: token.employeeId,
      department: token.department,
      position: token.position,
      securityClearance: token.securityClearance,
      roles: token.roles || [],
      permissions: token.permissions || {}
    } : null

    // Check role requirements
    if (requiredRole && user) {
      const hasRole = user.roles.some((role: any) => role.name === requiredRole)
      if (!hasRole) {
        await logSecurityEvent({
          user_id: parseInt(user.id),
          event_type: 'authorization_failed',
          ip_address: request.headers.get('x-forwarded-for') || request.ip,
          user_agent: request.headers.get('user-agent') || undefined,
          details: {
            url: request.url,
            method: request.method,
            required_role: requiredRole,
            user_roles: user.roles.map((r: any) => r.name),
            reason: 'insufficient_role'
          },
          blocked: true
        })

        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Check allowed roles
    if (allowedRoles.length > 0 && user) {
      const hasAllowedRole = user.roles.some((role: any) =>
        allowedRoles.includes(role.name)
      )
      if (!hasAllowedRole) {
        await logSecurityEvent({
          user_id: parseInt(user.id),
          event_type: 'authorization_failed',
          ip_address: request.headers.get('x-forwarded-for') || request.ip,
          user_agent: request.headers.get('user-agent') || undefined,
          details: {
            url: request.url,
            method: request.method,
            allowed_roles: allowedRoles,
            user_roles: user.roles.map((r: any) => r.name),
            reason: 'role_not_allowed'
          },
          blocked: true
        })

        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Check specific permissions
    if (requiredPermissions.length > 0 && user) {
      for (const { resource, action } of requiredPermissions) {
        const userPermissions = user.permissions[resource] || []
        const hasPermission = userPermissions.includes('*') || userPermissions.includes(action)

        if (!hasPermission) {
          await logSecurityEvent({
            user_id: parseInt(user.id),
            event_type: 'authorization_failed',
            ip_address: request.headers.get('x-forwarded-for') || request.ip,
            user_agent: request.headers.get('user-agent') || undefined,
            details: {
              url: request.url,
              method: request.method,
              required_permission: { resource, action },
              user_permissions: user.permissions,
              reason: 'insufficient_permissions'
            },
            blocked: true
          })

          return NextResponse.json(
            { error: `Permission denied: ${resource}:${action}` },
            { status: 403 }
          )
        }
      }
    }

    return handler(request, user)
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    await logSecurityEvent({
      event_type: 'auth_middleware_error',
      ip_address: request.headers.get('x-forwarded-for') || request.ip,
      user_agent: request.headers.get('user-agent') || undefined,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: request.url,
        method: request.method
      },
      blocked: false
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export function hasPermission(
  userPermissions: Record<string, string[]>,
  resource: string,
  action: string
): boolean {
  const permissions = userPermissions[resource] || []
  return permissions.includes('*') || permissions.includes(action)
}

export function hasRole(userRoles: any[], roleName: string): boolean {
  return userRoles.some(role => role.name === roleName)
}

export function hasAnyRole(userRoles: any[], roleNames: string[]): boolean {
  return userRoles.some(role => roleNames.includes(role.name))
}

export function getHighestRole(userRoles: any[]): string | null {
  const roleHierarchy = ['super_admin', 'admin', 'manager', 'user', 'guest']
  
  for (const roleName of roleHierarchy) {
    if (userRoles.some(role => role.name === roleName)) {
      return roleName
    }
  }
  
  return null
}

export function canAccessResource(
  userPermissions: Record<string, string[]>,
  resource: string,
  action: string = 'read'
): boolean {
  // Check if user has explicit permission
  if (hasPermission(userPermissions, resource, action)) {
    return true
  }

  // Check for read access if requesting read_own
  if (action === 'read_own' && hasPermission(userPermissions, resource, 'read')) {
    return true
  }

  // Check for update access if requesting update_own
  if (action === 'update_own' && hasPermission(userPermissions, resource, 'update')) {
    return true
  }

  return false
}