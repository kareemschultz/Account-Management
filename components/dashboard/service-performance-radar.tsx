"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"

const performanceData = [
  {
    metric: "Availability",
    current: 98,
    target: 99.9,
  },
  {
    metric: "Response Time",
    current: 85,
    target: 95,
  },
  {
    metric: "Security",
    current: 94,
    target: 98,
  },
  {
    metric: "User Satisfaction",
    current: 88,
    target: 90,
  },
  {
    metric: "Compliance",
    current: 96,
    target: 100,
  },
  {
    metric: "Capacity",
    current: 75,
    target: 80,
  },
]

export function ServicePerformanceRadar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Performance Radar</CardTitle>
        <CardDescription>Current performance vs targets across key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={performanceData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
            <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
            <Radar
              name="Target"
              dataKey="target"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
