"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { departments, type User } from "@/lib/data"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSubmit: (userData: User) => void
}

export function EditUserModal({ open, onOpenChange, user, onSubmit }: EditUserModalProps) {
  const [formData, setFormData] = React.useState<User | null>(null)
  const [currentGroup, setCurrentGroup] = React.useState("")

  React.useEffect(() => {
    if (user) {
      setFormData({ ...user })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  const addServiceGroup = () => {
    if (currentGroup && formData) {
      const groups = formData.serviceGroups || []
      const existingGroup = groups.find(g => g.serviceName === currentGroup)
      if (!existingGroup) {
        setFormData(prev => prev ? ({
          ...prev,
          serviceGroups: [...groups, {
            serviceName: currentGroup,
            groups: ["Default"],
            roles: ["User"],
            assignedDate: new Date().toISOString().split('T')[0]
          }]
        }) : null)
        setCurrentGroup("")
      }
    }
  }

  const removeServiceGroup = (serviceName: string) => {
    if (formData) {
      setFormData(prev => prev ? ({
        ...prev,
        serviceGroups: prev.serviceGroups?.filter(g => g.serviceName !== serviceName) || []
      }) : null)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Modify user account information and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, employeeId: e.target.value }) : null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, position: e.target.value }) : null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData(prev => prev ? ({ ...prev, department: value }) : null)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "active" | "inactive" | "suspended") => setFormData(prev => prev ? ({ ...prev, status: value }) : null)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityClearance">Security Clearance</Label>
            <Select value={formData.securityClearance} onValueChange={(value) => setFormData(prev => prev ? ({ ...prev, securityClearance: value }) : null)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="Confidential">Confidential</SelectItem>
                <SelectItem value="Restricted">Restricted</SelectItem>
                <SelectItem value="Top Secret">Top Secret</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => prev ? ({ ...prev, employmentType: value }) : null)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vpnAccess">VPN Access</Label>
            <Switch
              id="vpnAccess"
              checked={formData.vpnAccess}
              onCheckedChange={(checked) => setFormData(prev => prev ? ({ ...prev, vpnAccess: checked }) : null)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="biometricAccess">Biometric Access</Label>
            <Switch
              id="biometricAccess"
              checked={formData.biometricAccess}
              onCheckedChange={(checked) => setFormData(prev => prev ? ({ ...prev, biometricAccess: checked }) : null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Service Groups</Label>
            <div className="flex gap-2">
              <Input
                value={currentGroup}
                onChange={(e) => setCurrentGroup(e.target.value)}
                placeholder="Add service group"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addServiceGroup()
                  }
                }}
              />
              <Button type="button" onClick={addServiceGroup}>Add</Button>
            </div>
            {formData.serviceGroups && formData.serviceGroups.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.serviceGroups.map((group) => (
                  <Badge key={group.serviceName} variant="secondary" className="flex items-center gap-1">
                    {group.serviceName}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeServiceGroup(group.serviceName)}
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
            <Button type="submit">Update User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}