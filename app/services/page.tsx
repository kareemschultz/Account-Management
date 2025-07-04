"use client"

import { services } from "@/lib/data"
import { ServiceCard } from "@/components/services/service-card"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  const searchParams = useSearchParams()

  // Extract filter values from URL parameters
  const category = searchParams.get("category")
  const health = searchParams.get("health")
  const service = searchParams.get("service")

  // Memoize filtered services to prevent unnecessary recalculations
  const { filteredServices, activeFilters } = useMemo(() => {
    let filtered = services
    const filters: string[] = []

    if (category) {
      filtered = filtered.filter((s) => s.category === category)
      filters.push(`Category: ${category}`)
    }

    if (health) {
      filtered = filtered.filter((s) => s.health === health)
      filters.push(`Health: ${health}`)
    }

    if (service) {
      filtered = filtered.filter((s) => s.name === service)
      filters.push(`Service: ${service}`)
    }

    return { filteredServices: filtered, activeFilters: filters }
  }, [category, health, service])

  const clearFilters = () => {
    window.history.pushState({}, "", "/services")
    window.location.reload()
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Service Catalog</h1>
        <p className="text-muted-foreground">
          Browse and manage all available IT services.
          {activeFilters.length > 0 && ` Showing ${filteredServices.length} filtered results.`}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  )
}
