"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, TestTube, Activity, Settings } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  url: string
  status: 'active' | 'inactive' | 'maintenance'
  health: 'healthy' | 'warning' | 'error'
  category: 'networking' | 'monitoring' | 'security' | 'management'
  version: string
  lastSync: string
  syncEnabled: boolean
  syncInterval: string
  authMethod: string
  apiKey?: string
  username?: string
  password?: string
}

interface EditServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  onSave: (service: Service) => void
}

export function EditServiceModal({ open, onOpenChange, service, onSave }: EditServiceModalProps) {
  const [formData, setFormData] = useState<Service>(
    service || {
      id: '',
      name: '',
      description: '',
      url: '',
      status: 'active',
      health: 'healthy',
      category: 'management',
      version: '',
      lastSync: new Date().toISOString(),
      syncEnabled: true,
      syncInterval: '6h',
      authMethod: 'api_key'
    }
  )
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean, message: string } | null>(null)

  const handleSave = async () => {
    onSave(formData)
    onOpenChange(false)
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnectionTestResult({ success: true, message: 'Connection successful!' })
    } catch (error) {
      setConnectionTestResult({ success: false, message: 'Connection failed. Please check your credentials.' })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const updateFormData = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Service: {service.name}
          </DialogTitle>
          <DialogDescription>
            Modify service configuration, authentication, and synchronization settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
            <TabsTrigger value="health">Health Check</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter service name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter service description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => updateFormData('version', e.target.value)}
                  placeholder="e.g., 2.4.1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connection" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">Service URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => updateFormData('url', e.target.value)}
                placeholder="https://service.company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authMethod">Authentication Method</Label>
              <Select value={formData.authMethod} onValueChange={(value) => updateFormData('authMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="basic_auth">Basic Authentication</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="jwt_token">JWT Token</SelectItem>
                  <SelectItem value="ldap_bind">LDAP Bind</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="username_password">Username/Password</SelectItem>
                  <SelectItem value="api_token">API Token</SelectItem>
                  <SelectItem value="shared_secret">Shared Secret</SelectItem>
                  <SelectItem value="radius_shared_secret">RADIUS Shared Secret</SelectItem>
                  <SelectItem value="elasticsearch_auth">Elasticsearch Authentication</SelectItem>
                  <SelectItem value="proprietary">Proprietary Protocol</SelectItem>
                  <SelectItem value="routeros_api">RouterOS API</SelectItem>
                  <SelectItem value="vendor_specific">Vendor Specific</SelectItem>
                  <SelectItem value="token_auth">Token Authentication</SelectItem>
                  <SelectItem value="ticket_auth">Ticket Authentication</SelectItem>
                  <SelectItem value="json_rpc_auth">JSON-RPC Authentication</SelectItem>
                  <SelectItem value="service_account_token">Service Account Token</SelectItem>
                  <SelectItem value="session_cookie">Session Cookie</SelectItem>
                  <SelectItem value="grpc_tls_cert">gRPC TLS Certificate</SelectItem>
                  <SelectItem value="custom">Custom Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authMethod === 'api_key' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey || ''}
                  onChange={(e) => updateFormData('apiKey', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
            )}

            {formData.authMethod === 'basic_auth' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username || ''}
                    onChange={(e) => updateFormData('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {connectionTestResult && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  connectionTestResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {connectionTestResult.message}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="syncEnabled"
                checked={formData.syncEnabled}
                onCheckedChange={(checked) => updateFormData('syncEnabled', checked)}
              />
              <Label htmlFor="syncEnabled">Enable automatic synchronization</Label>
            </div>

            {formData.syncEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Sync Interval</Label>
                  <Select value={formData.syncInterval} onValueChange={(value) => updateFormData('syncInterval', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">Every 5 minutes</SelectItem>
                      <SelectItem value="15m">Every 15 minutes</SelectItem>
                      <SelectItem value="1h">Every hour</SelectItem>
                      <SelectItem value="6h">Every 6 hours</SelectItem>
                      <SelectItem value="12h">Every 12 hours</SelectItem>
                      <SelectItem value="24h">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Last Synchronization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(formData.lastSync).toLocaleString()}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Activity className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Current Health Status:</Label>
                <Badge variant={formData.health === 'healthy' ? 'secondary' : formData.health === 'warning' ? 'destructive' : 'outline'}>
                  {formData.health}
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Health Check Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Health checks run automatically every 5 minutes to monitor service availability and performance.
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium">Response Time Threshold</Label>
                      <p className="text-muted-foreground">2000ms</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Timeout</Label>
                      <p className="text-muted-foreground">30s</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Retry Attempts</Label>
                      <p className="text-muted-foreground">3</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Check Interval</Label>
                      <p className="text-muted-foreground">5m</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Run Health Check Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
