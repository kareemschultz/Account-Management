"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { departments } from "@/lib/data"
import { useNavigation } from "@/hooks/use-navigation"
import { useState } from "react"

const data = departments.slice(0, 8).map((dep) => ({
  name: dep.length > 15 ? dep.substring(0, 12) + "..." : dep,
  fullName: dep,
  users: Math.floor(Math.random() * 100) + 10,
}))

export function UserDistributionChart() {
  const { navigateToUsers } = useNavigation()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleBarClick = (data: any, index: number) => {
    navigateToUsers({ department: data.fullName })
  }

  return (
    <Card className="col-span-1 lg:col-span-2 cursor-pointer">
      <CardHeader>
        <CardTitle>User Distribution</CardTitle>
        <CardDescription>User count by top departments. Click bars to view department users.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} onMouseLeave={() => setHoveredIndex(null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} style={{ cursor: "pointer" }} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                cursor: "pointer",
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-primary">{`Users: ${payload[0].value}`}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to view users</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar
              dataKey="users"
              name="Users"
              style={{ cursor: "pointer" }}
              onClick={handleBarClick}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={hoveredIndex === index ? "#2563EB" : "#3B82F6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
