import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, FileText, ExternalLink } from "lucide-react"

export default function SupportPage() {
  const tickets = [
    {
      id: "TICK-001",
      title: "VPN Connection Issues",
      status: "Open",
      priority: "High",
      created: "2025-06-29",
    },
    {
      id: "TICK-002",
      title: "User Access Request",
      status: "In Progress",
      priority: "Medium",
      created: "2025-06-28",
    },
    {
      id: "TICK-003",
      title: "Service Catalog Update",
      status: "Resolved",
      priority: "Low",
      created: "2025-06-27",
    },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "destructive"
      case "In Progress":
        return "warning"
      case "Resolved":
        return "success"
      default:
        return "secondary"
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "warning"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">Get help and manage support tickets.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
            <MessageCircle className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Get instant help from our support team</p>
            <Button className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Support</CardTitle>
            <Phone className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">24/7 Emergency Support</p>
            <p className="font-mono text-sm mb-4">+1 (555) 123-4567</p>
            <Button variant="outline" className="w-full bg-transparent">
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
            <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Browse our knowledge base</p>
            <Button variant="outline" className="w-full bg-transparent">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Submit a new support request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Brief description of the issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="access">Access Request</SelectItem>
                  <SelectItem value="account">Account Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Provide detailed information about your issue..." rows={4} />
            </div>
            <Button className="w-full">Submit Ticket</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>Track your support requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.id} • {ticket.created}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
