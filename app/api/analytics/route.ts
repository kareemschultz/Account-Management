import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "30d"
  const metric = searchParams.get("metric")

  // Mock analytics data
  const analyticsData = {
    totalOperations: 1247,
    successRate: 94.2,
    avgResponseTime: 2.8,
    activeUsers: 2456,
    operationsTrend: [
      { month: "Jan", successful: 145, failed: 12, pending: 8 },
      { month: "Feb", successful: 167, failed: 8, pending: 15 },
      { month: "Mar", successful: 189, failed: 15, pending: 12 },
      { month: "Apr", successful: 201, failed: 9, pending: 18 },
      { month: "May", successful: 234, failed: 11, pending: 22 },
      { month: "Jun", successful: 267, failed: 7, pending: 19 },
    ],
    departmentData: [
      { department: "Engineering", operations: 89, efficiency: 94 },
      { department: "Sales", operations: 67, efficiency: 87 },
      { department: "Marketing", operations: 45, efficiency: 91 },
      { department: "HR", operations: 34, efficiency: 96 },
      { department: "Finance", operations: 28, efficiency: 89 },
      { department: "Support", operations: 56, efficiency: 92 },
    ],
    serviceUsage: [
      { name: "Microsoft 365", value: 245 },
      { name: "Salesforce", value: 189 },
      { name: "Slack", value: 156 },
      { name: "Jira", value: 134 },
      { name: "GitHub", value: 98 },
    ],
  }

  if (metric) {
    return NextResponse.json({ [metric]: analyticsData[metric as keyof typeof analyticsData] })
  }

  return NextResponse.json(analyticsData)
}
