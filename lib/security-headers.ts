import { NextRequest, NextResponse } from 'next/server'

export interface SecurityConfig {
  csp?: {
    enabled: boolean
    directives?: Record<string, string[]>
  }
  hsts?: {
    enabled: boolean
    maxAge?: number
    includeSubDomains?: boolean
    preload?: boolean
  }
  cors?: {
    enabled: boolean
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  }
}

const defaultSecurityConfig: SecurityConfig = {
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      'font-src': ["'self'", 'fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'object-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': []
    }
  },
  hsts: {
    enabled: process.env.NODE_ENV === 'production',
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  cors: {
    enabled: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version'
    ],
    credentials: true
  }
}

export function buildCSPHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

export function addSecurityHeaders(
  response: NextResponse,
  config: SecurityConfig = defaultSecurityConfig
): NextResponse {
  // Content Security Policy
  if (config.csp?.enabled && config.csp.directives) {
    const cspValue = buildCSPHeader(config.csp.directives)
    response.headers.set('Content-Security-Policy', cspValue)
  }

  // HTTP Strict Transport Security
  if (config.hsts?.enabled) {
    let hstsValue = `max-age=${config.hsts.maxAge || 31536000}`
    if (config.hsts.includeSubDomains) {
      hstsValue += '; includeSubDomains'
    }
    if (config.hsts.preload) {
      hstsValue += '; preload'
    }
    response.headers.set('Strict-Transport-Security', hstsValue)
  }

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()'
  )

  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')

  // Cache Control for sensitive pages
  if (response.url && (
    response.url.includes('/auth/') ||
    response.url.includes('/api/') ||
    response.url.includes('/admin/')
  )) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export function handleCORS(
  request: NextRequest,
  response: NextResponse,
  config: SecurityConfig = defaultSecurityConfig
): NextResponse {
  if (!config.cors?.enabled) return response

  const origin = request.headers.get('origin')
  const method = request.method

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 200 })
    
    // Set CORS headers for preflight
    if (origin && config.cors.allowedOrigins?.includes(origin)) {
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    if (config.cors.allowedMethods) {
      preflightResponse.headers.set(
        'Access-Control-Allow-Methods',
        config.cors.allowedMethods.join(', ')
      )
    }
    
    if (config.cors.allowedHeaders) {
      preflightResponse.headers.set(
        'Access-Control-Allow-Headers',
        config.cors.allowedHeaders.join(', ')
      )
    }
    
    if (config.cors.credentials) {
      preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    preflightResponse.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    
    return preflightResponse
  }

  // Set CORS headers for actual requests
  if (origin && config.cors.allowedOrigins?.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  if (config.cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  // Expose headers that client can access
  response.headers.set(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  )

  return response
}

export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: SecurityConfig
) {
  return async (request: NextRequest) => {
    let response: NextResponse

    try {
      response = await handler(request)
    } catch (error) {
      console.error('Handler error:', error)
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Add security headers
    response = addSecurityHeaders(response, config)

    // Handle CORS
    response = handleCORS(request, response, config)

    return response
  }
}

// Security header validation
export function validateSecurityHeaders(headers: Headers): {
  valid: boolean
  missing: string[]
  warnings: string[]
} {
  const required = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy'
  ]
  
  const recommended = [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'Permissions-Policy'
  ]
  
  const missing: string[] = []
  const warnings: string[] = []
  
  for (const header of required) {
    if (!headers.has(header)) {
      missing.push(header)
    }
  }
  
  for (const header of recommended) {
    if (!headers.has(header)) {
      warnings.push(`Recommended header missing: ${header}`)
    }
  }
  
  // Check for insecure values
  const xFrameOptions = headers.get('X-Frame-Options')
  if (xFrameOptions && !['DENY', 'SAMEORIGIN'].includes(xFrameOptions.toUpperCase())) {
    warnings.push('X-Frame-Options should be DENY or SAMEORIGIN')
  }
  
  const xContentType = headers.get('X-Content-Type-Options')
  if (xContentType && xContentType.toLowerCase() !== 'nosniff') {
    warnings.push('X-Content-Type-Options should be nosniff')
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}