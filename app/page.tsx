"use client"

import { Suspense } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ServicePerformanceRadar } from "@/components/dashboard/service-performance-radar"
import { ResourceUtilizationChart } from "@/components/dashboard/resource-utilization-chart"
import { RealTimeAlerts } from "@/components/dashboard/real-time-alerts"
import { UserDistributionChart } from "@/components/dashboard/user-distribution-chart"
import { ServiceHealth } from "@/components/dashboard/service-health"
import { AdvancedMetricsGrid } from "@/components/dashboard/advanced-metrics-grid"
import { UserActivityHeatmap } from "@/components/dashboard/user-activity-heatmap"
import { DepartmentServiceMatrix } from "@/components/dashboard/department-service-matrix"
import { SecurityIncidentsTimeline } from "@/components/dashboard/security-incidents-timeline"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Users, Shield, Activity, Database } from "lucide-react"

function DashboardContent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="2,456" description="+12% from last month" icon={Users} trend="up" />
        <StatCard title="Active Services" value="24" description="+2 new this month" icon={Database} trend="up" />
        <StatCard title="Security Score" value="94%" description="+2% from last week" icon={Shield} trend="up" />
        <StatCard
          title="System Health"
          value="99.9%"
          description="All systems operational"
          icon={Activity}
          trend="stable"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <UserDistributionChart />
        </div>
        <div className="col-span-3">
          <ServiceHealth />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3">
          <ServicePerformanceRadar />
        </div>
        <div className="col-span-4">
          <ResourceUtilizationChart />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <UserActivityHeatmap />
        </div>
        <div className="col-span-3">
          <RealTimeAlerts />
        </div>
      </div>

      <AdvancedMetricsGrid />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DepartmentServiceMatrix />
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>

      <SecurityIncidentsTimeline />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-8">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
