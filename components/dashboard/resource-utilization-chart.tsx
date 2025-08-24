"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const utilizationData = [
  { time: "00:00", cpu: 45, memory: 62, storage: 78, network: 34 },
  { time: "04:00", cpu: 32, memory: 58, storage: 78, network: 28 },
  { time: "08:00", cpu: 78, memory: 85, storage: 79, network: 65 },
  { time: "12:00", cpu: 85, memory: 88, storage: 80, network: 72 },
  { time: "16:00", cpu: 92, memory: 91, storage: 81, network: 78 },
  { time: "20:00", cpu: 68, memory: 75, storage: 82, network: 55 },
  { time: "24:00", cpu: 48, memory: 65, storage: 82, network: 38 },
]

export function ResourceUtilizationChart() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
        <CardDescription>Real-time system resource usage over 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="CPU"
            />
            <Area
              type="monotone"
              dataKey="memory"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Memory"
            />
            <Area
              type="monotone"
              dataKey="storage"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
              name="Storage"
            />
            <Area
              type="monotone"
              dataKey="network"
              stackId="1"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
              name="Network"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
