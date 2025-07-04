import { ImportCard } from "@/components/import-export/import-card"
import { ExportCard } from "@/components/import-export/export-card"
import { HistoryTable } from "@/components/import-export/history-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dataOperationLogs } from "@/lib/data"

export default function ImportExportPage() {
  return (
    <div className="container mx-auto py-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import/Export Hub</h1>
        <p className="text-muted-foreground">Manage your platform data in bulk.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ImportCard />
        <ExportCard />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Operation History</CardTitle>
          <CardDescription>A log of all recent import and export activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryTable data={dataOperationLogs} />
        </CardContent>
      </Card>
    </div>
  )
}
