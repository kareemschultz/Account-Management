import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api-auth'
import { getSecurityEvents } from '@/lib/audit'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  eventType: z.string().max(50).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  riskScore: z.enum(['low', 'medium', 'high']).optional()
})

export const GET = withApiAuth(
  async (request: NextRequest, { user }) => {
    const { searchParams } = new URL(request.url)
    
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      userId: searchParams.get('userId') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      riskScore: searchParams.get('riskScore') || undefined
    })

    if (!queryResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors
      }, { status: 400 })
    }

    const { page, limit, userId, eventType, startDate, endDate, riskScore } = queryResult.data

    try {
      // Build additional filters
      const events = await getSecurityEvents(
        userId || undefined,
        limit * page // Simple pagination for now
      )

      // Apply additional filters
      let filteredEvents = events

      if (eventType) {
        filteredEvents = filteredEvents.filter(event => event.event_type === eventType)
      }

      if (startDate) {
        const start = new Date(startDate)
        filteredEvents = filteredEvents.filter(event => new Date(event.created_at) >= start)
      }

      if (endDate) {
        const end = new Date(endDate)
        filteredEvents = filteredEvents.filter(event => new Date(event.created_at) <= end)
      }

      if (riskScore) {
        const scoreRanges = {
          low: [0, 33],
          medium: [34, 66],
          high: [67, 100]
        }
        const [min, max] = scoreRanges[riskScore]
        filteredEvents = filteredEvents.filter(event => 
          event.risk_score >= min && event.risk_score <= max
        )
      }

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

      // Security events summary statistics
      const stats = {
        total: filteredEvents.length,
        byType: {} as Record<string, number>,
        byRiskLevel: {
          low: 0,
          medium: 0,
          high: 0
        },
        blocked: filteredEvents.filter(e => e.blocked).length,
        last24Hours: filteredEvents.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }

      // Count by event type
      filteredEvents.forEach(event => {
        stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1
        
        if (event.risk_score <= 33) stats.byRiskLevel.low++
        else if (event.risk_score <= 66) stats.byRiskLevel.medium++
        else stats.byRiskLevel.high++
      })

      return NextResponse.json({
        events: paginatedEvents.map(event => ({
          ...event,
          created_at: event.created_at.toISOString(),
          // Mask sensitive details for non-admin users
          details: user.roles.some((r: any) => ['admin', 'super_admin'].includes(r.name)) 
            ? event.details 
            : { ...event.details, user_agent: '[MASKED]', ip_address: '[MASKED]' }
        })),
        pagination: {
          page,
          limit,
          total: filteredEvents.length,
          totalPages: Math.ceil(filteredEvents.length / limit),
          hasNext: endIndex < filteredEvents.length,
          hasPrev: page > 1
        },
        statistics: stats
      })
    } catch (error) {
      console.error('Error fetching security events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch security events' },
        { status: 500 }
      )
    }
  },
  {
    allowedRoles: ['admin', 'super_admin', 'manager'],
    rateLimit: { windowMs: 60000, maxRequests: 30 }
  }
)