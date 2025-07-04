"use client"

import { ldapConfiguration } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, TestTube, Save, Shield, Users, FolderSyncIcon as Sync } from "lucide-react"
import { useState } from "react"

export default function LdapSettingsPage() {
  const [config, setConfig] = useState(ldapConfiguration)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleTestConnection = async () => {
    setIsTesting(true)
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsTesting(false)
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LDAP Configuration</h1>
          <p className="text-muted-foreground">Configure LDAP/Active Directory integration for user authentication</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
            Test Connection
          </Button>
          <Button onClick={handleSyncNow} disabled={isSyncing}>
            {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sync className="mr-2 h-4 w-4" />}
            Sync Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="groups">Group Mapping</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LDAP Server Configuration</CardTitle>
              <CardDescription>Configure the connection to your LDAP/Active Directory server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server">LDAP Server</Label>
                  <Input
                    id="server"
                    value={config.server}
                    onChange={(e) => setConfig({ ...config, server: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseDN">Base DN</Label>
                <Input
                  id="baseDN"
                  value={config.baseDN}
                  onChange={(e) => setConfig({ ...config, baseDN: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bindDN">Bind DN</Label>
                <Input
                  id="bindDN"
                  value={config.bindDN}
                  onChange={(e) => setConfig({ ...config, bindDN: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchFilter">Search Filter</Label>
                <Textarea
                  id="searchFilter"
                  value={config.searchFilter}
                  onChange={(e) => setConfig({ ...config, searchFilter: e.target.value })}
                  rows={3}
                />
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Connection Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Attribute Mapping</CardTitle>
              <CardDescription>Map LDAP attributes to user fields in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username Attribute</Label>
                  <Input
                    id="username"
                    value={config.userAttributes.username}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, username: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Attribute</Label>
                  <Input
                    id="email"
                    value={config.userAttributes.email}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, email: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name Attribute</Label>
                  <Input
                    id="firstName"
                    value={config.userAttributes.firstName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, firstName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name Attribute</Label>
                  <Input
                    id="lastName"
                    value={config.userAttributes.lastName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, lastName: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department Attribute</Label>
                  <Input
                    id="department"
                    value={config.userAttributes.department}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, department: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groups">Groups Attribute</Label>
                  <Input
                    id="groups"
                    value={config.userAttributes.groups}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        userAttributes: { ...config.userAttributes, groups: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Attribute Mapping
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Mapping</CardTitle>
              <CardDescription>Map LDAP/AD groups to system roles and service groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(config.groupMapping).map(([ldapGroup, systemGroups], index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">LDAP Group</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block mb-3">{ldapGroup}</code>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mapped to System Groups:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {systemGroups.map((group) => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Add Group Mapping
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Group Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>Configure automatic synchronization with LDAP/AD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically synchronize users and groups from LDAP</p>
                </div>
                <Switch
                  checked={config.syncEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, syncEnabled: checked })}
                />
              </div>

              {config.lastSync && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sync className="h-4 w-4 text-primary" />
                    <span className="font-medium">Last Synchronization</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(config.lastSync).toLocaleString()}</p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Sync Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">156</div>
                    <div className="text-sm text-muted-foreground">Users Synced</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground">Groups Mapped</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Sync Errors</div>
                  </div>
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Sync Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
