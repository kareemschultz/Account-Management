"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { services } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { useNavigation } from "@/hooks/use-navigation"

const getHealthColor = (health: "Operational" | "Degraded" | "Outage") => {
  switch (health) {
    case "Operational":
      return "bg-success hover:bg-success"
    case "Degraded":
      return "bg-warning hover:bg-warning"
    case "Outage":
      return "bg-destructive hover:bg-destructive"
  }
}

export function ServiceHealth() {
  const { navigateToServices } = useNavigation()

  const handleServiceClick = (serviceName: string, health: string) => {
    navigateToServices({ service: serviceName, health })
  }

  const handleHealthFilterClick = (health: string) => {
    navigateToServices({ health })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Health</CardTitle>
        <CardDescription>Real-time status of core services. Click to view details.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {services.slice(0, 5).map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleServiceClick(service.name, service.health)}
          >
            <div className="flex items-center gap-2">
              <service.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{service.name}</span>
            </div>
            <Badge
              className={`${getHealthColor(service.health)} cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation()
                handleHealthFilterClick(service.health)
              }}
            >
              {service.health}
            </Badge>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Click service names for details, or health badges to filter by status
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
