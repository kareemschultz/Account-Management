"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Lock, CheckCircle } from "lucide-react"
import { useNavigation } from "@/hooks/use-navigation"

const incidents = [
  {
    id: "SEC-001",
    title: "Suspicious Login Attempt",
    severity: "High",
    status: "Investigating",
    time: "2 hours ago",
    description: "Multiple failed login attempts from unusual location",
    icon: AlertTriangle,
    user: "System",
    actionType: "SECURITY",
  },
  {
    id: "SEC-002",
    title: "VPN Certificate Expiring",
    severity: "Medium",
    status: "Scheduled",
    time: "1 day ago",
    description: "SSL certificate expires in 30 days",
    icon: Lock,
    user: "System",
    actionType: "VPN_CONFIG",
  },
  {
    id: "SEC-003",
    title: "Compliance Audit Completed",
    severity: "Low",
    status: "Resolved",
    time: "3 days ago",
    description: "SOC 2 audit completed successfully",
    icon: CheckCircle,
    user: "Admin",
    actionType: "SECURITY",
  },
  {
    id: "SEC-004",
    title: "Unauthorized Access Blocked",
    severity: "High",
    status: "Resolved",
    time: "5 days ago",
    description: "Blocked access attempt to restricted service",
    icon: Shield,
    user: "System",
    actionType: "SECURITY",
  },
]

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "High":
      return "destructive"
    case "Medium":
      return "warning"
    case "Low":
      return "secondary"
    default:
      return "outline"
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Investigating":
      return "destructive"
    case "Scheduled":
      return "warning"
    case "Resolved":
      return "success"
    default:
      return "secondary"
  }
}

export function SecurityIncidentsTimeline() {
  const { navigateToAuditTrail } = useNavigation()

  const handleIncidentClick = (incident: any) => {
    navigateToAuditTrail({
      user: incident.user,
      actionType: incident.actionType,
    })
  }

  const handleSeverityClick = (severity: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigateToAuditTrail({ actionType: "SECURITY" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Incidents</CardTitle>
        <CardDescription>Recent security events and their status. Click incidents to view audit logs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => {
            const Icon = incident.icon
            return (
              <div
                key={incident.id}
                className="flex gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleIncidentClick(incident)}
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">{incident.title}</p>
                    <span className="text-xs text-muted-foreground">{incident.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                  <div className="flex gap-2">
                    <Badge
                      variant={getSeverityVariant(incident.severity)}
                      className="text-xs cursor-pointer"
                      onClick={(e) => handleSeverityClick(incident.severity, e)}
                    >
                      {incident.severity}
                    </Badge>
                    <Badge variant={getStatusVariant(incident.status)} className="text-xs">
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Click incidents to view related audit logs, or severity badges to filter security events
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
