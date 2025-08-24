import { type NextRequest, NextResponse } from "next/server"

interface BulkOperation {
  id: string
  type: "assign" | "remove"
  userIds: string[]
  groupIds: string[]
  status: "pending" | "running" | "completed" | "failed"
  createdAt: string
  completedAt?: string
  createdBy: string
  results?: {
    successful: number
    failed: number
    errors: string[]
  }
}

// Mock bulk operations data
const bulkOperations: BulkOperation[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedOperations = bulkOperations.slice(startIndex, endIndex)

  return NextResponse.json({
    operations: paginatedOperations,
    total: bulkOperations.length,
    page,
    limit,
    totalPages: Math.ceil(bulkOperations.length / limit),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.userIds || !body.groupIds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new bulk operation
    const newOperation: BulkOperation = {
      id: Date.now().toString(),
      type: body.type,
      userIds: body.userIds,
      groupIds: body.groupIds,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || "system",
    }

    bulkOperations.unshift(newOperation)

    // Simulate processing
    setTimeout(() => {
      const operationIndex = bulkOperations.findIndex((op) => op.id === newOperation.id)
      if (operationIndex !== -1) {
        bulkOperations[operationIndex] = {
          ...bulkOperations[operationIndex],
          status: "running",
        }

        // Complete after another delay
        setTimeout(() => {
          const finalIndex = bulkOperations.findIndex((op) => op.id === newOperation.id)
          if (finalIndex !== -1) {
            bulkOperations[finalIndex] = {
              ...bulkOperations[finalIndex],
              status: "completed",
              completedAt: new Date().toISOString(),
              results: {
                successful: body.userIds.length,
                failed: 0,
                errors: [],
              },
            }
          }
        }, 3000)
      }
    }, 1000)

    return NextResponse.json(newOperation, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
