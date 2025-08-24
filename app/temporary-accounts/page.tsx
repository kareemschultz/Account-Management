"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { Clock, Plus, CalendarIcon, AlertTriangle, User, XCircle, Eye, Download, Filter } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"

interface TemporaryAccount {
  id: string
  name: string
  email: string
  employeeId: string
  department: string
  position: string
  requestedBy: string
  approvedBy: string
  implementedBy: string
  createdDate: string
  expiryDate: string
  status: "Active" | "Expired" | "Pending" | "Revoked"
  accessLevel: "Basic" | "Standard" | "Elevated" | "Administrative"
  platforms: string[]
  services: string[]
  reason: string
  businessJustification: string
  extensionHistory: Array<{
    date: string
    newExpiryDate: string
    requestedBy: string
    approvedBy: string
    reason: string
  }>
  accessLog: Array<{
    date: string
    action: string
    platform: string
    details: string
  }>
}

const temporaryAccounts: TemporaryAccount[] = [
  {
    id: "temp-001",
    name: "Aisha Khan",
    email: "aisha.khan@contractor.example.com",
    employeeId: "EMP-2025-TEMP-001",
    department: "Temporary Staff",
    position: "IT Consultant",
    requestedBy: "Sarah Ahmed",
    approvedBy: "John Smith",
    implementedBy: "Michael Chen",
    createdDate: "2025-06-01T09:00:00Z",
    expiryDate: "2025-09-30T23:59:59Z",
    status: "Active",
    accessLevel: "Standard",
    platforms: ["Unifi", "Grafana", "VPN"],
    services: ["Network Monitoring", "WiFi Management"],
    reason: "3-month consulting project for network optimization",
    businessJustification: "External expertise required for LTE network upgrade project",
    extensionHistory: [],
    accessLog: [
      {
        date: "2025-06-29T14:00:00Z",
        action: "Login",
        platform: "Unifi",
        details: "Accessed WiFi controller dashboard",
      },
      {
        date: "2025-06-29T13:30:00Z",
        action: "VPN Connection",
        platform: "Mikrotik VPN",
        details: "Connected from IP 203.0.113.45",
      },
    ],
  },
  {
    id: "temp-002",
    name: "Robert Wilson",
    email: "r.wilson@vendor.example.com",
    employeeId: "EMP-2025-TEMP-002",
    department: "Data Centre",
    position: "Hardware Specialist",
    requestedBy: "David Garcia",
    approvedBy: "John Smith",
    implementedBy: "Sarah Ahmed",
    createdDate: "2025-05-15T10:00:00Z",
    expiryDate: "2025-07-15T23:59:59Z",
    status: "Active",
    accessLevel: "Elevated",
    platforms: ["eSight-SRV-2", "Zabbix", "VPN"],
    services: ["Server Management", "Hardware Monitoring"],
    reason: "Server hardware maintenance and upgrade",
    businessJustification: "Vendor support for critical server infrastructure maintenance",
    extensionHistory: [
      {
        date: "2025-06-15T09:00:00Z",
        newExpiryDate: "2025-07-15T23:59:59Z",
        requestedBy: "David Garcia",
        approvedBy: "John Smith",
        reason: "Additional time needed for server upgrades",
      },
    ],
    accessLog: [
      {
        date: "2025-06-28T16:00:00Z",
        action: "Login",
        platform: "eSight-SRV-2",
        details: "Accessed server management console",
      },
    ],
  },
  {
    id: "temp-003",
    name: "Lisa Chen",
    email: "l.chen@audit.example.com",
    employeeId: "EMP-2025-TEMP-003",
    department: "Finance & Admin. Services",
    position: "External Auditor",
    requestedBy: "Fatima Al-Zahra",
    approvedBy: "John Smith",
    implementedBy: "Admin",
    createdDate: "2025-06-20T08:00:00Z",
    expiryDate: "2025-07-05T23:59:59Z",
    status: "Expired",
    accessLevel: "Basic",
    platforms: ["ITop"],
    services: ["Service Requests", "Asset Management"],
    reason: "Annual compliance audit",
    businessJustification: "External audit required for SOC 2 compliance",
    extensionHistory: [],
    accessLog: [
      {
        date: "2025-07-05T17:00:00Z",
        action: "Account Disabled",
        platform: "System",
        details: "Account automatically disabled upon expiry",
      },
    ],
  },
]

export default function TemporaryAccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState<TemporaryAccount | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAccessLevel, setFilterAccessLevel] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAccounts = temporaryAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || account.status === filterStatus
    const matchesAccessLevel = filterAccessLevel === "all" || account.accessLevel === filterAccessLevel
    return matchesSearch && matchesStatus && matchesAccessLevel
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expired":
        return "destructive"
      case "Pending":
        return "secondary"
      case "Revoked":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getAccessLevelVariant = (level: string) => {
    switch (level) {
      case "Basic":
        return "outline"
      case "Standard":
        return "secondary"
      case "Elevated":
        return "default"
      case "Administrative":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date())
  }

  const handleExtendAccount = (account: TemporaryAccount) => {
    setSelectedAccount(account)
    setIsExtendDialogOpen(true)
  }

  const handleRevokeAccount = async (accountId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Account Revoked",
        description: "Temporary account has been revoked successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Temporary Accounts</h1>
          <p className="text-muted-foreground">
            Manage temporary user accounts with time-limited access and comprehensive tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Temporary Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Temporary Account</DialogTitle>
                <DialogDescription>
                  Create a new temporary account with time-limited access and specific permissions.
                </DialogDescription>
              </DialogHeader>
              <CreateTemporaryAccountForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription>Monitor and manage all temporary accounts with expiration tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccessLevel} onValueChange={setFilterAccessLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Elevated">Elevated</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const daysUntilExpiry = getDaysUntilExpiry(account.expiryDate)
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt={account.name} />
                          <AvatarFallback>
                            {account.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAccessLevelVariant(account.accessLevel)}>{account.accessLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {account.platforms.slice(0, 2).map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {account.platforms.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{account.platforms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {daysUntilExpiry < 0 ? (
                          <span className="text-red-600 text-sm">Expired</span>
                        ) : daysUntilExpiry <= 7 ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{daysUntilExpiry}d</span>
                          </div>
                        ) : (
                          <span className="text-sm">{daysUntilExpiry}d</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(account.expiryDate), "MMM dd")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{account.requestedBy}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAccount(account)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {account.status === "Active" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleExtendAccount(account)}>
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRevokeAccount(account.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Account Details Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-4xl">
          {selectedAccount && <AccountDetailsView account={selectedAccount} />}
        </DialogContent>
      </Dialog>

      {/* Extend Account Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          {selectedAccount && (
            <ExtendAccountForm account={selectedAccount} onClose={() => setIsExtendDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateTemporaryAccountForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    accessLevel: "Basic",
    platforms: [] as string[],
    expiryDate: addDays(new Date(), 30),
    reason: "",
    businessJustification: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Account Created",
        description: "Temporary account has been created successfully.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, department: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Temporary Staff">Temporary Staff</SelectItem>
              <SelectItem value="Contractors">Contractors</SelectItem>
              <SelectItem value="Vendors">Vendors</SelectItem>
              <SelectItem value="Auditors">Auditors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accessLevel">Access Level</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Elevated">Elevated</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.expiryDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiryDate}
                onSelect={(date) => date && setFormData({ ...formData, expiryDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Access</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="e.g., 3-month consulting project"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">Business Justification</Label>
        <Textarea
          id="justification"
          value={formData.businessJustification}
          onChange={(e) => setFormData({ ...formData, businessJustification: e.target.value })}
          placeholder="Detailed business justification for temporary access..."
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Account</Button>
      </DialogFooter>
    </form>
  )
}

function AccountDetailsView({ account }: { account: TemporaryAccount }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {account.name} - Account Details
        </DialogTitle>
        <DialogDescription>Comprehensive view of temporary account access and activity.</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="access">Access & Platforms</TabsTrigger>
          <TabsTrigger value="history">Extension History</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employee ID:</span>
                  <span className="text-sm font-medium">{account.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{account.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Position:</span>
                  <span className="text-sm font-medium">{account.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm font-medium">{account.department}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Access Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Access Level:</span>
                  <Badge variant={getAccessLevelVariant(account.accessLevel)}>{account.accessLevel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium">{format(new Date(account.createdDate), "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expires:</span>
                  <span className="text-sm font-medium">{format(new Date(account.expiryDate), "PPP")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Reason for Access:</Label>
                <p className="text-sm mt-1">{account.reason}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Business Justification:</Label>
                <p className="text-sm mt-1">{account.businessJustification}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Requested By:</Label>
                  <p className="text-sm font-medium">{account.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Approved By:</Label>
                  <p className="text-sm font-medium">{account.approvedBy}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Implemented By:</Label>
                  <p className="text-sm font-medium">{account.implementedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Platforms Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {account.platforms.map((platform) => (
                    <div key={platform} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{platform}</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Services Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {account.services.map((service) => (
                    <div key={service} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{service}</span>
                      <Badge variant="outline">Granted</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Extension History</CardTitle>
            </CardHeader>
            <CardContent>
              {account.extensionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No extensions have been requested for this account.
                </p>
              ) : (
                <div className="space-y-3">
                  {account.extensionHistory.map((extension, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">
                            Extended to {format(new Date(extension.newExpiryDate), "PPP")}
                          </p>
                          <p className="text-xs text-muted-foreground">{format(new Date(extension.date), "PPP")}</p>
                        </div>
                        <Badge variant="outline">Approved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{extension.reason}</p>
                      <div className="text-xs text-muted-foreground">
                        Requested by {extension.requestedBy} • Approved by {extension.approvedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {account.accessLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 border rounded">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.platform}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.date), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function ExtendAccountForm({ account, onClose }: { account: TemporaryAccount; onClose: () => void }) {
  const [newExpiryDate, setNewExpiryDate] = useState(addDays(new Date(account.expiryDate), 30))
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Extension Requested",
        description: "Account extension request has been submitted for approval.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit extension request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Extend Account Access</DialogTitle>
        <DialogDescription>Request an extension for {account.name}'s temporary account access.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Current Expiry Date</Label>
          <Input value={format(new Date(account.expiryDate), "PPP")} disabled />
        </div>

        <div className="space-y-2">
          <Label>New Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(newExpiryDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newExpiryDate}
                onSelect={(date) => date && setNewExpiryDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Extension</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide justification for the extension..."
            required
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Extension Request</Button>
        </DialogFooter>
      </form>
    </>
  )
}

// Helper functions
function getStatusVariant(status: string) {
  switch (status) {
    case "Active":
      return "default"
    case "Expired":
      return "destructive"
    case "Pending":
      return "secondary"
    case "Revoked":
      return "outline"
    default:
      return "secondary"
  }
}

function getAccessLevelVariant(level: string) {
  switch (level) {
    case "Basic":
      return "outline"
    case "Standard":
      return "secondary"
    case "Elevated":
      return "default"
    case "Administrative":
      return "destructive"
    default:
      return "outline"
  }
}
