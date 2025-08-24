"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BulkGroupOperations } from "@/components/services/bulk-group-operations"
import { EnhancedBulkOperations } from "@/components/services/enhanced-bulk-operations"
import { BulkOperationHistory } from "@/components/services/bulk-operation-history"
import { services, users } from "@/lib/data"
import { Users, Plus, Search, Eye, Edit, Trash2, UserPlus, UserMinus } from "lucide-react"

export default function ServiceGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  const filteredGroups = services
    .filter((service) => selectedService === "all" || service.name === selectedService)
    .flatMap((service) =>
      service.customGroups.map((group) => ({
        ...group,
        serviceName: service.name,
        serviceIcon: service.icon,
      })),
    )
    .filter(
      (group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Groups Management</h1>
          <p className="text-muted-foreground">Manage service-specific groups, permissions, and bulk operations.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Groups Overview</TabsTrigger>
          <TabsTrigger value="bulk-basic">Basic Bulk Operations</TabsTrigger>
          <TabsTrigger value="bulk-advanced">Advanced Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Service Groups
              </CardTitle>
              <CardDescription>Manage groups across all services with detailed member information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => {
                    const ServiceIcon = group.serviceIcon
                    return (
                      <TableRow key={`${group.serviceName}-${group.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-muted-foreground">{group.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ServiceIcon className="h-4 w-4 text-primary" />
                            <span>{group.serviceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.members.length}</span>
                            <div className="flex -space-x-1">
                              {group.members.slice(0, 3).map((memberId) => {
                                const user = users.find((u) => u.id === memberId)
                                return user ? (
                                  <Avatar key={memberId} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                    <AvatarFallback className="text-xs">{user.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                ) : null
                              })}
                              {group.members.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                  +{group.members.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.permissions.slice(0, 2).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace("_", " ")}
                              </Badge>
                            ))}
                            {group.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{group.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={group.isDefault ? "default" : "secondary"}>
                            {group.isDefault ? "Default" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(group)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            {!group.isDefault && (
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Group Details Dialog */}
          <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
            <DialogContent className="max-w-2xl">
              {selectedGroup && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {selectedGroup.name} - {selectedGroup.serviceName}
                    </DialogTitle>
                    <DialogDescription>Group details, members, and permissions management.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Permissions ({selectedGroup.permissions.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroup.permissions.map((permission: string) => (
                          <Badge key={permission} variant="outline">
                            {permission.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Members ({selectedGroup.members.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedGroup.members.map((memberId: string) => {
                          const user = users.find((u) => u.id === memberId)
                          return user ? (
                            <div key={memberId} className="flex items-center gap-3 p-2 border rounded">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.department}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="bulk-basic">
          <BulkGroupOperations />
        </TabsContent>

        <TabsContent value="bulk-advanced">
          <EnhancedBulkOperations />
        </TabsContent>

        <TabsContent value="history">
          <BulkOperationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
