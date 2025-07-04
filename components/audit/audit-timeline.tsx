import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AuditLog } from "@/lib/types"
import { User, Shield, Server, Wifi, Cog } from "lucide-react"

const actionTypeIcons = {
  USER_MANAGEMENT: User,
  SECURITY: Shield,
  SERVICE_UPDATE: Server,
  VPN_CONFIG: Wifi,
  SYSTEM: Cog,
}

interface AuditTimelineProps {
  logs: AuditLog[]
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No audit logs found for the selected filters.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {logs.map((log) => {
        const Icon = actionTypeIcons[log.actionType] || Cog
        return (
          <div key={log.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-grow w-px bg-border" />
            </div>
            <div className="flex-1 pt-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={log.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{log.user.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">
                    <span className="font-semibold text-primary">{log.user.name}</span> performed action:{" "}
                    <span className="font-medium">{log.action}</span>
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</time>
              </div>
              <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm">{log.details}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
