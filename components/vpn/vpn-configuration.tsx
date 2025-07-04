import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function VpnConfiguration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>VPN Configuration</CardTitle>
        <CardDescription>Global settings for VPN services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="security">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="vpn-enable" className="flex flex-col space-y-1">
                <span>Enable SSL VPN</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Globally enable or disable the SSL VPN portal.
                </span>
              </Label>
              <Switch id="vpn-enable" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-portal">Default Portal</Label>
              <Select defaultValue="it_staff">
                <SelectTrigger id="default-portal">
                  <SelectValue placeholder="Select a portal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it_staff">IT Staff Portal</SelectItem>
                  <SelectItem value="remote_employees">Remote Employees Portal</SelectItem>
                  <SelectItem value="vendors">Vendor Access Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="security" className="mt-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="2fa-enable" className="flex flex-col space-y-1">
                <span>Require Two-Factor Authentication</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Enforce 2FA for all VPN connections.
                </span>
              </Label>
              <Switch id="2fa-enable" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="geo-restrict" className="flex flex-col space-y-1">
                <span>Geo-location Restriction</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Only allow connections from approved countries.
                </span>
              </Label>
              <Switch id="geo-restrict" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="480" />
            </div>
          </TabsContent>
          <TabsContent value="certificates" className="mt-4 space-y-4">
            <div className="flex justify-between items-center p-2 border rounded-lg">
              <div>
                <p className="font-medium">DigiCert Global Root CA</p>
                <p className="text-xs text-muted-foreground">Expires: 10 Nov 2031</p>
              </div>
              <Badge variant="success">Valid</Badge>
            </div>
            <div className="flex justify-between items-center p-2 border rounded-lg">
              <div>
                <p className="font-medium">FortiGate VPN Certificate</p>
                <p className="text-xs text-muted-foreground">Expires: 15 Aug 2025</p>
              </div>
              <Badge variant="success">Valid</Badge>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Upload New Certificate
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
