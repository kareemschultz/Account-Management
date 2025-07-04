"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Activity, Clock, CheckCircle, AlertTriangle, Download } from "lucide-react"

const operationsData = [
  { month: "Jan", successful: 145, failed: 12, pending: 8 },
  { month: "Feb", successful: 167, failed: 8, pending: 15 },
  { month: "Mar", successful: 189, failed: 15, pending: 12 },
  { month: "Apr", successful: 201, failed: 9, pending: 18 },
  { month: "May", successful: 234, failed: 11, pending: 22 },
  { month: "Jun", successful: 267, failed: 7, pending: 19 },
]

const departmentData = [
  { department: "Engineering", operations: 89, efficiency: 94 },
  { department: "Sales", operations: 67, efficiency: 87 },
  { department: "Marketing", operations: 45, efficiency: 91 },
  { department: "HR", operations: 34, efficiency: 96 },
  { department: "Finance", operations: 28, efficiency: 89 },
  { department: "Support", operations: 56, efficiency: 92 },
]

const serviceUsageData = [
  { name: "Microsoft 365", value: 245, color: "#0088FE" },
  { name: "Salesforce", value: 189, color: "#00C49F" },
  { name: "Slack", value: 156, color: "#FFBB28" },
  { name: "Jira", value: 134, color: "#FF8042" },
  { name: "GitHub", value: 98, color: "#8884D8" },
]

const responseTimeData = [
  { time: "00:00", avgTime: 2.3 },
  { time: "04:00", avgTime: 1.8 },
  { time: "08:00", avgTime: 3.2 },
  { time: "12:00", avgTime: 4.1 },
  { time: "16:00", avgTime: 3.8 },
  { time: "20:00", avgTime: 2.9 },
]

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Operations Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into platform operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Operations</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last month
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2.8s</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  +0.3s from last month
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">2,456</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.3% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operations Trend</CardTitle>
                <CardDescription>Monthly operations breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={operationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successful" fill="#10B981" name="Successful" />
                    <Bar dataKey="failed" fill="#EF4444" name="Failed" />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Types</CardTitle>
                <CardDescription>Distribution of operation types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "User Provisioning", count: 456, percentage: 36.6 },
                    { type: "Group Assignment", count: 234, percentage: 18.8 },
                    { type: "Permission Updates", count: 189, percentage: 15.2 },
                    { type: "Account Deactivation", count: 167, percentage: 13.4 },
                    { type: "Bulk Operations", count: 201, percentage: 16.1 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-sm font-medium">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Analytics</CardTitle>
              <CardDescription>Operations and efficiency by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="operations" fill="#3B82F6" name="Operations" />
                  <Line yAxisId="right" dataKey="efficiency" stroke="#10B981" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Usage</CardTitle>
                <CardDescription>User distribution across services</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {serviceUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Health</CardTitle>
                <CardDescription>Current status of all services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceUsageData.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{service.value} users</Badge>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response times throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgTime" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peak Response Time</p>
                    <p className="text-2xl font-bold">4.1s</p>
                    <p className="text-xs text-muted-foreground">at 12:00 PM</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Best Response Time</p>
                    <p className="text-2xl font-bold">1.8s</p>
                    <p className="text-xs text-muted-foreground">at 4:00 AM</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                    <p className="text-2xl font-bold">98.7%</p>
                    <p className="text-xs text-green-600">Above target</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
