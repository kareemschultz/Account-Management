"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { services, departments } from "@/lib/data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Generate mock heatmap data
const heatmapData = departments.slice(0, 8).map((dept) => ({
  department: dept,
  services: services.slice(0, 6).map((service) => ({
    name: service.name,
    accessLevel: Math.floor(Math.random() * 101), // 0-100
  })),
}))

const getHeatmapColor = (value: number) => {
  if (value > 80) return "bg-primary/90"
  if (value > 60) return "bg-primary/70"
  if (value > 40) return "bg-primary/50"
  if (value > 20) return "bg-primary/30"
  if (value > 0) return "bg-primary/10"
  return "bg-muted/50"
}

export function AccessHeatmap() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Department vs. Service Access Heatmap</CardTitle>
        <CardDescription>Correlation of service access intensity across departments.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2 font-normal text-muted-foreground">Department</th>
                  {heatmapData[0].services.map((service) => (
                    <th key={service.name} className="p-2 font-normal text-muted-foreground text-center">
                      {service.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(({ department, services }) => (
                  <tr key={department} className="border-t border-border">
                    <td className="p-2 font-medium whitespace-nowrap">
                      {department.length > 20 ? department.substring(0, 18) + "..." : department}
                    </td>
                    {services.map((service) => (
                      <td key={service.name} className="p-1 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-10 h-10 rounded-sm ${getHeatmapColor(
                                service.accessLevel,
                              )} transition-all hover:ring-2 ring-primary`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {department} - {service.name}
                            </p>
                            <p>Access Level: {service.accessLevel}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
