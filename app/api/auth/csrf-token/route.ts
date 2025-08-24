import { NextRequest } from 'next/server'
import { getCSRFTokenRoute } from '@/lib/csrf-protection'

export async function GET(request: NextRequest) {
  return getCSRFTokenRoute(request)
}