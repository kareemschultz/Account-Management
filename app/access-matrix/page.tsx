"use client"

import * as React from "react"
import { users, services, accessMatrixData } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MatrixCell } from "@/components/access-matrix/matrix-cell"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function AccessMatrixPage() {
  const searchParams = useSearchParams()

  // Initialize filters from URL parameters
  const [userFilter, setUserFilter] = React.useState(() => searchParams.get("user") || "")
  const [serviceFilter, setServiceFilter] = React.useState(() => searchParams.get("service") || "")

  // Get active filters for display
  const activeFilters = React.useMemo(() => {
    const filters: string[] = []
    const urlUser = searchParams.get("user")
    const urlService = searchParams.get("service")
    const urlAccessLevel = searchParams.get("accessLevel")

    if (urlUser) filters.push(`User: ${urlUser}`)
    if (urlService) filters.push(`Service: ${urlService}`)
    if (urlAccessLevel) filters.push(`Access Level: ${urlAccessLevel}`)

    return filters
  }, [searchParams])

  const filteredUsers = React.useMemo(() => {
    const urlUser = searchParams.get("user")
    const filterText = urlUser || userFilter
    return users.filter((user) => user.name.toLowerCase().includes(filterText.toLowerCase()))
  }, [userFilter, searchParams])

  const filteredServices = React.useMemo(() => {
    const urlService = searchParams.get("service")
    const filterText = urlService || serviceFilter
    return services.filter((service) => service.name.toLowerCase().includes(filterText.toLowerCase()))
  }, [serviceFilter, searchParams])

  const matrix = React.useMemo(() => {
    const matrixMap = new Map<string, any>()
    accessMatrixData.forEach((entry) => {
      const key = `${entry.userId}-${entry.serviceName}`
      matrixMap.set(key, entry)
    })
    return matrixMap
  }, [])

  const clearFilters = () => {
    setUserFilter("")
    setServiceFilter("")
    window.history.pushState({}, "", "/access-matrix")
  }

  return (
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Access Matrix</h1>
          <p className="text-muted-foreground">A visual grid of user-to-service access relationships.</p>
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
        <Button variant="outline" className="bg-transparent">
          <FileDown className="mr-2 h-4 w-4" />
          Export Matrix
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Input placeholder="Filter users..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
        <Input
          placeholder="Filter services..."
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="p-2 text-left font-semibold text-muted-foreground w-64 min-w-64 sticky left-0 bg-muted/50 z-10">
                User
              </th>
              {filteredServices.map((service) => (
                <th key={service.name} className="p-2 text-center font-semibold text-muted-foreground w-40 min-w-40">
                  <div className="flex flex-col items-center">
                    <service.icon className="h-5 w-5 text-primary mb-1" />
                    {service.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2 sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    </div>
                  </div>
                </td>
                {filteredServices.map((service) => {
                  const entry = matrix.get(`${user.id}-${service.name}`)
                  return (
                    <td key={service.name} className="p-1">
                      <MatrixCell entry={entry} service={service} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
