"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface AddServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (serviceData: any) => void
}

export function AddServiceModal({ open, onOpenChange, onSubmit }: AddServiceModalProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    category: "",
    health: "Operational",
    ldapIntegration: true,
    roles: [] as string[],
    authenticationMethods: [] as string[]
  })

  const [currentRole, setCurrentRole] = React.useState("")
  const [currentAuthMethod, setCurrentAuthMethod] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      activeUsers: 0,
      customGroups: []
    })
    setFormData({
      name: "",
      description: "",
      category: "",
      health: "Operational",
      ldapIntegration: true,
      roles: [],
      authenticationMethods: []
    })
    onOpenChange(false)
  }

  const addRole = () => {
    if (currentRole && !formData.roles.includes(currentRole)) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, currentRole]
      }))
      setCurrentRole("")
    }
  }

  const removeRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role)
    }))
  }

  const addAuthMethod = () => {
    if (currentAuthMethod && !formData.authenticationMethods.includes(currentAuthMethod)) {
      setFormData(prev => ({
        ...prev,
        authenticationMethods: [...prev.authenticationMethods, currentAuthMethod]
      }))
      setCurrentAuthMethod("")
    }
  }

  const removeAuthMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      authenticationMethods: prev.authenticationMethods.filter(m => m !== method)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Register a new IT service for account management.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Grafana"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Monitoring and analytics platform"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Network">Network</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">Health Status</Label>
            <Select value={formData.health} onValueChange={(value) => setFormData(prev => ({ ...prev, health: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Operational">Operational</SelectItem>
                <SelectItem value="Degraded">Degraded</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ldapIntegration">LDAP Integration</Label>
            <Switch
              id="ldapIntegration"
              checked={formData.ldapIntegration}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ldapIntegration: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Service Roles</Label>
            <div className="flex gap-2">
              <Input
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Admin, User, Viewer..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addRole()
                  }
                }}
              />
              <Button type="button" onClick={addRole}>Add</Button>
            </div>
            {formData.roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="flex items-center gap-1">
                    {role}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeRole(role)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Authentication Methods</Label>
            <div className="flex gap-2">
              <Select value={currentAuthMethod} onValueChange={setCurrentAuthMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LDAP">LDAP</SelectItem>
                  <SelectItem value="Azure AD">Azure AD</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="SAML SSO">SAML SSO</SelectItem>
                  <SelectItem value="OAuth">OAuth</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addAuthMethod}>Add</Button>
            </div>
            {formData.authenticationMethods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.authenticationMethods.map((method) => (
                  <Badge key={method} variant="secondary" className="flex items-center gap-1">
                    {method}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeAuthMethod(method)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Service</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}