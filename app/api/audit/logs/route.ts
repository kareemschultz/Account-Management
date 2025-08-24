import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api-auth'
import { getAuditTrail } from '@/lib/audit'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  targetType: z.string().max(50).optional(),
  targetId: z.string().regex(/^\d+$/).transform(Number).optional(),
  action: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  performedBy: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export const GET = withApiAuth(
  async (request: NextRequest, { user }) => {
    const { searchParams } = new URL(request.url)
    
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      targetType: searchParams.get('targetType') || undefined,
      targetId: searchParams.get('targetId') || undefined,
      action: searchParams.get('action') || undefined,
      category: searchParams.get('category') || undefined,
      severity: searchParams.get('severity') || undefined,
      userId: searchParams.get('userId') || undefined,
      performedBy: searchParams.get('performedBy') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    })

    if (!queryResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors
      }, { status: 400 })
    }

    const { 
      page, limit, targetType, targetId, action, category, 
      severity, userId, performedBy, startDate, endDate 
    } = queryResult.data

    try {
      // Get audit logs with basic filtering
      const logs = await getAuditTrail(
        targetType,
        targetId,
        limit * page // Simple pagination
      )

      // Apply additional filters
      let filteredLogs = logs

      if (action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(action.toLowerCase())
        )
      }

      if (category) {
        filteredLogs = filteredLogs.filter(log => log.category === category)
      }

      if (severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === severity)
      }

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.user_id === userId)
      }

      if (performedBy) {
        filteredLogs = filteredLogs.filter(log => log.performed_by === performedBy)
      }

      if (startDate) {
        const start = new Date(startDate)
        filteredLogs = filteredLogs.filter(log => new Date(log.performed_at) >= start)
      }

      if (endDate) {
        const end = new Date(endDate)
        filteredLogs = filteredLogs.filter(log => new Date(log.performed_at) <= end)
      }

      // Check if user can see all logs or just their own
      if (!user.roles.some((r: any) => ['admin', 'super_admin'].includes(r.name))) {
        filteredLogs = filteredLogs.filter(log => 
          log.performed_by === parseInt(user.id) || log.user_id === parseInt(user.id)
        )
      }

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

      // Audit trail statistics
      const stats = {
        total: filteredLogs.length,
        byCategory: {} as Record<string, number>,
        bySeverity: {
          info: 0,
          warning: 0,
          error: 0,
          critical: 0
        },
        byAction: {} as Record<string, number>,
        last24Hours: filteredLogs.filter(log => 
          new Date(log.performed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }

      // Generate statistics
      filteredLogs.forEach(log => {
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
        stats.bySeverity[log.severity]++
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1
      })

      return NextResponse.json({
        logs: paginatedLogs.map(log => ({
          ...log,
          performed_at: log.performed_at.toISOString(),
          // Mask sensitive information for non-admin users
          ip_address: user.roles.some((r: any) => ['admin', 'super_admin'].includes(r.name))
            ? log.ip_address
            : log.ip_address ? '[MASKED]' : null,
          user_agent: user.roles.some((r: any) => ['admin', 'super_admin'].includes(r.name))
            ? log.user_agent
            : log.user_agent ? '[MASKED]' : null
        })),
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit),
          hasNext: endIndex < filteredLogs.length,
          hasPrev: page > 1
        },
        statistics: stats
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      )
    }
  },
  {
    allowedRoles: ['admin', 'super_admin', 'manager', 'user'],
    rateLimit: { windowMs: 60000, maxRequests: 50 }
  }
)