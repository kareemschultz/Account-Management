"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Shield, Wifi, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { useNavigation } from "@/hooks/use-navigation"

const metrics = [
  {
    title: "Active Users",
    value: "1,024",
    change: "+12.5%",
    trend: "up",
    description: "vs last month",
    icon: Users,
    color: "text-blue-600",
    clickAction: "users",
  },
  {
    title: "Security Score",
    value: "94%",
    change: "+2.1%",
    trend: "up",
    description: "compliance rating",
    icon: Shield,
    color: "text-green-600",
    clickAction: "compliance",
  },
  {
    title: "VPN Utilization",
    value: "487",
    change: "-5.2%",
    trend: "down",
    description: "active connections",
    icon: Wifi,
    color: "text-purple-600",
    clickAction: "vpn",
  },
  {
    title: "Avg Response Time",
    value: "1.2s",
    change: "-15.3%",
    trend: "up",
    description: "system performance",
    icon: Clock,
    color: "text-orange-600",
    clickAction: "reports",
  },
]

const systemHealth = [
  { name: "Authentication", status: "Operational", uptime: 99.9, service: "Teleport" },
  { name: "Database", status: "Operational", uptime: 99.8, service: "Database" },
  { name: "API Gateway", status: "Degraded", uptime: 97.2, service: "API" },
  { name: "File Storage", status: "Operational", uptime: 99.9, service: "Storage" },
]

export function AdvancedMetricsGrid() {
  const { navigateToUsers, navigateToServices, navigateToVPN, navigateToReports } = useNavigation()

  const handleMetricClick = (action: string) => {
    switch (action) {
      case "users":
        navigateToUsers({ status: "active" })
        break
      case "compliance":
        window.location.href = "/compliance"
        break
      case "vpn":
        navigateToVPN({ status: "Connected" })
        break
      case "reports":
        navigateToReports({ type: "performance" })
        break
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        const trendColor = metric.trend === "up" ? "text-green-600" : "text-red-600"

        return (
          <Card
            key={metric.title}
            className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick(metric.clickAction)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
                <span className={trendColor}>{metric.change}</span>
                <span className="ml-1">{metric.description}</span>
              </div>
              {metric.title === "Security Score" && <Progress value={94} className="mt-2" />}
              <p className="text-xs text-muted-foreground mt-2">Click for details</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function SystemHealthOverview() {
  const { navigateToServices } = useNavigation()

  const handleSystemClick = (system: any) => {
    navigateToServices({ service: system.service, health: system.status })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Click systems to view service details</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemHealth.map((system) => (
          <div
            key={system.name}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleSystemClick(system)}
          >
            <div className="flex items-center gap-2">
              {system.status === "Operational" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">{system.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{system.uptime}%</span>
              <Badge variant={system.status === "Operational" ? "success" : "warning"}>{system.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
