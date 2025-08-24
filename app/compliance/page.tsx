import { complianceData } from "@/lib/data"
import { ComplianceStatCard } from "@/components/compliance/compliance-stat-card"
import { ComplianceControlsTable } from "@/components/compliance/compliance-controls-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileDown, Gavel, ShieldCheck, ListChecks } from "lucide-react"

export default function CompliancePage() {
  const totalControls = complianceData.flatMap((s) => s.controls).length
  const compliantControls = complianceData.flatMap((s) => s.controls).filter((c) => c.status === "Compliant").length
  const openIssues = complianceData.flatMap((s) => s.controls).filter((c) => c.status === "Non-Compliant").length

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="text-muted-foreground">Monitor and manage adherence to regulatory standards.</p>
        </div>
        <Button variant="outline" className="bg-transparent">
          <FileDown className="mr-2 h-4 w-4" />
          Export Compliance Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <ComplianceStatCard
          title="Overall Compliance"
          value={compliantControls}
          total={totalControls}
          icon={ShieldCheck}
          description="Percentage of all controls marked as compliant."
        />
        <ComplianceStatCard
          title="Controls Monitored"
          value={totalControls}
          total={totalControls}
          icon={ListChecks}
          description="Total number of controls across all standards."
        />
        <ComplianceStatCard
          title="Open Issues"
          value={openIssues}
          total={totalControls}
          icon={Gavel}
          description="Controls currently marked as non-compliant."
        />
      </div>

      <Tabs defaultValue="SOC 2" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {complianceData.map((standard) => (
            <TabsTrigger key={standard.name} value={standard.name}>
              {standard.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {complianceData.map((standard) => (
          <TabsContent key={standard.name} value={standard.name}>
            <div className="p-4 border rounded-lg mt-4">
              <p className="text-sm text-muted-foreground mb-4">{standard.description}</p>
              <ComplianceControlsTable data={standard.controls} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
