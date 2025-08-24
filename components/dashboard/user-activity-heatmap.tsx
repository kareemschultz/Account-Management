"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigation } from "@/hooks/use-navigation"

// Generate mock heatmap data for the last 12 weeks
const generateHeatmapData = () => {
  const weeks = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - i * 7)

    const days = []
    for (let j = 0; j < 7; j++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + j)

      days.push({
        date: date.toISOString().split("T")[0],
        activity: Math.floor(Math.random() * 100),
        day: j,
      })
    }
    weeks.push(days)
  }
  return weeks
}

const getActivityColor = (activity: number) => {
  if (activity === 0) return "bg-muted/30 hover:bg-muted/50"
  if (activity < 25) return "bg-green-200 dark:bg-green-900/30 hover:bg-green-300 dark:hover:bg-green-800/50"
  if (activity < 50) return "bg-green-300 dark:bg-green-800/50 hover:bg-green-400 dark:hover:bg-green-700/70"
  if (activity < 75) return "bg-green-400 dark:bg-green-700/70 hover:bg-green-500 dark:hover:bg-green-600"
  return "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500"
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function UserActivityHeatmap() {
  const heatmapData = generateHeatmapData()
  const { navigateToAuditTrail } = useNavigation()

  const handleDayClick = (date: string, activity: number) => {
    if (activity > 0) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      navigateToAuditTrail({
        dateRange: `${startDate.toISOString().split("T")[0]}_${endDate.toISOString().split("T")[0]}`,
      })
    }
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>User Activity Heatmap</CardTitle>
        <CardDescription>
          Daily user engagement over the last 12 weeks. Click days to view activity logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {/* Month labels */}
            <div className="flex text-xs text-muted-foreground ml-8">
              {heatmapData.map((week, weekIndex) => {
                const firstDay = new Date(week[0].date)
                const isFirstWeekOfMonth = firstDay.getDate() <= 7
                return (
                  <div key={weekIndex} className="w-3 mr-1">
                    {isFirstWeekOfMonth && <span>{monthLabels[firstDay.getMonth()]}</span>}
                  </div>
                )
              })}
            </div>

            {/* Heatmap grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col text-xs text-muted-foreground mr-2">
                {dayLabels.map((day, index) => (
                  <div key={day} className="h-3 mb-1 flex items-center">
                    {index % 2 === 1 && <span className="w-6">{day}</span>}
                  </div>
                ))}
              </div>

              {/* Activity squares */}
              <div className="flex gap-1">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${getActivityColor(day.activity)} ${
                              day.activity > 0 ? "hover:ring-1 hover:ring-primary" : ""
                            }`}
                            onClick={() => handleDayClick(day.date, day.activity)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {day.activity} activities on {new Date(day.date).toLocaleDateString()}
                          </p>
                          {day.activity > 0 && <p className="text-xs">Click to view logs</p>}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted/30" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/30" />
                <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/50" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/70" />
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
