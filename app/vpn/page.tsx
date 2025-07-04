"use client"

import { NetworkTopology } from "@/components/vpn/network-topology"
import { VpnGroups } from "@/components/vpn/vpn-groups"
import { VpnConfiguration } from "@/components/vpn/vpn-configuration"
import { ActiveConnectionsTable } from "@/components/vpn/active-connections-table"
import { activeVpnConnections } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"

export default function VpnPage() {
  const searchParams = useSearchParams()

  // Extract filter values from URL parameters
  const type = searchParams.get("type")
  const group = searchParams.get("group")
  const status = searchParams.get("status")

  // Memoize filtered connections and active filters
  const { filteredConnections, activeFilters } = useMemo(() => {
    let filtered = activeVpnConnections
    const filters: string[] = []

    if (type) {
      filtered = filtered.filter((conn) => conn.vpnType === type)
      filters.push(`Type: ${type}`)
    }

    if (group) {
      filtered = filtered.filter((conn) => conn.group === group)
      filters.push(`Group: ${group}`)
    }

    if (status) {
      filtered = filtered.filter((conn) => conn.status === status)
      filters.push(`Status: ${status}`)
    }

    return { filteredConnections: filtered, activeFilters: filters }
  }, [type, group, status])

  const clearFilters = () => {
    window.history.pushState({}, "", "/vpn")
    window.location.reload()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VPN Management</h1>
          <p className="text-muted-foreground">
            Oversee and configure the entire VPN infrastructure.
            {activeFilters.length > 0 && ` Showing ${filteredConnections.length} filtered connections.`}
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
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add VPN User
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8">
        <NetworkTopology />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <VpnGroups />
          <VpnConfiguration />
        </div>
        <ActiveConnectionsTable data={filteredConnections} />
      </div>
    </>
  )
}
