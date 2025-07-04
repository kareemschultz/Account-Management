"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { users } from "@/lib/data"

const clearanceData = users.reduce(
  (acc, user) => {
    const clearance = user.securityClearance
    const existing = acc.find((item) => item.name === clearance)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: clearance, value: 1 })
    }
    return acc
  },
  [] as { name: string; value: number }[],
)

const COLORS = ["#6B7280", "#3B82F6", "#F59E0B", "#EF4444", "#10B981"]

export function SecurityClearancePie() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Clearance Distribution</CardTitle>
        <CardDescription>Breakdown of user accounts by security clearance level.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Pie data={clearanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {clearanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
