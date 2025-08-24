"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Download, FileText, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ComplianceReport {
  id: string
  name: string
  type: string
  status: "completed" | "running" | "scheduled" | "failed"
  createdAt: string
  completedAt?: string
  fileSize?: string
  downloadUrl?: string
  schedule?: string
}

const mockReports: ComplianceReport[] = [
  {
    id: "1",
    name: "SOC 2 Type II Report - Q4 2023",
    type: "SOC 2",
    status: "completed",
    createdAt: "2024-01-15T10:00:00Z",
    completedAt: "2024-01-15T10:15:00Z",
    fileSize: "2.4 MB",
    downloadUrl: "/reports/soc2-q4-2023.pdf",
  },
  {
    id: "2",
    name: "GDPR Compliance Report - January 2024",
    type: "GDPR",
    status: "completed",
    createdAt: "2024-01-10T09:00:00Z",
    completedAt: "2024-01-10T09:30:00Z",
    fileSize: "1.8 MB",
    downloadUrl: "/reports/gdpr-jan-2024.pdf",
  },
  {
    id: "3",
    name: "ISO 27001 Audit Report",
    type: "ISO 27001",
    status: "running",
    createdAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "4",
    name: "Monthly Access Review",
    type: "Access Review",
    status: "scheduled",
    createdAt: "2024-01-20T00:00:00Z",
    schedule: "Monthly",
  },
]

export default function ComplianceReportsPage() {
  const [reports, setReports] = useState<ComplianceReport[]>(mockReports)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const { toast } = useToast()

  const [newReport, setNewReport] = useState({
    name: "",
    type: "",
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    schedule: "",
    includeUsers: true,
    includeServices: true,
    includeAuditLogs: true,
  })

  const handleCreateReport = () => {
    if (!newReport.name || !newReport.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const report: ComplianceReport = {
      id: Date.now().toString(),
      name: newReport.name,
      type: newReport.type,
      status: "running",
      createdAt: new Date().toISOString(),
      schedule: newReport.schedule || undefined,
    }

    setReports([report, ...reports])
    setShowCreateForm(false)
    setNewReport({
      name: "",
      type: "",
      dateRange: { from: undefined, to: undefined },
      schedule: "",
      includeUsers: true,
      includeServices: true,
      includeAuditLogs: true,
    })

    toast({
      title: "Report Created",
      description: "Compliance report generation has started",
    })

    // Simulate report completion after 3 seconds
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                fileSize: "1.2 MB",
                downloadUrl: `/reports/${report.id}.pdf`,
              }
            : r,
        ),
      )

      toast({
        title: "Report Ready",
        description: "Your compliance report has been generated successfully",
      })
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Reports</h1>
          <p className="text-muted-foreground">Generate and manage compliance reports</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Compliance Report</CardTitle>
                <CardDescription>Generate a new compliance report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name *</Label>
                    <Input
                      id="reportName"
                      value={newReport.name}
                      onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                      placeholder="e.g., SOC 2 Q1 2024 Report"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type *</Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOC 2">SOC 2 Type II</SelectItem>
                        <SelectItem value="GDPR">GDPR Compliance</SelectItem>
                        <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                        <SelectItem value="HIPAA">HIPAA Compliance</SelectItem>
                        <SelectItem value="Access Review">Access Review</SelectItem>
                        <SelectItem value="Custom">Custom Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Range From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newReport.dateRange.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReport.dateRange.from ? format(newReport.dateRange.from, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReport.dateRange.from}
                          onSelect={(date) =>
                            setNewReport({
                              ...newReport,
                              dateRange: { ...newReport.dateRange, from: date },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Range To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newReport.dateRange.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReport.dateRange.to ? format(newReport.dateRange.to, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReport.dateRange.to}
                          onSelect={(date) =>
                            setNewReport({
                              ...newReport,
                              dateRange: { ...newReport.dateRange, to: date },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Select
                    value={newReport.schedule}
                    onValueChange={(value) => setNewReport({ ...newReport, schedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="One-time report" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time report</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateReport}>Create Report</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {report.type}</span>
                        <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.completedAt && (
                          <span>Completed: {new Date(report.completedAt).toLocaleDateString()}</span>
                        )}
                        {report.fileSize && <span>Size: {report.fileSize}</span>}
                        {report.schedule && <span>Schedule: {report.schedule}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {report.status === "completed" && report.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {report.status === "running" && (
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured compliance report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "SOC 2 Type II", description: "System and Organization Controls audit report" },
                  { name: "GDPR Compliance", description: "General Data Protection Regulation compliance" },
                  { name: "ISO 27001", description: "Information security management system audit" },
                  { name: "HIPAA Compliance", description: "Health Insurance Portability and Accountability Act" },
                  { name: "Access Review", description: "Periodic user access review and certification" },
                  { name: "Custom Template", description: "Create your own compliance report template" },
                ].map((template) => (
                  <Card key={template.name}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((r) => r.schedule)
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.type} • {report.schedule} • Next run:{" "}
                          {new Date(Date.now() + 86400000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Active</Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
