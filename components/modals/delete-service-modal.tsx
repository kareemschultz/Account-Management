"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Trash2 } from 'lucide-react'

interface Service {
  id: string
  name: string
  status: 'active' | 'inactive' | 'maintenance'
  userCount?: number
  lastSync?: string
}

interface DeleteServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  onConfirm: (serviceId: string) => void
}

export function DeleteServiceModal({ open, onOpenChange, service, onConfirm }: DeleteServiceModalProps) {
  const handleDelete = () => {
    if (service) {
      onConfirm(service.id)
      onOpenChange(false)
    }
  }

  if (!service) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Service
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to delete the service <strong>"{service.name}"</strong>?
            </div>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">This action cannot be undone.</span>
              </div>
              <div className="text-sm text-red-700">
                Deleting this service will:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove all user access mappings for this service</li>
                  <li>Delete all synchronization history and logs</li>
                  <li>Stop all automated sync processes</li>
                  <li>Remove service from all reports and analytics</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                  {service.status}
                </Badge>
              </div>
              {service.userCount && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Users:</span>
                  <span className="font-medium">{service.userCount}</span>
                </div>
              )}
              {service.lastSync && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="text-xs">{new Date(service.lastSync).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Service
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
