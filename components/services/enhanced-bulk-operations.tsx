"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { users, services } from "@/lib/data"
import {
  UserPlus,
  UserMinus,
  Users,
  AlertTriangle,
  Upload,
  Download,
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  Edit,
  Eye,
} from "lucide-react"
import { format, addDays } from "date-fns"

interface OperationTemplate {
  id: string
  name: string
  description: string
  operation: "assign" | "remove"
  userFilters: {
    departments: string[]
    employmentTypes: string[]
    authenticationTypes: string[]
  }
  groups: { serviceName: string; groupId: string; groupName: string }[]
  createdBy: string
  createdDate: string
  usageCount: number
}

interface ScheduledOperation {
  id: string
  name: string
  operation: "assign" | "remove"
  users: string[]
  groups: { serviceName: string; groupId: string; groupName: string }[]
  scheduledDate: string
  status: "Pending" | "Completed" | "Failed" | "Cancelled"
  createdBy: string
  approvalRequired: boolean
  approvedBy?: string
  approvalDate?: string
}

interface ApprovalRequest {
  id: string
  operationType: "bulk" | "scheduled"
  operation: "assign" | "remove"
  requestedBy: string
  requestDate: string
  userCount: number
  groupCount: number
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  reviewedBy?: string
  reviewDate?: string
  comments?: string
}

const operationTemplates: OperationTemplate[] = [
  {
    id: "template-1",
    name: "New Contractor Setup",
    description: "Standard access setup for new contractors",
    operation: "assign",
    userFilters: {
      departments: ["Temporary Staff"],
      employmentTypes: ["Contract", "Temporary"],
      authenticationTypes: ["Local"],
    },
    groups: [
      { serviceName: "Unifi", groupId: "unifi-3", groupName: "Guest Users" },
      { serviceName: "Grafana", groupId: "grafana-1", groupName: "LTE Monitoring" },
    ],
    createdBy: "John Smith",
    createdDate: "2025-06-15T10:00:00Z",
    usageCount: 15,
  },
  {
    id: "template-2",
    name: "Engineer Onboarding",
    description: "Full access setup for new engineers",
    operation: "assign",
    userFilters: {
      departments: ["Infrastructure-Data Communication", "LTE Grafana Unit"],
      employmentTypes: ["Permanent"],
      authenticationTypes: ["LDAP"],
    },
    groups: [
      { serviceName: "IPAM", groupId: "ipam-1", groupName: "Network Administrators" },
      { serviceName: "Unifi", groupId: "unifi-1", groupName: "Network Controllers" },
      { serviceName: "Grafana", groupId: "grafana-2", groupName: "Dashboard Editors" },
    ],
    createdBy: "Sarah Ahmed",
    createdDate: "2025-06-10T14:30:00Z",
    usageCount: 8,
  },
]

const scheduledOperations: ScheduledOperation[] = [
  {
    id: "sched-1",
    name: "Quarterly Access Review - Remove Expired",
    operation: "remove",
    users: ["5", "6"],
    groups: [
      { serviceName: "Unifi", groupId: "unifi-3", groupName: "Guest Users" },
      { serviceName: "eSight-SRV-2", groupId: "esight-1", groupName: "Server Operators" },
    ],
    scheduledDate: "2025-07-01T02:00:00Z",
    status: "Pending",
    createdBy: "John Smith",
    approvalRequired: true,
  },
]

const approvalRequests: ApprovalRequest[] = [
  {
    id: "approval-1",
    operationType: "bulk",
    operation: "assign",
    requestedBy: "Sarah Ahmed",
    requestDate: "2025-06-29T10:00:00Z",
    userCount: 25,
    groupCount: 3,
    reason: "Bulk assignment for new project team members",
    status: "Pending",
  },
  {
    id: "approval-2",
    operationType: "scheduled",
    operation: "remove",
    requestedBy: "Michael Chen",
    requestDate: "2025-06-28T15:30:00Z",
    userCount: 12,
    groupCount: 2,
    reason: "Scheduled removal of contractor access",
    status: "Approved",
    reviewedBy: "John Smith",
    reviewDate: "2025-06-29T09:00:00Z",
    comments: "Approved for scheduled execution",
  },
]

export function EnhancedBulkOperations() {
  const [activeTab, setActiveTab] = useState("operations")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<{ serviceName: string; groupId: string }[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enhanced Bulk Operations
          </CardTitle>
          <CardDescription>
            Advanced bulk operations with templates, scheduling, approvals, and CSV import/export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="csv">CSV Import/Export</TabsTrigger>
              <TabsTrigger value="rollback">Rollback</TabsTrigger>
            </TabsList>

            <TabsContent value="operations" className="space-y-4">
              <BulkOperationsTab
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                selectedGroups={selectedGroups}
                setSelectedGroups={setSelectedGroups}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <TemplatesTab templates={operationTemplates} onCreateTemplate={() => setIsTemplateDialogOpen(true)} />
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4">
              <SchedulingTab
                scheduledOperations={scheduledOperations}
                onScheduleOperation={() => setIsScheduleDialogOpen(true)}
              />
            </TabsContent>

            <TabsContent value="approvals" className="space-y-4">
              <ApprovalsTab
                approvalRequests={approvalRequests}
                onRequestApproval={() => setIsApprovalDialogOpen(true)}
              />
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <CsvImportExportTab csvFile={csvFile} setCsvFile={setCsvFile} />
            </TabsContent>

            <TabsContent value="rollback" className="space-y-4">
              <RollbackTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Creation Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <CreateTemplateDialog onClose={() => setIsTemplateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Schedule Operation Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <ScheduleOperationDialog onClose={() => setIsScheduleDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Approval Request Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <ApprovalRequestDialog onClose={() => setIsApprovalDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BulkOperationsTab({
  selectedUsers,
  setSelectedUsers,
  selectedGroups,
  setSelectedGroups,
  selectedTemplate,
  setSelectedTemplate,
}: {
  selectedUsers: string[]
  setSelectedUsers: (users: string[]) => void
  selectedGroups: { serviceName: string; groupId: string }[]
  setSelectedGroups: (groups: { serviceName: string; groupId: string }[]) => void
  selectedTemplate: string
  setSelectedTemplate: (template: string) => void
}) {
  const applyTemplate = (templateId: string) => {
    const template = operationTemplates.find((t) => t.id === templateId)
    if (template) {
      // Apply template filters to select users
      const filteredUsers = users.filter((user) => {
        const matchesDepartment =
          template.userFilters.departments.length === 0 || template.userFilters.departments.includes(user.department)
        const matchesEmploymentType =
          template.userFilters.employmentTypes.length === 0 ||
          template.userFilters.employmentTypes.includes(user.employmentType)
        const matchesAuthType =
          template.userFilters.authenticationTypes.length === 0 ||
          template.userFilters.authenticationTypes.includes(user.authenticationType)
        return matchesDepartment && matchesEmploymentType && matchesAuthType
      })

      setSelectedUsers(filteredUsers.map((u) => u.id))
      setSelectedGroups(template.groups.map((g) => ({ serviceName: g.serviceName, groupId: g.groupId })))

      toast({
        title: "Template Applied",
        description: `Applied "${template.name}" template. ${filteredUsers.length} users and ${template.groups.length} groups selected.`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select operation template" />
          </SelectTrigger>
          <SelectContent>
            {operationTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => applyTemplate(selectedTemplate)} disabled={!selectedTemplate} variant="outline">
          Apply Template
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Users ({selectedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId)
                  return user ? (
                    <div key={userId} className="flex items-center gap-2 p-2 border rounded">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.department}
                      </Badge>
                    </div>
                  ) : null
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Groups ({selectedGroups.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {selectedGroups.map((group) => {
                  const service = services.find((s) => s.name === group.serviceName)
                  const groupInfo = service?.customGroups.find((g) => g.id === group.groupId)
                  return groupInfo ? (
                    <div key={`${group.serviceName}-${group.groupId}`} className="p-2 border rounded">
                      <div className="font-medium text-sm">{groupInfo.name}</div>
                      <div className="text-xs text-muted-foreground">{group.serviceName}</div>
                    </div>
                  ) : null
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Ready to process {selectedUsers.length} users across {selectedGroups.length} groups
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Schedule Operation
          </Button>
          <Button variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Request Approval
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Execute Assignment
          </Button>
          <Button variant="destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            Execute Removal
          </Button>
        </div>
      </div>
    </div>
  )
}

function TemplatesTab({
  templates,
  onCreateTemplate,
}: {
  templates: OperationTemplate[]
  onCreateTemplate: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Operation Templates</h3>
        <Button onClick={onCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant={template.operation === "assign" ? "default" : "destructive"}>
                      {template.operation}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created by {template.createdBy}</span>
                    <span>Used {template.usageCount} times</span>
                    <span>{template.groups.length} groups</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SchedulingTab({
  scheduledOperations,
  onScheduleOperation,
}: {
  scheduledOperations: ScheduledOperation[]
  onScheduleOperation: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Scheduled Operations</h3>
        <Button onClick={onScheduleOperation}>
          <Clock className="mr-2 h-4 w-4" />
          Schedule Operation
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operation</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Users/Groups</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledOperations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{operation.name}</div>
                  <Badge variant={operation.operation === "assign" ? "default" : "destructive"} className="text-xs">
                    {operation.operation}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{format(new Date(operation.scheduledDate), "PPP p")}</TableCell>
              <TableCell>
                {operation.users.length} users, {operation.groups.length} groups
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    operation.status === "Pending"
                      ? "secondary"
                      : operation.status === "Completed"
                        ? "default"
                        : operation.status === "Failed"
                          ? "destructive"
                          : "outline"
                  }
                >
                  {operation.status}
                </Badge>
              </TableCell>
              <TableCell>{operation.createdBy}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {operation.status === "Pending" && (
                    <Button variant="ghost" size="sm">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ApprovalsTab({
  approvalRequests,
  onRequestApproval,
}: {
  approvalRequests: ApprovalRequest[]
  onRequestApproval: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Approval Requests</h3>
        <Button onClick={onRequestApproval}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Request Approval
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvalRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div>
                  <Badge variant={request.operation === "assign" ? "default" : "destructive"} className="text-xs">
                    {request.operation}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">{request.reason}</div>
                </div>
              </TableCell>
              <TableCell>{request.requestedBy}</TableCell>
              <TableCell>{format(new Date(request.requestDate), "PPP")}</TableCell>
              <TableCell>
                {request.userCount} users, {request.groupCount} groups
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "Pending"
                      ? "secondary"
                      : request.status === "Approved"
                        ? "default"
                        : "destructive"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {request.status === "Pending" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CsvImportExportTab({
  csvFile,
  setCsvFile,
}: {
  csvFile: File | null
  setCsvFile: (file: File | null) => void
}) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCsvFile(file)
    }
  }

  const handleImport = async () => {
    if (!csvFile) return

    try {
      // Simulate CSV processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Import Successful",
        description: "CSV file has been processed and operations queued for execution.",
      })
      setCsvFile(null)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to process CSV file. Please check the format and try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = async () => {
    try {
      // Simulate CSV generation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create sample CSV content
      const csvContent = `User ID,User Name,Service,Group,Operation,Status
1,John Smith,Teleport,Administrators,assign,completed
2,Sarah Ahmed,IPAM,Network Administrators,assign,completed
3,Michael Chen,Grafana,Dashboard Editors,assign,completed`

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bulk-operations-${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Bulk operations data has been exported to CSV.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Import
            </CardTitle>
            <CardDescription>Import bulk operations from CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="cursor-pointer" />
              {csvFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>CSV Format</Label>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <div>Required columns: User ID, Service Name, Group ID, Operation (assign/remove)</div>
                <div>Optional columns: Scheduled Date, Approval Required, Reason</div>
              </div>
            </div>

            <Button onClick={handleImport} disabled={!csvFile} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Operations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              CSV Export
            </CardTitle>
            <CardDescription>Export operation history and templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button onClick={handleExport} variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export Operation History
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export Templates
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export User-Group Matrix
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-timestamps" defaultChecked />
                  <Label htmlFor="include-timestamps" className="text-sm">
                    Include timestamps
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-metadata" defaultChecked />
                  <Label htmlFor="include-metadata" className="text-sm">
                    Include metadata
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-audit" />
                  <Label htmlFor="include-audit" className="text-sm">
                    Include audit trail
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded text-sm font-mono">
            <div>User ID,User Name,Service Name,Group ID,Group Name,Operation,Scheduled Date,Reason</div>
            <div>1,John Smith,Teleport,teleport-1,Administrators,assign,,New admin access</div>
            <div>2,Sarah Ahmed,IPAM,ipam-1,Network Administrators,assign,2025-07-01,Network team expansion</div>
            <div>3,Michael Chen,Grafana,grafana-2,Dashboard Editors,remove,,Project completion</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RollbackTab() {
  const [rollbackOperations, setRollbackOperations] = useState([
    {
      id: "op-001",
      name: "Engineering Team Bulk Assignment",
      operation: "assign" as const,
      executedDate: "2025-06-29T10:00:00Z",
      executedBy: "Sarah Ahmed",
      affectedUsers: 15,
      affectedGroups: 3,
      status: "completed" as const,
      canRollback: true,
    },
    {
      id: "op-002",
      name: "Contractor Access Removal",
      operation: "remove" as const,
      executedDate: "2025-06-28T14:30:00Z",
      executedBy: "John Smith",
      affectedUsers: 8,
      affectedGroups: 2,
      status: "completed" as const,
      canRollback: true,
    },
    {
      id: "op-003",
      name: "Quarterly Access Review",
      operation: "remove" as const,
      executedDate: "2025-06-27T09:00:00Z",
      executedBy: "Admin",
      affectedUsers: 25,
      affectedGroups: 5,
      status: "partially_rolled_back" as const,
      canRollback: false,
    },
  ])

  const handleRollback = async (operationId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setRollbackOperations((prev) =>
        prev.map((op) => (op.id === operationId ? { ...op, status: "rolled_back" as const, canRollback: false } : op)),
      )

      toast({
        title: "Rollback Successful",
        description: "Operation has been successfully rolled back.",
      })
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: "Failed to rollback operation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Operation Rollback</h3>
        <div className="text-sm text-muted-foreground">Operations can be rolled back within 30 days of execution</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operation</TableHead>
            <TableHead>Executed Date</TableHead>
            <TableHead>Executed By</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rollbackOperations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{operation.name}</div>
                  <Badge variant={operation.operation === "assign" ? "default" : "destructive"} className="text-xs">
                    {operation.operation}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{format(new Date(operation.executedDate), "PPP p")}</TableCell>
              <TableCell>{operation.executedBy}</TableCell>
              <TableCell>
                {operation.affectedUsers} users, {operation.affectedGroups} groups
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    operation.status === "completed"
                      ? "default"
                      : operation.status === "rolled_back"
                        ? "secondary"
                        : operation.status === "partially_rolled_back"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {operation.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {operation.canRollback && (
                    <Button variant="ghost" size="sm" onClick={() => handleRollback(operation.id)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Rollback Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• Rollback operations reverse the exact changes made during the original operation</div>
          <div>• Users assigned to groups will be removed, and users removed from groups will be re-added</div>
          <div>• Rollback operations are logged in the audit trail for compliance</div>
          <div>• Some operations may not be fully reversible if users or groups have been deleted</div>
          <div>• Rollback is only available for 30 days after the original operation</div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateTemplateDialog({ onClose }: { onClose: () => void }) {
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    operation: "assign" as "assign" | "remove",
    userFilters: {
      departments: [] as string[],
      employmentTypes: [] as string[],
      authenticationTypes: [] as string[],
    },
    groups: [] as { serviceName: string; groupId: string; groupName: string }[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Template Created",
        description: "Operation template has been created successfully.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Operation Template</DialogTitle>
        <DialogDescription>Create a reusable template for common bulk operations.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder="e.g., New Engineer Setup"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="operation-type">Operation Type</Label>
            <Select
              onValueChange={(value: "assign" | "remove") => setTemplateData({ ...templateData, operation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign">Assign to Groups</SelectItem>
                <SelectItem value="remove">Remove from Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={templateData.description}
            onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
            placeholder="Describe when this template should be used..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>User Filters</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="temporary">Temporary Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Employment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Auth Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Auth Types</SelectItem>
                <SelectItem value="ldap">LDAP</SelectItem>
                <SelectItem value="local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Template</Button>
        </DialogFooter>
      </form>
    </>
  )
}

function ScheduleOperationDialog({ onClose }: { onClose: () => void }) {
  const [scheduleData, setScheduleData] = useState({
    name: "",
    scheduledDate: addDays(new Date(), 1),
    requireApproval: false,
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Operation Scheduled",
        description: "Bulk operation has been scheduled successfully.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule operation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule Bulk Operation</DialogTitle>
        <DialogDescription>Schedule a bulk operation to run at a specific date and time.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-name">Operation Name</Label>
          <Input
            id="schedule-name"
            value={scheduleData.name}
            onChange={(e) => setScheduleData({ ...scheduleData, name: e.target.value })}
            placeholder="e.g., Quarterly Access Review"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Scheduled Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(scheduleData.scheduledDate, "PPP p")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduleData.scheduledDate}
                onSelect={(date) => date && setScheduleData({ ...scheduleData, scheduledDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="require-approval"
            checked={scheduleData.requireApproval}
            onCheckedChange={(checked) => setScheduleData({ ...scheduleData, requireApproval: checked as boolean })}
          />
          <Label htmlFor="require-approval">Require approval before execution</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule-reason">Reason</Label>
          <Textarea
            id="schedule-reason"
            value={scheduleData.reason}
            onChange={(e) => setScheduleData({ ...scheduleData, reason: e.target.value })}
            placeholder="Reason for scheduling this operation..."
            required
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Schedule Operation</Button>
        </DialogFooter>
      </form>
    </>
  )
}

function ApprovalRequestDialog({ onClose }: { onClose: () => void }) {
  const [approvalData, setApprovalData] = useState({
    reason: "",
    urgency: "normal" as "low" | "normal" | "high",
    businessJustification: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Approval Requested",
        description: "Your approval request has been submitted.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit approval request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Request Approval</DialogTitle>
        <DialogDescription>Submit this bulk operation for approval before execution.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="approval-reason">Reason for Operation</Label>
          <Input
            id="approval-reason"
            value={approvalData.reason}
            onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
            placeholder="Brief reason for this bulk operation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency Level</Label>
          <Select
            onValueChange={(value: "low" | "normal" | "high") => setApprovalData({ ...approvalData, urgency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Can wait for standard approval</SelectItem>
              <SelectItem value="normal">Normal - Standard approval process</SelectItem>
              <SelectItem value="high">High - Expedited approval needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-justification">Business Justification</Label>
          <Textarea
            id="business-justification"
            value={approvalData.businessJustification}
            onChange={(e) => setApprovalData({ ...approvalData, businessJustification: e.target.value })}
            placeholder="Detailed business justification for this operation..."
            required
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit for Approval</Button>
        </DialogFooter>
      </form>
    </>
  )
}
