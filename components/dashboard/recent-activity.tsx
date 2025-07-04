"use client"

import type React from "react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auditLogs } from "@/lib/data"
import { useNavigation } from "@/hooks/use-navigation"

export function RecentActivity() {
  const { navigateToAuditTrail } = useNavigation()

  const handleActivityClick = (log: any) => {
    navigateToAuditTrail({
      user: log.user.name,
      actionType: log.actionType,
    })
  }

  const handleUserClick = (userName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigateToAuditTrail({ user: userName })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          A log of recent critical system events. Click activities to view full audit trail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleActivityClick(log)}
          >
            <Avatar
              className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary"
              onClick={(e) => handleUserClick(log.user.name, e)}
            >
              <AvatarImage src={log.user.avatar || "/placeholder.svg"} alt="Avatar" />
              <AvatarFallback>{log.user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">
                <span
                  className="font-bold text-primary hover:underline cursor-pointer"
                  onClick={(e) => handleUserClick(log.user.name, e)}
                >
                  {log.user.name}
                </span>{" "}
                {log.action.toLowerCase()}
              </p>
              <p className="text-sm text-muted-foreground">{log.details}</p>
              <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
        <div className="mt-4 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Click activities for full audit trail, or user avatars to filter by user
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
