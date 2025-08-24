import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logSecurityEvent, logAuditEvent } from './audit'
import { z } from 'zod'

export interface ApiAuthOptions {
  requiredRole?: string
  requiredPermissions?: { resource: string, action: string }[]
  allowedRoles?: string[]
  requireAuth?: boolean
  validateInput?: z.ZodSchema
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
}

interface ApiHandler {
  (request: NextRequest, context: { user: any, validatedData?: any }): Promise<NextResponse>
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>()

export function withApiAuth(
  handler: ApiHandler,
  options: ApiAuthOptions = {}
) {
  return async (request: NextRequest, params?: any) => {
    const {
      requiredRole,
      requiredPermissions = [],
      allowedRoles = [],
      requireAuth = true,
      validateInput,
      rateLimit
    } = options

    try {
      const clientIP = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      // Rate limiting
      if (rateLimit) {
        const key = `${clientIP}:${request.nextUrl.pathname}`
        const now = Date.now()
        const windowStart = now - rateLimit.windowMs
        
        let rateLimitData = rateLimitStore.get(key)
        
        if (!rateLimitData || rateLimitData.resetTime < now) {
          rateLimitData = { count: 0, resetTime: now + rateLimit.windowMs }
          rateLimitStore.set(key, rateLimitData)
        }

        if (rateLimitData.count >= rateLimit.maxRequests) {
          await logSecurityEvent({
            event_type: 'rate_limit_exceeded',
            ip_address: clientIP,
            user_agent: userAgent,
            details: {
              url: request.url,
              method: request.method,
              limit: rateLimit.maxRequests,
              window: rateLimit.windowMs
            },
            blocked: true,
            risk_score: 30
          })

          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil(rateLimit.windowMs / 1000).toString(),
                'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitData.resetTime.toString()
              }
            }
          )
        }

        rateLimitData.count++
      }

      // Authentication check
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (requireAuth && !token) {
        await logSecurityEvent({
          event_type: 'api_unauthorized_access',
          ip_address: clientIP,
          user_agent: userAgent,
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

      let user = null
      if (token) {
        user = {
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
        }

        // Role-based authorization
        if (requiredRole && !user.roles.some((role: any) => role.name === requiredRole)) {
          await logSecurityEvent({
            user_id: parseInt(user.id),
            event_type: 'api_authorization_failed',
            ip_address: clientIP,
            user_agent: userAgent,
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

        if (allowedRoles.length > 0 && !user.roles.some((role: any) => allowedRoles.includes(role.name))) {
          await logSecurityEvent({
            user_id: parseInt(user.id),
            event_type: 'api_authorization_failed',
            ip_address: clientIP,
            user_agent: userAgent,
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

        // Permission-based authorization
        for (const { resource, action } of requiredPermissions) {
          const userPermissions = user.permissions[resource] || []
          const hasPermission = userPermissions.includes('*') || userPermissions.includes(action)

          if (!hasPermission) {
            await logSecurityEvent({
              user_id: parseInt(user.id),
              event_type: 'api_authorization_failed',
              ip_address: clientIP,
              user_agent: userAgent,
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

      // Input validation
      let validatedData
      if (validateInput && request.method !== 'GET') {
        try {
          const body = await request.json()
          validatedData = validateInput.parse(body)
        } catch (error) {
          await logSecurityEvent({
            user_id: user ? parseInt(user.id) : undefined,
            event_type: 'api_validation_failed',
            ip_address: clientIP,
            user_agent: userAgent,
            details: {
              url: request.url,
              method: request.method,
              validation_error: error instanceof Error ? error.message : 'Unknown validation error'
            },
            blocked: true
          })

          return NextResponse.json(
            { 
              error: 'Invalid input data',
              details: error instanceof z.ZodError ? error.errors : undefined
            },
            { status: 400 }
          )
        }
      }

      // Call the actual handler
      const response = await handler(request, { user, validatedData })

      // Log successful API access for audit purposes
      if (user && response.status < 400) {
        await logAuditEvent({
          user_id: parseInt(user.id),
          target_type: 'api_endpoint',
          action: request.method.toLowerCase(),
          performed_by: parseInt(user.id),
          ip_address: clientIP,
          user_agent: userAgent,
          category: 'api_access',
          description: `API ${request.method} ${request.nextUrl.pathname}`,
          severity: 'info'
        })
      }

      return response
    } catch (error) {
      console.error('API auth error:', error)

      await logSecurityEvent({
        event_type: 'api_error',
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
}

// Input sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .trim()
    .slice(0, 1000) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

// Security headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}