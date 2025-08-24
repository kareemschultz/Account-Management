'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity, 
  Users, 
  Clock,
  TrendingUp,
  Ban,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface SecurityEvent {
  id: number
  user_id?: number
  event_type: string
  ip_address?: string
  user_agent?: string
  risk_score: number
  blocked: boolean
  details: Record<string, any>
  created_at: string
}

interface AuditLog {
  id: number
  user_name?: string
  performed_by_name?: string
  action: string
  target_type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: string
  description?: string
  performed_at: string
}

interface SecurityStats {
  total: number
  byRiskLevel: {
    low: number
    medium: number
    high: number
  }
  blocked: number
  last24Hours: number
}

export default function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSecurityData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      
      // Fetch security events
      const eventsResponse = await fetch('/api/audit/security-events?limit=20')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setSecurityEvents(eventsData.events || [])
        setSecurityStats(eventsData.statistics || null)
      }

      // Fetch audit logs
      const logsResponse = await fetch('/api/audit/logs?limit=20')
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setAuditLogs(logsData.logs || [])
      }

      setError(null)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      setError('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (score: number) => {
    if (score <= 33) return 'text-green-600 bg-green-50'
    if (score <= 66) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading && !securityStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Overview Cards */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All security events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{securityStats.byRiskLevel.high}</div>
              <p className="text-xs text-muted-foreground">
                Risk score 67-100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
              <Ban className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.blocked}</div>
              <p className="text-xs text-muted-foreground">
                Successfully blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.last24Hours}</div>
              <p className="text-xs text-muted-foreground">
                Recent activity
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Events and Audit Logs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>
                    Real-time security monitoring and threat detection
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchSecurityData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No security events detected</p>
                    <p className="text-sm">System is secure</p>
                  </div>
                ) : (
                  securityEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskLevelColor(event.risk_score)}>
                            Risk: {event.risk_score}
                          </Badge>
                          {event.blocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.created_at), 'PPpp')}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold">
                        {formatEventType(event.event_type)}
                      </h4>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {event.ip_address && (
                          <div>IP: {event.ip_address}</div>
                        )}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <div>
                            Details: {JSON.stringify(event.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>
                    System activity and user action logs
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchSecurityData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4" />
                    <p>No audit logs available</p>
                  </div>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.performed_at), 'PPpp')}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold">{log.action}</h4>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {log.performed_by_name && (
                          <div>By: {log.performed_by_name}</div>
                        )}
                        {log.user_name && log.user_name !== log.performed_by_name && (
                          <div>Target: {log.user_name}</div>
                        )}
                        <div>Type: {log.target_type}</div>
                        {log.description && (
                          <div>{log.description}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}