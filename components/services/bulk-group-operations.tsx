"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { users, services } from "@/lib/data"
import { UserPlus, UserMinus, Users, Search, AlertTriangle } from "lucide-react"

interface BulkOperationSummary {
  operation: "assign" | "remove"
  users: string[]
  groups: { serviceName: string; groupId: string; groupName: string }[]
}

export function BulkGroupOperations() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<{ serviceName: string; groupId: string }[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [operationType, setOperationType] = useState<"assign" | "remove">("assign")
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const availableGroups = services
    .flatMap((service) =>
      service.customGroups.map((group) => ({
        serviceName: service.name,
        groupId: group.id,
        groupName: group.name,
        description: group.description,
        memberCount: group.members.length,
      })),
    )
    .filter((group) => serviceFilter === "all" || group.serviceName === serviceFilter)

  const departments = Array.from(new Set(users.map((user) => user.department)))

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleGroupSelection = (serviceName: string, groupId: string, checked: boolean) => {
    const groupKey = { serviceName, groupId }
    if (checked) {
      setSelectedGroups([...selectedGroups, groupKey])
    } else {
      setSelectedGroups(selectedGroups.filter((g) => !(g.serviceName === serviceName && g.groupId === groupId)))
    }
  }

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleBulkOperation = async (operation: "assign" | "remove") => {
    if (selectedUsers.length === 0 || selectedGroups.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one user and one group.",
        variant: "destructive",
      })
      return
    }

    setOperationType(operation)
    setIsConfirmDialogOpen(true)
  }

  const confirmBulkOperation = async () => {
    setIsProcessing(true)
    setIsConfirmDialogOpen(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const operationText = operationType === "assign" ? "assigned to" : "removed from"
      toast({
        title: "Bulk Operation Completed",
        description: `${selectedUsers.length} users ${operationText} ${selectedGroups.length} groups successfully.`,
      })

      // Reset selections
      setSelectedUsers([])
      setSelectedGroups([])
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: "An error occurred during the bulk operation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getOperationSummary = (): BulkOperationSummary => ({
    operation: operationType,
    users: selectedUsers,
    groups: selectedGroups.map((g) => {
      const group = availableGroups.find((ag) => ag.serviceName === g.serviceName && ag.groupId === g.groupId)
      return {
        serviceName: g.serviceName,
        groupId: g.groupId,
        groupName: group?.groupName || "Unknown",
      }
    }),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Group Operations
          </CardTitle>
          <CardDescription>Assign or remove multiple users from service groups simultaneously</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Select Users ({selectedUsers.length})</TabsTrigger>
              <TabsTrigger value="groups">Select Groups ({selectedGroups.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or employee ID..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-users"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={handleSelectAllUsers}
                />
                <Label htmlFor="select-all-users" className="text-sm font-medium">
                  Select all users ({filteredUsers.length})
                </Label>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.employeeId}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {user.authenticationType}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.position} • {user.department}
                        </div>
                      </div>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="flex gap-4">
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
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

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-4">
                  {services
                    .filter((service) => serviceFilter === "all" || service.name === serviceFilter)
                    .map((service) => {
                      const ServiceIcon = service.icon
                      return (
                        <div key={service.name} className="space-y-2">
                          <div className="flex items-center gap-2 font-medium">
                            <ServiceIcon className="h-4 w-4 text-primary" />
                            <span>{service.name}</span>
                          </div>
                          <div className="ml-6 space-y-2">
                            {service.customGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                                <Checkbox
                                  id={`group-${service.name}-${group.id}`}
                                  checked={selectedGroups.some(
                                    (g) => g.serviceName === service.name && g.groupId === group.id,
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleGroupSelection(service.name, group.id, checked as boolean)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{group.name}</span>
                                    {group.isDefault && (
                                      <Badge variant="outline" className="text-xs">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{group.description}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">{group.members.length} members</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedUsers.length} users and {selectedGroups.length} groups selected
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkOperation("assign")}
                disabled={selectedUsers.length === 0 || selectedGroups.length === 0 || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign to Groups
              </Button>
              <Button
                onClick={() => handleBulkOperation("remove")}
                disabled={selectedUsers.length === 0 || selectedGroups.length === 0 || isProcessing}
                variant="destructive"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Remove from Groups
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Bulk Operation
            </DialogTitle>
            <DialogDescription>
              Please review the operation details before proceeding. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Operation Type:</h4>
              <Badge variant={operationType === "assign" ? "default" : "destructive"} className="text-sm">
                {operationType === "assign" ? "Assign users to groups" : "Remove users from groups"}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">Selected Users ({selectedUsers.length}):</h4>
              <ScrollArea className="h-32 border rounded p-2">
                <div className="space-y-1">
                  {selectedUsers.map((userId) => {
                    const user = users.find((u) => u.id === userId)
                    return (
                      <div key={userId} className="text-sm flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                          <AvatarFallback className="text-xs">
                            {user?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user?.employeeId}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h4 className="font-medium mb-2">Selected Groups ({selectedGroups.length}):</h4>
              <ScrollArea className="h-32 border rounded p-2">
                <div className="space-y-1">
                  {selectedGroups.map((group) => {
                    const groupInfo = availableGroups.find(
                      (g) => g.serviceName === group.serviceName && g.groupId === group.groupId,
                    )
                    return (
                      <div key={`${group.serviceName}-${group.groupId}`} className="text-sm">
                        <span className="font-medium">{groupInfo?.groupName}</span>
                        <span className="text-muted-foreground"> in {group.serviceName}</span>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmBulkOperation}
              disabled={isProcessing}
              variant={operationType === "assign" ? "default" : "destructive"}
            >
              {isProcessing ? "Processing..." : `Confirm ${operationType === "assign" ? "Assignment" : "Removal"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
