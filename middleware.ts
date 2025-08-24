import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    const isAuth = !!token
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

    // Allow access to auth pages if not authenticated
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return null
    }

    // Redirect to login if not authenticated
    if (!isAuth) {
      let from = request.nextUrl.pathname
      if (request.nextUrl.search) {
        from += request.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(from)}`, request.url)
      )
    }

    // Role-based access control for specific routes
    const userRoles = token.roles as any[] || []
    const hasRole = (roleName: string) => userRoles.some(role => role.name === roleName)
    const hasAnyRole = (roleNames: string[]) => userRoles.some(role => roleNames.includes(role.name))

    // Define protected routes and their required roles (role-based access control)
    const protectedRoutes = [
      {
        path: '/users',
        roles: ['admin', 'super_admin', 'manager']
      },
      {
        path: '/services/manage',
        roles: ['admin', 'super_admin']
      },
      {
        path: '/settings',
        roles: ['admin', 'super_admin']
      },
      {
        path: '/audit-trail',
        roles: ['admin', 'super_admin', 'manager']
      },
      {
        path: '/compliance',
        roles: ['admin', 'super_admin', 'manager']
      },
      {
        path: '/import-export',
        roles: ['admin', 'super_admin']
      }
    ]

    // Check if current path requires specific roles
    for (const route of protectedRoutes) {
      if (request.nextUrl.pathname.startsWith(route.path)) {
        if (!hasAnyRole(route.roles)) {
          return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
        }
      }
    }

    // Add security headers
    const response = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
    )

    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This runs for every route protected by middleware
        return true // We handle authorization logic in the main function
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)",
  ],
}