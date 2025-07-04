"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AccessMatrixEntry, Service } from "@/lib/types"
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, Clock, History } from "lucide-react"

interface MatrixCellProps {
  entry: AccessMatrixEntry | undefined
  service: Service
}

const getAccessLevelInfo = (level: AccessMatrixEntry["accessLevel"]) => {
  switch (level) {
    case "Full":
      return {
        className: "bg-success/20 hover:bg-success/30 text-success-foreground",
        icon: CheckCircle,
      }
    case "Limited":
      return {
        className: "bg-primary/20 hover:bg-primary/30 text-primary",
        icon: CheckCircle,
      }
    case "Pending":
      return {
        className: "bg-warning/20 hover:bg-warning/30 text-warning-foreground",
        icon: AlertTriangle,
      }
    case "Denied":
      return {
        className: "bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground",
        icon: XCircle,
      }
    default:
      return {
        className: "bg-muted/50 hover:bg-muted/60 text-muted-foreground",
        icon: MinusCircle,
      }
  }
}

export function MatrixCell({ entry, service }: MatrixCellProps) {
  const [accessEntry, setAccessEntry] = React.useState(
    entry || { accessLevel: "None", role: "None", serviceName: service.name, userId: "" },
  )

  const { className, icon: Icon } = getAccessLevelInfo(accessEntry.accessLevel)

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <div
                className={`flex flex-col items-center justify-center h-20 w-full cursor-pointer rounded-md p-2 text-center transition-all ${className}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{accessEntry.role}</span>
                {accessEntry.expiresOn && <Clock className="h-3 w-3 mt-1 text-muted-foreground" />}
              </div>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent>
            <p>Level: {accessEntry.accessLevel}</p>
            <p>Role: {accessEntry.role}</p>
            {accessEntry.expiresOn && <p>Expires: {new Date(accessEntry.expiresOn).toLocaleDateString()}</p>}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuLabel>Manage Access</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Set Access Level</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Full</DropdownMenuItem>
              <DropdownMenuItem>Limited</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
              <DropdownMenuItem>Denied</DropdownMenuItem>
              <DropdownMenuItem>None</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Set Role</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {service.roles.map((role) => (
                <DropdownMenuItem key={role}>{role}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>None</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Set Expiration...</DropdownMenuItem>
          <DropdownMenuItem>
            <History className="mr-2 h-4 w-4" />
            View History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
