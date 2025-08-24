"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { departments } from "@/lib/data"
import { exportUsers, exportServices } from "@/app/import-export/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ExportCard() {
  const [dataType, setDataType] = React.useState("users")
  const [department, setDepartment] = React.useState("all")
  const [format, setFormat] = React.useState<"csv" | "json">("csv")
  const [isExporting, setIsExporting] = React.useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let result
      if (dataType === "users") {
        result = await exportUsers(department, format)
      } else {
        result = await exportServices(format)
      }

      if (result.success) {
        // Create and download file
        const blob = new Blob([result.data], {
          type: format === "csv" ? "text/csv" : "application/json",
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: `Exported ${result.recordsProcessed} records`,
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download user or service data in various formats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger>
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
        {dataType === "users" && (
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by department (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dep) => (
                <SelectItem key={dep} value={dep}>
                  {dep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={format} onValueChange={(value: "csv" | "json") => setFormat(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full" disabled={isExporting} onClick={handleExport}>
          {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </CardContent>
    </Card>
  )
}
