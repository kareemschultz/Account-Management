import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Shield, Users, Server } from "lucide-react"

export function NetworkTopology() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Topology</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6 min-h-[200px]">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col items-center gap-2">
            <Cloud className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs font-medium">Internet</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className="flex flex-col items-center gap-2">
            <Server className="h-12 w-12 text-primary" />
            <span className="text-xs font-medium">Firewall</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xs font-medium">Mikrotik VPN</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xs font-medium">FortiGate VPN</span>
            </div>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className="flex flex-col items-center gap-2">
            <Users className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs font-medium">Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
