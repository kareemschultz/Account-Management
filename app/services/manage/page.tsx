"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Trash2, Edit, Activity, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Service {
  id: string
  name: string
  description: string
  category: string
  apiEndpoint: string
  authMethod: string
  syncEnabled: boolean
  status: "active" | "inactive" | "error"
  lastSync: string
  userCount: number
}

const mockServices: Service[] = [
  {
    id: "1",
    name: "Microsoft 365",
    description: "Office productivity suite",
    category: "Productivity",
    apiEndpoint: "https://graph.microsoft.com/v1.0",
    authMethod: "OAuth 2.0",
    syncEnabled: true,
    status: "active",
    lastSync: "2024-01-15T10:30:00Z",
    userCount: 245,
  },
  {
    id: "2",
    name: "Salesforce",
    description: "Customer relationship management",
    category: "CRM",
    apiEndpoint: "https://api.salesforce.com/v1",
    authMethod: "OAuth 2.0",
    syncEnabled: true,
    status: "active",
    lastSync: "2024-01-15T09:15:00Z",
    userCount: 89,
  },
  {
    id: "3",
    name: "Slack",
    description: "Team communication platform",
    category: "Communication",
    apiEndpoint: "https://slack.com/api",
    authMethod: "Bearer Token",
    syncEnabled: false,
    status: "inactive",
    lastSync: "2024-01-10T14:20:00Z",
    userCount: 156,
  },
]

export default function ServiceManagePage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const { toast } = useToast()

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    category: "",
    apiEndpoint: "",
    authMethod: "",
    syncEnabled: false,
  })

  const handleAddService = () => {
    if (!newService.name || !newService.apiEndpoint) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const service: Service = {
      id: Date.now().toString(),
      ...newService,
      status: "inactive",
      lastSync: new Date().toISOString(),
      userCount: 0,
    }

    setServices([...services, service])
    setNewService({
      name: "",
      description: "",
      category: "",
      apiEndpoint: "",
      authMethod: "",
      syncEnabled: false,
    })
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Service added successfully",
    })
  }

  const handleToggleSync = (serviceId: string) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, syncEnabled: !service.syncEnabled } : service,
      ),
    )

    toast({
      title: "Sync Updated",
      description: "Service sync settings have been updated",
    })
  }

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter((service) => service.id !== serviceId))
    toast({
      title: "Service Deleted",
      description: "Service has been removed from the platform",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-muted-foreground">Manage and configure platform services</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="api-health">API Health</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Service</CardTitle>
                <CardDescription>Configure a new service for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g., Microsoft 365"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newService.category}
                      onValueChange={(value) => setNewService({ ...newService, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="CRM">CRM</SelectItem>
                        <SelectItem value="Communication">Communication</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Brief description of the service"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">API Endpoint *</Label>
                    <Input
                      id="apiEndpoint"
                      value={newService.apiEndpoint}
                      onChange={(e) => setNewService({ ...newService, apiEndpoint: e.target.value })}
                      placeholder="https://api.service.com/v1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authMethod">Authentication Method</Label>
                    <Select
                      value={newService.authMethod}
                      onValueChange={(value) => setNewService({ ...newService, authMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select auth method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                        <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                        <SelectItem value="API Key">API Key</SelectItem>
                        <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="syncEnabled"
                    checked={newService.syncEnabled}
                    onCheckedChange={(checked) => setNewService({ ...newService, syncEnabled: checked })}
                  />
                  <Label htmlFor="syncEnabled">Enable automatic synchronization</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddService}>Add Service</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                          {getStatusIcon(service.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Category: {service.category}</span>
                          <span>Users: {service.userCount}</span>
                          <span>Last Sync: {new Date(service.lastSync).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`sync-${service.id}`} className="text-sm">
                          Sync
                        </Label>
                        <Switch
                          id={`sync-${service.id}`}
                          checked={service.syncEnabled}
                          onCheckedChange={() => handleToggleSync(service.id)}
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Manage service categories and organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {["Productivity", "CRM", "Communication", "Development", "Security", "HR"].map((category) => (
                  <Card key={category}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {services.filter((s) => s.category === category).length} services
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Health Monitor</CardTitle>
              <CardDescription>Monitor the health and status of service APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.apiEndpoint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last checked: {new Date(service.lastSync).toLocaleTimeString()}
                      </p>
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
