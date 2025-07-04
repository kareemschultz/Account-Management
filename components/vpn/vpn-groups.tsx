import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mikrotikVpnGroups, fortiGateVpnGroups } from "@/lib/data"
import { Shield, PlusCircle } from "lucide-react"

export function VpnGroups() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>VPN Groups</CardTitle>
          <CardDescription>Manage user groups for VPN access.</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="bg-transparent">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="text-sm font-medium flex items-center mb-2">
            <Shield className="h-4 w-4 mr-2 text-blue-400" />
            Mikrotik Groups
          </h3>
          <div className="flex flex-wrap gap-2">
            {mikrotikVpnGroups.map((group) => (
              <Badge key={group} variant="secondary" className="text-sm">
                {group}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium flex items-center mb-2">
            <Shield className="h-4 w-4 mr-2 text-green-400" />
            FortiGate Groups
          </h3>
          <div className="flex flex-wrap gap-2">
            {fortiGateVpnGroups.map((group) => (
              <Badge key={group} variant="secondary" className="text-sm">
                {group}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
