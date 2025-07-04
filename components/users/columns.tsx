"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/lib/types"
import { ArrowUpDown, MoreHorizontal, Fingerprint, Wifi, WifiOff, CalendarClock, Eye, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getClearanceVariant = (clearance: User["securityClearance"]) => {
  switch (clearance) {
    case "Top Secret":
      return "destructive"
    case "Restricted":
      return "default"
    case "Confidential":
      return "secondary"
    default:
      return "outline"
  }
}

const getAuthTypeVariant = (authType: User["authenticationType"]) => {
  switch (authType) {
    case "LDAP":
      return "default"
    case "Azure AD":
      return "secondary"
    case "SAML SSO":
      return "outline"
    case "Local":
      return "warning"
    default:
      return "outline"
  }
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.employeeId}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="w-[180px] truncate">{row.getValue("department")}</div>,
  },
  {
    accessorKey: "authenticationType",
    header: "Auth Type",
    cell: ({ row }) => {
      const authType = row.getValue("authenticationType") as User["authenticationType"]
      const user = row.original
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={getAuthTypeVariant(authType)}>{authType}</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p>Authentication: {authType}</p>
                {user.ldapDN && <p className="text-xs">LDAP DN: {user.ldapDN}</p>}
                {user.adGroups && user.adGroups.length > 0 && (
                  <p className="text-xs">
                    AD Groups: {user.adGroups.slice(0, 2).join(", ")}
                    {user.adGroups.length > 2 ? "..." : ""}
                  </p>
                )}
                {user.localGroups && user.localGroups.length > 0 && (
                  <p className="text-xs">Local Groups: {user.localGroups.slice(0, 2).join(", ")}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={status === "active" ? "success" : "secondary"}>{status}</Badge>
    },
  },
  {
    accessorKey: "securityClearance",
    header: "Clearance",
    cell: ({ row }) => {
      const clearance = row.getValue("securityClearance") as User["securityClearance"]
      return <Badge variant={getClearanceVariant(clearance)}>{clearance}</Badge>
    },
  },
  {
    accessorKey: "serviceGroups",
    header: "Service Groups",
    cell: ({ row }) => {
      const user = row.original
      const groupCount = user.serviceGroups.reduce((acc, sg) => acc + sg.groups.length, 0)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{groupCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 max-w-xs">
                {user.serviceGroups.map((sg) => (
                  <div key={sg.serviceName}>
                    <p className="font-medium text-xs">{sg.serviceName}</p>
                    <p className="text-xs text-muted-foreground">Groups: {sg.groups.join(", ")}</p>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "access",
    header: "Access",
    cell: ({ row }) => {
      const user = row.original
      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                {user.vpnAccess ? (
                  <Wifi className="h-4 w-4 text-primary" />
                ) : (
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                )}
              </TooltipTrigger>
              <TooltipContent>VPN Access: {user.vpnAccess ? "Enabled" : "Disabled"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                {user.biometricAccess ? (
                  <Fingerprint className="h-4 w-4 text-primary" />
                ) : (
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                )}
              </TooltipTrigger>
              <TooltipContent>Biometric Access: {user.biometricAccess ? "Enabled" : "Disabled"}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "expiresOn",
    header: "Expires On",
    cell: ({ row }) => {
      const expiresOn = row.getValue("expiresOn") as string | undefined
      if (!expiresOn) return <span className="text-muted-foreground">-</span>
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
          <CalendarClock className="h-4 w-4" />
          <span>{new Date(expiresOn).toLocaleDateString()}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem>Manage Service Groups</DropdownMenuItem>
            <DropdownMenuItem>VPN Configuration</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Deactivate user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
