import { type NextRequest, NextResponse } from "next/server"

interface ComplianceReport {
  id: string
  name: string
  type: string
  status: "completed" | "running" | "scheduled" | "failed"
  createdAt: string
  completedAt?: string
  fileSize?: string
  downloadUrl?: string
  schedule?: string
}

// Mock compliance reports data
const complianceReports: ComplianceReport[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  let filteredReports = complianceReports

  if (type) {
    filteredReports = filteredReports.filter((r) => r.type === type)
  }

  if (status) {
    filteredReports = filteredReports.filter((r) => r.status === status)
  }

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  return NextResponse.json({
    reports: paginatedReports,
    total: filteredReports.length,
    page,
    limit,
    totalPages: Math.ceil(filteredReports.length / limit),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new compliance report
    const newReport: ComplianceReport = {
      id: Date.now().toString(),
      name: body.name,
      type: body.type,
      status: "running",
      createdAt: new Date().toISOString(),
      schedule: body.schedule,
    }

    complianceReports.unshift(newReport)

    // Simulate report generation
    setTimeout(() => {
      const reportIndex = complianceReports.findIndex((r) => r.id === newReport.id)
      if (reportIndex !== -1) {
        complianceReports[reportIndex] = {
          ...complianceReports[reportIndex],
          status: "completed",
          completedAt: new Date().toISOString(),
          fileSize: "1.2 MB",
          downloadUrl: `/reports/${newReport.id}.pdf`,
        }
      }
    }, 5000)

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
