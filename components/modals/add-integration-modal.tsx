"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TestTube, Save } from 'lucide-react'

interface Service {
  name: string
  description: string
  url: string
  status: 'connected' | 'disconnected' | 'syncing'
  health: 'healthy' | 'warning' | 'error'
  category: 'networking' | 'monitoring' | 'security' | 'management'
  version: string
  lastSync: string
  syncEnabled: boolean
  syncInterval: string
  authMethod: string
  users: number
  apiKey?: string
  username?: string
  password?: string
}

interface AddIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (service: Omit<Service, 'id'>) => void
}

export function AddIntegrationModal({ open, onOpenChange, onSave }: AddIntegrationModalProps) {
  const [formData, setFormData] = useState<Omit<Service, 'users' | 'lastSync' | 'status' | 'health'>>({
    name: '',
    description: '',
    url: '',
    category: 'management',
    version: '1.0.0',
    syncEnabled: true,
    syncInterval: '6h',
    authMethod: 'api_key'
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean, message: string } | null>(null)

  const handleSave = async () => {
    const newService: Omit<Service, 'id'> = {
      ...formData,
      status: 'disconnected',
      health: 'warning',
      users: 0,
      lastSync: new Date().toISOString()
    }
    onSave(newService)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      category: 'management',
      version: '1.0.0',
      syncEnabled: true,
      syncInterval: '6h',
      authMethod: 'api_key'
    })
    setConnectionTestResult(null)
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnectionTestResult({ success: true, message: 'Connection test successful!' })
    } catch (error) {
      setConnectionTestResult({ success: false, message: 'Connection failed. Please check your configuration.' })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const predefinedServices = [
    // High Priority Integrations
    { 
      name: 'LDAP/Active Directory', 
      description: 'Primary user directory and authentication service', 
      category: 'security', 
      authMethod: 'ldap_bind',
      defaultUrl: 'ldap://ldap.company.com:389',
      version: '2019',
      syncInterval: '6h',
      apiEndpoint: '/api/ldap/users',
      healthCheck: '/api/ldap/health'
    },
    { 
      name: 'Grafana Monitoring', 
      description: 'Observability and monitoring dashboards', 
      category: 'monitoring', 
      authMethod: 'api_key',
      defaultUrl: 'https://grafana.company.com',
      version: '10.2.3',
      syncInterval: '6h',
      apiEndpoint: '/api/org/users',
      healthCheck: '/api/health'
    },
    { 
      name: 'Teleport Secure Access', 
      description: 'Zero-trust secure access to infrastructure', 
      category: 'security', 
      authMethod: 'jwt_token',
      defaultUrl: 'https://teleport.company.com:443',
      version: '14.1.0',
      syncInterval: '6h',
      apiEndpoint: '/v1/users',
      healthCheck: '/v1/ping'
    },
    
    // Medium Priority Integrations
    { 
      name: 'Unifi Network Controller', 
      description: 'Ubiquiti network infrastructure management', 
      category: 'networking', 
      authMethod: 'username_password',
      defaultUrl: 'https://unifi.company.com:8443',
      version: '8.0.24',
      syncInterval: '6h',
      apiEndpoint: '/api/s/default/list/user',
      healthCheck: '/status'
    },
    { 
      name: 'Zabbix Monitoring', 
      description: 'Infrastructure monitoring and alerting platform', 
      category: 'monitoring', 
      authMethod: 'api_token',
      defaultUrl: 'https://zabbix.company.com',
      version: '6.4.10',
      syncInterval: '6h',
      apiEndpoint: '/api_jsonrpc.php',
      healthCheck: '/api_jsonrpc.php'
    },
    { 
      name: 'RADIUS Authentication', 
      description: 'Network access authentication service with FreeRADIUS REST API', 
      category: 'security', 
      authMethod: 'radius_shared_secret',
      defaultUrl: 'https://radius.company.com:443',
      version: '3.2.3',
      syncInterval: '6h',
      apiEndpoint: '/freeradius-rest-api/api/radcheck',
      healthCheck: '/freeradius-rest-api/api/status'
    },
    { 
      name: 'phpIPAM (IP Address Management)', 
      description: 'phpIPAM open-source IP address management system', 
      category: 'networking', 
      authMethod: 'basic_auth',
      defaultUrl: 'https://ipam.company.com',
      version: '1.6.0',
      syncInterval: '6h',
      apiEndpoint: '/api/myapp/user/all/',
      healthCheck: '/api/myapp/user/',
      appName: 'myapp',
      tokenExpiry: '6h'
    },
    { 
      name: 'Kibana Log Analytics', 
      description: 'Elasticsearch-based log analysis and visualization', 
      category: 'monitoring', 
      authMethod: 'elasticsearch_auth',
      defaultUrl: 'https://kibana.company.com',
      version: '8.11.3',
      syncInterval: '6h',
      apiEndpoint: '/api/security/user',
      healthCheck: '/api/status'
    },
    
    // Specialized Services
    { 
      name: 'ITop ITSM Platform', 
      description: 'IT service management and ticketing system', 
      category: 'management', 
      authMethod: 'basic_auth',
      defaultUrl: 'https://itop.company.com',
      version: '3.1.0',
      syncInterval: '12h',
      apiEndpoint: '/webservices/rest.php',
      healthCheck: '/pages/UI.php'
    },
    { 
      name: 'NetEco Network Monitoring', 
      description: 'Huawei network performance monitoring', 
      category: 'monitoring', 
      authMethod: 'proprietary',
      defaultUrl: 'https://neteco.company.com',
      version: '6.2.1',
      syncInterval: '12h',
      apiEndpoint: '/northbound/users',
      healthCheck: '/northbound/health'
    },
    { 
      name: 'eSight Server Management', 
      description: 'Huawei server infrastructure management with token authentication', 
      category: 'management', 
      authMethod: 'token_auth',
      defaultUrl: 'https://esight.company.com:32102',
      version: 'V300R023C00',
      syncInterval: '12h',
      apiEndpoint: '/rest/plat/smapp/v1/users',
      healthCheck: '/rest/plat/smapp/v1/sessions'
    },
    { 
      name: 'Mikrotik VPN Gateway', 
      description: 'RouterOS-based VPN and routing services', 
      category: 'networking', 
      authMethod: 'routeros_api',
      defaultUrl: 'https://mikrotik.company.com',
      version: '7.10.2',
      syncInterval: '6h',
      apiEndpoint: '/rest/user',
      healthCheck: '/rest/system/health'
    },
    { 
      name: 'FortiGate VPN Gateway', 
      description: 'Fortinet enterprise VPN and firewall', 
      category: 'security', 
      authMethod: 'api_key',
      defaultUrl: 'https://fortigate.company.com',
      version: '7.4.1',
      syncInterval: '6h',
      apiEndpoint: '/api/v2/cmdb/user/local',
      healthCheck: '/api/v2/monitor/system/status'
    },
    { 
      name: 'NOC Services Platform', 
      description: 'Network operations center management system', 
      category: 'management', 
      authMethod: 'custom',
      defaultUrl: 'https://noc.company.com',
      version: '2.1.0',
      syncInterval: '12h',
      apiEndpoint: '/api/users',
      healthCheck: '/api/health'
    },
    { 
      name: 'Biometrics Access Control', 
      description: 'Physical access control and biometric authentication', 
      category: 'security', 
      authMethod: 'vendor_specific',
      defaultUrl: 'https://biometrics.company.com',
      version: '4.2.1',
      syncInterval: '24h',
      apiEndpoint: '/api/v1/personnel',
      healthCheck: '/api/v1/status'
    },
    { 
      name: 'Eight Sight Analytics', 
      description: 'Business intelligence and analytics platform', 
      category: 'management', 
      authMethod: 'api_key',
      defaultUrl: 'https://eightsight.company.com',
      version: '1.8.7',
      syncInterval: '24h',
      apiEndpoint: '/api/users',
      healthCheck: '/api/ping'
    },
    { 
      name: 'Proxmox Virtual Environment', 
      description: 'Proxmox VE virtualization management with PVE API tokens', 
      category: 'management', 
      authMethod: 'api_token',
      defaultUrl: 'https://proxmox.company.com:8006',
      version: '8.1.4',
      syncInterval: '6h',
      apiEndpoint: '/api2/json/access/users',
      healthCheck: '/api2/json/version'
    },
    { 
      name: 'Custom Integration', 
      description: 'Configure your own service integration', 
      category: 'management', 
      authMethod: 'api_key',
      defaultUrl: 'https://custom.company.com',
      version: '1.0.0',
      syncInterval: '6h',
      apiEndpoint: '/api/users',
      healthCheck: '/health'
    }
  ]

  const fillPredefinedService = (service: any) => {
    setFormData(prev => ({
      ...prev,
      name: service.name === 'Custom Integration' ? '' : service.name,
      description: service.description,
      url: service.defaultUrl || '',
      category: service.category,
      version: service.version || '1.0.0',
      syncInterval: service.syncInterval || '6h',
      authMethod: service.authMethod
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Service Integration
          </DialogTitle>
          <DialogDescription>
            Connect a new service to the ESM Platform for user synchronization and management.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">Service Template</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Choose a Service Template</Label>
              <div className="grid grid-cols-2 gap-3">
                {predefinedServices.map((service, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.name === service.name ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => fillPredefinedService(service)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{service.category}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{service.authMethod.replace('_', ' ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter service name"
                  required
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
                placeholder="Describe what this service does and how it integrates"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">Service URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => updateFormData('url', e.target.value)}
                  placeholder="https://service.company.com"
                  required
                />
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="syncEnabled"
                  checked={formData.syncEnabled}
                  onCheckedChange={(checked) => updateFormData('syncEnabled', checked)}
                />
                <Label htmlFor="syncEnabled">Enable automatic synchronization</Label>
              </div>

              {formData.syncEnabled && (
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4 mt-4">
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
                  <SelectItem value="token_auth">Token Authentication</SelectItem>
                  <SelectItem value="ticket_auth">Ticket Authentication</SelectItem>
                  <SelectItem value="json_rpc_auth">JSON-RPC Authentication</SelectItem>
                  <SelectItem value="service_account_token">Service Account Token</SelectItem>
                  <SelectItem value="session_cookie">Session Cookie</SelectItem>
                  <SelectItem value="grpc_tls_cert">gRPC TLS Certificate</SelectItem>
                  <SelectItem value="elasticsearch_auth">Elasticsearch Authentication</SelectItem>
                  <SelectItem value="proprietary">Proprietary Protocol</SelectItem>
                  <SelectItem value="routeros_api">RouterOS API</SelectItem>
                  <SelectItem value="vendor_specific">Vendor Specific</SelectItem>
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

            <div className="border-t pt-4">
              <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
              </Button>
              
              {connectionTestResult && (
                <div className={`mt-2 p-3 rounded text-sm ${
                  connectionTestResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {connectionTestResult.message}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            resetForm()
            onOpenChange(false)
          }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.url}>
            <Save className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
