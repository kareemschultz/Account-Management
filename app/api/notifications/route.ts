import { type NextRequest, NextResponse } from "next/server"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  recipient: string
  channel: "email" | "slack" | "sms"
  status: "sent" | "pending" | "failed"
  createdAt: string
  sentAt?: string
}

// Mock notifications data
const notifications: Notification[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  let filteredNotifications = notifications

  if (type) {
    filteredNotifications = filteredNotifications.filter((n) => n.type === type)
  }

  if (status) {
    filteredNotifications = filteredNotifications.filter((n) => n.status === status)
  }

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

  return NextResponse.json({
    notifications: paginatedNotifications,
    total: filteredNotifications.length,
    page,
    limit,
    totalPages: Math.ceil(filteredNotifications.length / limit),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.message || !body.recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: body.title,
      message: body.message,
      type: body.type || "info",
      recipient: body.recipient,
      channel: body.channel || "email",
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    notifications.unshift(newNotification)

    // Simulate sending
    setTimeout(() => {
      const notificationIndex = notifications.findIndex((n) => n.id === newNotification.id)
      if (notificationIndex !== -1) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          status: "sent",
          sentAt: new Date().toISOString(),
        }
      }
    }, 2000)

    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
