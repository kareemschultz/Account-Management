"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  severity: "critical" | "warning" | "info"
  timestamp: Date
  acknowledged: boolean
}

const initialAlerts: Alert[] = [
  {
    id: "alert-1",
    title: "High CPU Usage",
    message: "Database server CPU usage above 90% for 5 minutes",
    severity: "critical",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: "alert-2",
    title: "Certificate Expiring",
    message: "SSL certificate for VPN gateway expires in 7 days",
    severity: "warning",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: "alert-3",
    title: "Backup Completed",
    message: "Daily backup completed successfully",
    severity: "info",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    acknowledged: true,
  },
]

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "info":
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive"
    case "warning":
      return "warning"
    case "info":
      return "secondary"
    default:
      return "outline"
  }
}

export function RealTimeAlerts() {
  const [alerts, setAlerts] = React.useState<Alert[]>(initialAlerts)

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)))
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  const unacknowledgedCount = alerts.filter((alert) => !alert.acknowledged).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Real-time Alerts</CardTitle>
          <CardDescription>System notifications and warnings</CardDescription>
        </div>
        {unacknowledgedCount > 0 && <Badge variant="destructive">{unacknowledgedCount} new</Badge>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${alert.acknowledged ? "opacity-60" : ""}`}
              >
                <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => dismissAlert(alert.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                      {alert.severity}
                    </Badge>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs bg-transparent"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
