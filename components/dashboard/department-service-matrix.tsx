"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { departments, services } from "@/lib/data"
import { useNavigation } from "@/hooks/use-navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Generate mock usage data
const generateUsageData = () => {
  const matrix: { [key: string]: { [key: string]: number } } = {}

  departments.slice(0, 8).forEach((dept) => {
    matrix[dept] = {}
    services.slice(0, 6).forEach((service) => {
      matrix[dept][service.name] = Math.floor(Math.random() * 100)
    })
  })

  return matrix
}

const getUsageColor = (usage: number) => {
  if (usage === 0) return "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
  if (usage < 20) return "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50"
  if (usage < 40) return "bg-blue-200 dark:bg-blue-800/50 hover:bg-blue-300 dark:hover:bg-blue-700/70"
  if (usage < 60) return "bg-blue-300 dark:bg-blue-700/70 hover:bg-blue-400 dark:hover:bg-blue-600/80"
  if (usage < 80) return "bg-blue-400 dark:bg-blue-600/80 hover:bg-blue-500 dark:hover:bg-blue-500"
  return "bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400"
}

export function DepartmentServiceMatrix() {
  const usageData = generateUsageData()
  const { navigateToUsers, navigateToAccessMatrix } = useNavigation()

  const handleCellClick = (department: string, serviceName: string, usage: number) => {
    if (usage > 0) {
      navigateToAccessMatrix({ service: serviceName })
    }
  }

  const handleDepartmentClick = (department: string) => {
    navigateToUsers({ department })
  }

  const handleServiceClick = (serviceName: string) => {
    navigateToAccessMatrix({ service: serviceName })
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Department Service Usage Matrix</CardTitle>
        <CardDescription>
          Service adoption rates across departments. Click cells, departments, or services for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                <div className="text-xs font-medium text-muted-foreground p-2">Department</div>
                {services.slice(0, 6).map((service) => (
                  <div
                    key={service.name}
                    className="text-xs font-medium text-muted-foreground p-2 text-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleServiceClick(service.name)}
                    title="Click to view service access matrix"
                  >
                    {service.name}
                  </div>
                ))}
              </div>

              {/* Matrix rows */}
              {departments.slice(0, 8).map((dept) => (
                <div key={dept} className="grid grid-cols-7 gap-1 mb-1">
                  <div
                    className="text-xs p-2 font-medium truncate cursor-pointer hover:text-primary transition-colors"
                    title={`${dept} - Click to view department users`}
                    onClick={() => handleDepartmentClick(dept)}
                  >
                    {dept.length > 20 ? dept.substring(0, 18) + "..." : dept}
                  </div>
                  {services.slice(0, 6).map((service) => {
                    const usage = usageData[dept][service.name]
                    return (
                      <Tooltip key={service.name}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-8 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${getUsageColor(usage)} ${
                              usage > 60 ? "text-white" : "text-gray-700 dark:text-gray-300"
                            }`}
                            onClick={() => handleCellClick(dept, service.name, usage)}
                          >
                            {usage}%
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {dept} - {service.name}
                          </p>
                          <p>Usage: {usage}%</p>
                          {usage > 0 && <p className="text-xs">Click to view access matrix</p>}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Low</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                  <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/30" />
                  <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-800/50" />
                  <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-700/70" />
                  <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-600/80" />
                  <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-500" />
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
