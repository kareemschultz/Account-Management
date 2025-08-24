"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getBulkOperationHistory } from "@/app/services/groups/actions"
import { History, UserPlus, UserMinus, CheckCircle, XCircle, Clock } from "lucide-react"

interface BulkOperationHistoryItem {
  id: string
  operation: "assign" | "remove"
  userCount: number
  groupCount: number
  status: "completed" | "failed" | "in-progress"
  timestamp: string
  performedBy: string
  successCount: number
  failureCount: number
}

export function BulkOperationHistory() {
  const [history, setHistory] = useState<BulkOperationHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getBulkOperationHistory()
        setHistory(data)
      } catch (error) {
        console.error("Failed to fetch bulk operation history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getOperationIcon = (operation: string) => {
    return operation === "assign" ? (
      <UserPlus className="h-4 w-4 text-green-600" />
    ) : (
      <UserMinus className="h-4 w-4 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Operation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading history...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Bulk Operation History
        </CardTitle>
        <CardDescription>Recent bulk group assignment and removal operations</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No bulk operations performed yet</div>
            ) : (
              history.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(item.status)}
                      {getOperationIcon(item.operation)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {item.operation === "assign" ? "Bulk Assignment" : "Bulk Removal"}
                        </span>
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "default"
                              : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {item.userCount} users • {item.groupCount} groups • by {item.performedBy}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        {item.status === "completed" && (
                          <>
                            <span>✓ {item.successCount} successful</span>
                            {item.failureCount > 0 && <span>✗ {item.failureCount} failed</span>}
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                  {index < history.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
