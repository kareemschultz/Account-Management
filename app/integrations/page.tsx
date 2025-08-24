"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Settings, AlertCircle, CheckCircle, Clock, Plus, Edit, Trash2, TestTube } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddIntegrationModal } from "@/components/modals/add-integration-modal"
import { EditServiceModal } from "@/components/modals/edit-service-modal"
import { DeleteServiceModal } from "@/components/modals/delete-service-modal"

interface Service {
  id: string
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
  error?: string
}

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  const handleSyncAll = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/integration/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: 'all' })
      })
      const result = await response.json()
      console.log('Sync completed:', result)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'LDAP/Active Directory', description: 'Primary user directory and authentication service', category: 'security', version: '2019', status: 'connected', health: 'healthy', lastSync: '2025-08-24T06:00:00Z', users: 245, url: 'ldap.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'LDAP Bind' },
    { id: '2', name: 'Grafana Monitoring', description: 'Observability and monitoring dashboards', category: 'monitoring', version: '10.2.3', status: 'connected', health: 'healthy', lastSync: '2025-08-24T02:30:00Z', users: 87, url: 'grafana.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'API Key' },
    { id: '3', name: 'Teleport Secure Access', description: 'Secure access to infrastructure and applications', category: 'security', version: '14.1.0', status: 'connected', health: 'healthy', lastSync: '2025-08-24T03:00:00Z', users: 45, url: 'teleport.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'JWT Token' },
    { id: '4', name: 'Unifi Network Controller', description: 'Network infrastructure management', category: 'networking', version: '8.0.24', status: 'connected', health: 'healthy', lastSync: '2025-08-24T01:00:00Z', users: 156, url: 'unifi.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Username/Password' },
    { id: '5', name: 'Zabbix Monitoring', description: 'Infrastructure monitoring and alerting', category: 'monitoring', version: '6.4.10', status: 'connected', health: 'healthy', lastSync: '2025-08-24T04:00:00Z', users: 67, url: 'zabbix.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'API Token' },
    { id: '6', name: 'RADIUS Authentication', description: 'Network access authentication service', category: 'security', version: '3.0.26', status: 'connected', health: 'healthy', lastSync: '2025-08-24T05:00:00Z', users: 189, url: 'radius.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Shared Secret' },
    { id: '7', name: 'IPAM (IP Address Mgmt)', description: 'IP address management and tracking', category: 'networking', version: '1.5.2', status: 'connected', health: 'healthy', lastSync: '2025-08-24T02:00:00Z', users: 78, url: 'ipam.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'API Key' },
    { id: '8', name: 'Kibana Log Analytics', description: 'Log analysis and visualization platform', category: 'monitoring', version: '8.11.3', status: 'connected', health: 'healthy', lastSync: '2025-08-24T03:30:00Z', users: 45, url: 'kibana.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Elasticsearch Auth' },
    { id: '9', name: 'ITop ITSM Platform', description: 'IT service management and ticketing', category: 'management', version: '3.1.0', status: 'connected', health: 'healthy', lastSync: '2025-08-24T01:30:00Z', users: 234, url: 'itop.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Basic Auth' },
    { id: '10', name: 'NetEco Network Monitoring', description: 'Network performance monitoring', category: 'monitoring', version: '6.2.1', status: 'connected', health: 'healthy', lastSync: '2025-08-24T04:30:00Z', users: 34, url: 'neteco.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Proprietary' },
    { id: '11', name: 'eSight Server Management', description: 'Server infrastructure management', category: 'management', version: '5.3.2', status: 'connected', health: 'healthy', lastSync: '2025-08-24T05:30:00Z', users: 23, url: 'esight.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Proprietary' },
    { id: '12', name: 'Mikrotik VPN Gateway', description: 'RouterOS VPN and routing services', category: 'networking', version: '7.10.2', status: 'connected', health: 'healthy', lastSync: '2025-08-24T02:45:00Z', users: 67, url: 'mikrotik.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'RouterOS API' },
    { id: '13', name: 'FortiGate VPN Gateway', description: 'Enterprise VPN and firewall services', category: 'security', version: '7.4.1', status: 'connected', health: 'healthy', lastSync: '2025-08-24T03:45:00Z', users: 89, url: 'fortigate.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'API Key' },
    { id: '14', name: 'NOC Services Platform', description: 'Network operations center management', category: 'management', version: '2.1.0', status: 'connected', health: 'healthy', lastSync: '2025-08-24T04:45:00Z', users: 45, url: 'noc.company.com', syncEnabled: true, syncInterval: '6h', authMethod: 'Custom' },
    { id: '15', name: 'Biometrics Access Control', description: 'Physical access control system', category: 'security', version: '4.2.1', status: 'disconnected', health: 'error', lastSync: '2025-08-23T06:00:00Z', users: 156, url: 'biometrics.company.com', syncEnabled: false, syncInterval: '6h', authMethod: 'Vendor Specific', error: 'Connection timeout' },
    { id: '16', name: 'Eight Sight Analytics', description: 'Business intelligence and analytics', category: 'management', version: '1.8.7', status: 'disconnected', health: 'error', lastSync: '2025-08-23T12:00:00Z', users: 23, url: 'eightsight.company.com', syncEnabled: false, syncInterval: '6h', authMethod: 'API Key', error: 'API key expired' }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>
      case 'syncing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Syncing</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`
    }
  }

  const handleAddService = (newService: Omit<Service, 'id'>) => {
    const service: Service = {
      ...newService,
      id: Date.now().toString()
    }
    setServices(prev => [...prev, service])
  }

  const handleEditService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s))
  }

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const handleSyncService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    try {
      const response = await fetch(`/api/integration/${service.name.toLowerCase().replace(/[^a-z0-9]/g, '')}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      console.log('Sync completed:', result)
      
      // Update last sync time
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, lastSync: new Date().toISOString() } : s
      ))
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const handleTestConnection = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    try {
      const response = await fetch(`/api/integration/${service.name.toLowerCase().replace(/[^a-z0-9]/g, '')}/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'connection' })
      })
      const result = await response.json()
      console.log('Connection test:', result)
    } catch (error) {
      console.error('Connection test failed:', error)
    }
  }

  const connectedCount = services.filter(s => s.status === 'connected').length
  const totalUsers = services.reduce((sum, s) => sum + s.users, 0)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Service Integrations</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setAddModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
          <Button onClick={handleSyncAll} disabled={isLoading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync All Services'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              IT services configured
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Services online
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length - connectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Services offline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all services
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Integration Status</CardTitle>
          <CardDescription>
            Monitor and manage user synchronization from all connected IT services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>URL/Endpoint</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(service.status)}
                    {service.error && (
                      <div className="text-xs text-red-600 mt-1">{service.error}</div>
                    )}
                  </TableCell>
                  <TableCell>{service.users.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatLastSync(service.lastSync)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {service.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSyncService(service.id)}
                        title="Sync Now"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestConnection(service.id)}
                        title="Test Connection"
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedService(service)
                          setEditModalOpen(true)
                        }}
                        title="Edit Service"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedService(service)
                          setDeleteModalOpen(true)
                        }}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        title="Delete Service"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Integration Modal */}
      <AddIntegrationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleAddService}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        service={selectedService}
        onSave={handleEditService}
      />

      {/* Delete Service Modal */}
      <DeleteServiceModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        service={selectedService}
        onConfirm={handleDeleteService}
      />
    </div>
  )
}