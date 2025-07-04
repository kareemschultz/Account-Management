"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { AuditFilters } from "@/components/audit/audit-filters"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { auditLogs } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function AuditTrailPage() {
  const searchParams = useSearchParams()

  // Initialize state from URL parameters
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const dateRange = searchParams.get("dateRange")
    if (dateRange) {
      const [start, end] = dateRange.split("_")
      return {
        from: new Date(start),
        to: new Date(end),
      }
    }
    return undefined
  })

  const [user, setUser] = React.useState(() => searchParams.get("user") || "all")
  const [actionType, setActionType] = React.useState(() => searchParams.get("actionType") || "all")

  const handleReset = () => {
    setDate(undefined)
    setUser("all")
    setActionType("all")
    window.history.pushState({}, "", "/audit-trail")
  }

  const filteredLogs = React.useMemo(() => {
    return auditLogs.filter((log) => {
      const logDate = new Date(log.timestamp)
      if (date?.from && logDate < date.from) return false
      if (date?.to && logDate > date.to) return false
      if (user !== "all" && log.user.name !== user) return false
      if (actionType !== "all" && log.actionType !== actionType) return false
      return true
    })
  }, [date, user, actionType])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">An immutable log of all system and user actions.</p>
        </div>
        <Button variant="outline" className="bg-transparent">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      <AuditFilters
        date={date}
        setDate={setDate}
        user={user}
        setUser={setUser}
        actionType={actionType}
        setActionType={setActionType}
        onReset={handleReset}
      />
      <div className="mt-6">
        <AuditTimeline logs={filteredLogs} />
      </div>
    </>
  )
}
