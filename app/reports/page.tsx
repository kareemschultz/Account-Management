import { ServiceAdoptionChart } from "@/components/reports/service-adoption-chart"
import { SecurityClearancePie } from "@/components/reports/security-clearance-pie"
import { AccessHeatmap } from "@/components/reports/access-heatmap"
import { Button } from "@/components/ui/button"
import { FileDown, Filter } from "lucide-react"

export default function ReportsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into platform usage, security posture, and operational performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filter Reports
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <ServiceAdoptionChart />
        <SecurityClearancePie />
      </div>
      <div className="grid gap-4 md:gap-8 mt-4">
        <AccessHeatmap />
      </div>
    </>
  )
}
