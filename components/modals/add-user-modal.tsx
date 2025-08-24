"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { departments } from "@/lib/data"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userData: any) => void
}

export function AddUserModal({ open, onOpenChange, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    employeeId: "",
    position: "",
    department: "",
    securityClearance: "",
    employmentType: "Permanent",
    email: "",
    authenticationType: "LDAP",
    serviceGroups: [] as string[]
  })

  const [currentGroup, setCurrentGroup] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      id: `temp-${Date.now()}`,
      status: "pending",
      vpnAccess: false,
      biometricAccess: false,
      serviceCount: formData.serviceGroups.length
    })
    setFormData({
      name: "",
      employeeId: "",
      position: "",
      department: "",
      securityClearance: "",
      employmentType: "Permanent",
      email: "",
      authenticationType: "LDAP",
      serviceGroups: []
    })
    onOpenChange(false)
  }

  const addServiceGroup = () => {
    if (currentGroup && !formData.serviceGroups.includes(currentGroup)) {
      setFormData(prev => ({
        ...prev,
        serviceGroups: [...prev.serviceGroups, currentGroup]
      }))
      setCurrentGroup("")
    }
  }

  const removeServiceGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.filter(g => g !== group)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with access permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              placeholder="EMP-2025-0001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john.smith@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Network Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityClearance">Security Clearance</Label>
            <Select value={formData.securityClearance} onValueChange={(value) => setFormData(prev => ({ ...prev, securityClearance: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select clearance level" />
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
            <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}>
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

          <div className="space-y-2">
            <Label htmlFor="authenticationType">Authentication</Label>
            <Select value={formData.authenticationType} onValueChange={(value) => setFormData(prev => ({ ...prev, authenticationType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LDAP">LDAP</SelectItem>
                <SelectItem value="Azure AD">Azure AD</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
              </SelectContent>
            </Select>
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
            {formData.serviceGroups.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.serviceGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="flex items-center gap-1">
                    {group}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeServiceGroup(group)}
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
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}