import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Service } from "@/lib/types"
import { Users } from "lucide-react"

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

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <service.icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle>{service.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
        <Badge className={getHealthColor(service.health)}>{service.health}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          {service.activeUsers} Active Users
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Roles:</p>
          <div className="flex flex-wrap gap-1">
            {service.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-transparent">
          Manage Service
        </Button>
      </CardFooter>
    </Card>
  )
}
