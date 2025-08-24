"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip as ChartTooltipWrapper, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Jan", users: 250, services: 5 },
  { month: "Feb", users: 310, services: 6 },
  { month: "Mar", users: 450, services: 7 },
  { month: "Apr", users: 520, services: 8 },
  { month: "May", users: 680, services: 8 },
  { month: "Jun", users: 750, services: 9 },
]

const chartConfig = {
  users: {
    label: "Active Users",
    color: "#3B82F6",
  },
  services: {
    label: "Services Used",
    color: "#8B5CF6",
  },
}

export function ServiceAdoptionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Adoption Rate</CardTitle>
        <CardDescription>Monthly trend of active users and services utilized.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltipWrapper content={<ChartTooltipContent />} />
              <Legend />
              <Line
                dataKey="users"
                type="monotone"
                stroke="var(--color-users)"
                strokeWidth={2}
                dot={false}
                name="Active Users"
              />
              <Line
                dataKey="services"
                type="monotone"
                stroke="var(--color-services)"
                strokeWidth={2}
                dot={false}
                name="Services Used"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
