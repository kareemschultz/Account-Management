"use client"

import { vpnUsers, vpnGroups } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Shield, Clock, Database, Settings } from "lucide-react"
import { useState } from "react"

export default function VpnUsersPage() {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = vpnUsers.filter((user) => {
    const matchesFilter = filter === "all" || user.vpnType === filter || user.status === filter
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success"
      case "Disabled":
        return "secondary"
      case "Suspended":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getAuthTypeIcon = (authType: string) => {
    switch (authType) {
      case "LDAP":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "Local":
        return <Database className="h-4 w-4 text-orange-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VPN Users & Groups</h1>
          <p className="text-muted-foreground">Manage VPN user accounts and group memberships</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add VPN User
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">VPN Users</TabsTrigger>
          <TabsTrigger value="groups">VPN Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="Mikrotik">Mikrotik</SelectItem>
                <SelectItem value="FortiGate">FortiGate</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((vpnUser) => (
              <Card key={vpnUser.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{vpnUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{vpnUser.username}</CardTitle>
                        <CardDescription>User ID: {vpnUser.userId}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(vpnUser.status)}>{vpnUser.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">VPN Type:</span>
                    <Badge variant="outline">{vpnUser.vpnType}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auth Type:</span>
                    <div className="flex items-center gap-1">
                      {getAuthTypeIcon(vpnUser.authenticationType)}
                      <span>{vpnUser.authenticationType}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Groups:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vpnUser.groups.map((group) => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IP Pool:</span>
                    <code className="text-xs bg-muted px-1 rounded">{vpnUser.ipPool}</code>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Used:</span>
                    <span>
                      {vpnUser.totalDataUsed} / {vpnUser.dataLimit || "Unlimited"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Sessions:</span>
                    <span>{vpnUser.maxSessions}</span>
                  </div>

                  {vpnUser.lastConnection && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last: {new Date(vpnUser.lastConnection).toLocaleString()}
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Manage User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {vpnGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield
                        className={`h-5 w-5 ${group.vpnType === "Mikrotik" ? "text-blue-500" : "text-green-500"}`}
                      />
                      {group.name}
                    </CardTitle>
                    <Badge variant="outline">{group.vpnType}</Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">IP Pool:</span>
                      <code className="block text-xs bg-muted px-2 py-1 rounded mt-1">{group.ipPool}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <div className="mt-1">
                        <Badge
                          variant={group.priority <= 2 ? "destructive" : group.priority <= 4 ? "warning" : "secondary"}
                        >
                          {group.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Default Limits:</span>
                    <div className="flex gap-2 mt-1">
                      {group.defaultDataLimit && (
                        <Badge variant="outline" className="text-xs">
                          Data: {group.defaultDataLimit}
                        </Badge>
                      )}
                      {group.defaultTimeLimit && (
                        <Badge variant="outline" className="text-xs">
                          Time: {group.defaultTimeLimit}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Allowed Networks:</span>
                    <div className="mt-1 space-y-1">
                      {group.allowedNetworks.slice(0, 3).map((network, index) => (
                        <code key={index} className="block text-xs bg-muted px-2 py-1 rounded">
                          {network}
                        </code>
                      ))}
                      {group.allowedNetworks.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{group.allowedNetworks.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                    </span>
                    <Button variant="outline" size="sm">
                      Manage Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
