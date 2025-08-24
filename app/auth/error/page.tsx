'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact your administrator.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in with this account.'
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification token has expired or has already been used.'
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again.'
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The username or password you entered is incorrect.'
  },
  AccountLocked: {
    title: 'Account Locked',
    description: 'Your account has been temporarily locked due to multiple failed login attempts.'
  },
  AccountDisabled: {
    title: 'Account Disabled',
    description: 'Your account has been disabled. Please contact your administrator.'
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.'
  }
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('Default')

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam && errorMessages[errorParam]) {
      setError(errorParam)
    }
  }, [searchParams])

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div className=\"text-center\">
          <div className=\"mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-600\">
            <AlertTriangle className=\"h-8 w-8 text-white\" />
          </div>
          <h2 className=\"mt-6 text-3xl font-bold tracking-tight text-gray-900\">
            Authentication Error
          </h2>
          <p className=\"mt-2 text-sm text-gray-600\">
            There was a problem signing you in
          </p>
        </div>

        <Card className=\"mt-8\">
          <CardHeader className=\"space-y-1\">
            <CardTitle className=\"text-xl font-bold text-center text-red-600\">
              {errorInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <Alert variant=\"destructive\">
              <AlertTriangle className=\"h-4 w-4\" />
              <AlertDescription>
                {errorInfo.description}
              </AlertDescription>
            </Alert>

            <div className=\"space-y-3\">
              <Button asChild className=\"w-full\">
                <Link href=\"/auth/signin\">
                  <ArrowLeft className=\"mr-2 h-4 w-4\" />
                  Try Again
                </Link>
              </Button>
            </div>

            <div className=\"text-center text-sm text-gray-600 space-y-2\">
              {error === 'AccountLocked' && (
                <div className=\"bg-blue-50 p-3 rounded-lg\">
                  <p className=\"font-medium text-blue-800\">Account Recovery</p>
                  <p className=\"text-blue-600\">Your account will be unlocked automatically after 15 minutes, or contact your administrator for immediate assistance.</p>
                </div>
              )}

              {error === 'AccountDisabled' && (
                <div className=\"bg-orange-50 p-3 rounded-lg\">
                  <p className=\"font-medium text-orange-800\">Contact Administrator</p>
                  <p className=\"text-orange-600\">Please reach out to your IT administrator to reactivate your account.</p>
                </div>
              )}

              <div className=\"pt-4 border-t\">
                <p className=\"text-xs\">
                  If you continue to experience issues, please contact:
                </p>
                <p className=\"text-xs font-medium\">
                  IT Support - help@esm-platform.local
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className=\"text-center text-xs text-gray-500\">
          <p>ESM Platform - Secure Authentication System</p>
          <p>Error Code: {error} • {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}