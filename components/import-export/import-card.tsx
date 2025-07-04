"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { UploadCloud, File, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { importUsers } from "@/app/import-export/actions"
import { useToast } from "@/hooks/use-toast"

export function ImportCard() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [dataType, setDataType] = React.useState("users")
  const [isImporting, setIsImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("dataType", dataType)

    try {
      const result = await importUsers(formData)
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message,
        })
        setFile(null)
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = (type: string) => {
    let csvContent = ""
    if (type === "users") {
      csvContent =
        "Name,Email,EmployeeID,Position,Department,SecurityClearance,EmploymentType\nJohn Doe,john.doe@example.com,EMP-2025-001,Software Engineer,IT,Internal,Permanent"
    } else {
      csvContent = "Name,Description,Category,Roles\nNew Service,Service Description,Network,Admin;User"
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>Bulk upload users or services from a CSV file.</CardDescription>
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
        <div
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border",
          )}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
          {file ? (
            <div className="text-center">
              <File className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-2 font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              <Button variant="link" size="sm" onClick={() => setFile(null)}>
                Clear
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span
                  className="font-semibold text-primary cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">CSV up to 10MB</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full bg-transparent" onClick={() => downloadTemplate("users")}>
            <Download className="mr-2 h-4 w-4" />
            User Template
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => downloadTemplate("services")}>
            <Download className="mr-2 h-4 w-4" />
            Service Template
          </Button>
        </div>
        <Button className="w-full" disabled={!file || isImporting} onClick={handleImport}>
          {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isImporting ? "Importing..." : "Start Import"}
        </Button>
      </CardContent>
    </Card>
  )
}
