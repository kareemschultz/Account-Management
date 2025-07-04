import { type NextRequest, NextResponse } from "next/server"

// Mock user data
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    role: "Senior Developer",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    services: ["Microsoft 365", "GitHub", "Jira"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    role: "Marketing Manager",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    services: ["Microsoft 365", "Salesforce", "Slack"],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const department = searchParams.get("department") || ""
  const status = searchParams.get("status") || ""

  let filteredUsers = users

  // Apply filters
  if (search) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    )
  }

  if (department) {
    filteredUsers = filteredUsers.filter((user) => user.department === department)
  }

  if (status) {
    filteredUsers = filteredUsers.filter((user) => user.status === status)
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return NextResponse.json({
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    limit,
    totalPages: Math.ceil(filteredUsers.length / limit),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      department: body.department,
      role: body.role || "User",
      status: "active",
      lastLogin: null,
      services: body.services || [],
    }

    users.push(newUser)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
