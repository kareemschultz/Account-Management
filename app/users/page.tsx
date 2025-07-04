"use client"

import { users } from "@/lib/data"
import { columns } from "@/components/users/columns"
import { UserTable } from "@/components/users/user-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileDown, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"

export default function UsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract filter values from URL parameters
  const department = searchParams.get("department")
  const status = searchParams.get("status")
  const clearance = searchParams.get("clearance")

  // Memoize filtered users to prevent unnecessary recalculations
  const { filteredUsers, activeFilters } = useMemo(() => {
    let filtered = users
    const filters: string[] = []

    if (department) {
      filtered = filtered.filter((user) => user.department === department)
      filters.push(`Department: ${department}`)
    }

    if (status) {
      filtered = filtered.filter((user) => user.status === status)
      filters.push(`Status: ${status}`)
    }

    if (clearance) {
      filtered = filtered.filter((user) => user.securityClearance === clearance)
      filters.push(`Clearance: ${clearance}`)
    }

    return { filteredUsers: filtered, activeFilters: filters }
  }, [department, status, clearance])

  const clearFilters = () => {
    router.push("/users")
  }

  return (
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users, their roles, and permissions.
            {activeFilters.length > 0 && ` Showing ${filteredUsers.length} filtered results.`}
          </p>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                Clear filters
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>For Selected Users</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Activate Accounts</DropdownMenuItem>
              <DropdownMenuItem>Deactivate Accounts</DropdownMenuItem>
              <DropdownMenuItem>Change Department</DropdownMenuItem>
              <DropdownMenuItem>Grant Service Access</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="bg-transparent">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      <UserTable columns={columns} data={filteredUsers} />
    </div>
  )
}
