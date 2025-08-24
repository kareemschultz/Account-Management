import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import crypto from 'crypto'

// CSRF token store (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string, expires: number }>()

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createCSRFToken(sessionId: string): string {
  const token = generateCSRFToken()
  const expires = Date.now() + (30 * 60 * 1000) // 30 minutes
  
  csrfTokenStore.set(sessionId, { token, expires })
  
  // Clean up expired tokens
  setTimeout(() => {
    const stored = csrfTokenStore.get(sessionId)
    if (stored && stored.expires < Date.now()) {
      csrfTokenStore.delete(sessionId)
    }
  }, expires - Date.now())
  
  return token
}

export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokenStore.delete(sessionId)
    return false
  }
  
  return stored.token === token
}

export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const method = request.method
    
    // Only protect state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const token = await getToken({ req: request })
      
      if (!token?.sub) {
        return NextResponse.json(
          { error: 'Authentication required for CSRF protection' },
          { status: 401 }
        )
      }
      
      const sessionId = token.sub
      const csrfToken = request.headers.get('X-CSRF-Token') || 
                       request.headers.get('x-csrf-token')
      
      if (!csrfToken) {
        return NextResponse.json(
          { error: 'CSRF token required' },
          { status: 403 }
        )
      }
      
      if (!verifyCSRFToken(sessionId, csrfToken)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
    
    return handler(request)
  }
}

// API route to get CSRF token
export async function getCSRFTokenRoute(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  const csrfToken = createCSRFToken(token.sub)
  
  return NextResponse.json(
    { csrfToken },
    { status: 200 }
  )
}