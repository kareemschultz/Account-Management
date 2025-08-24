import { type NextRequest, NextResponse } from "next/server"

// Mock services data
const services = [
  {
    id: "1",
    name: "Microsoft 365",
    description: "Office productivity suite",
    category: "Productivity",
    apiEndpoint: "https://graph.microsoft.com/v1.0",
    authMethod: "OAuth 2.0",
    syncEnabled: true,
    status: "active",
    lastSync: "2024-01-15T10:30:00Z",
    userCount: 245,
  },
  {
    id: "2",
    name: "Salesforce",
    description: "Customer relationship management",
    category: "CRM",
    apiEndpoint: "https://api.salesforce.com/v1",
    authMethod: "OAuth 2.0",
    syncEnabled: true,
    status: "active",
    lastSync: "2024-01-15T09:15:00Z",
    userCount: 89,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const status = searchParams.get("status")

  let filteredServices = services

  if (category) {
    filteredServices = filteredServices.filter((service) => service.category === category)
  }

  if (status) {
    filteredServices = filteredServices.filter((service) => service.status === status)
  }

  return NextResponse.json({
    services: filteredServices,
    total: filteredServices.length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.apiEndpoint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new service
    const newService = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || "",
      category: body.category || "Other",
      apiEndpoint: body.apiEndpoint,
      authMethod: body.authMethod || "API Key",
      syncEnabled: body.syncEnabled || false,
      status: "inactive",
      lastSync: new Date().toISOString(),
      userCount: 0,
    }

    services.push(newService)

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
