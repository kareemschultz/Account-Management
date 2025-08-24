import { type NextRequest, NextResponse } from "next/server"

// Mock user data (in a real app, this would come from a database)
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
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = users.find((u) => u.id === params.id)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const userIndex = users.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user
    users[userIndex] = { ...users[userIndex], ...body }

    return NextResponse.json(users[userIndex])
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userIndex = users.findIndex((u) => u.id === params.id)

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  users.splice(userIndex, 1)

  return NextResponse.json({ message: "User deleted successfully" })
}
