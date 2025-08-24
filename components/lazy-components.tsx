/**
 * ESM Platform - Lazy-Loaded Components for Bundle Optimization
 * Code-splitting for better performance and reduced initial bundle size
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading components for better UX
const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-12 w-20" />
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-12 w-16" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-64 w-full" />
    <div className="flex justify-center space-x-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-16" />
      ))}
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// ============================================
// LAZY-LOADED COMPONENTS
// ============================================

// User Management Components
export const LazyOptimizedUserTable = dynamic(
  () => import('@/components/users/optimized-user-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false // Disable SSR for heavy table component
  }
);

export const LazyUserTable = dynamic(
  () => import('@/components/users/user-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

// Virtualized Components
export const LazyVirtualizedTable = dynamic(
  () => import('@/components/ui/virtualized-table').then(mod => ({ default: mod.VirtualizedTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

// Dashboard Components
export const LazyUserDistributionChart = dynamic(
  () => import('@/components/dashboard/user-distribution-chart'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazyServicePerformanceRadar = dynamic(
  () => import('@/components/dashboard/service-performance-radar'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazyUserActivityHeatmap = dynamic(
  () => import('@/components/dashboard/user-activity-heatmap'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazyResourceUtilizationChart = dynamic(
  () => import('@/components/dashboard/resource-utilization-chart'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazyAdvancedMetricsGrid = dynamic(
  () => import('@/components/dashboard/advanced-metrics-grid'),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    )
  }
);

// Reports Components
export const LazyAccessHeatmap = dynamic(
  () => import('@/components/reports/access-heatmap'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazyServiceAdoptionChart = dynamic(
  () => import('@/components/reports/service-adoption-chart'),
  {
    loading: () => <ChartSkeleton />
  }
);

export const LazySecurityClearancePie = dynamic(
  () => import('@/components/reports/security-clearance-pie'),
  {
    loading: () => <ChartSkeleton />
  }
);

// VPN Components
export const LazyVPNConfiguration = dynamic(
  () => import('@/components/vpn/vpn-configuration'),
  {
    loading: () => <FormSkeleton />
  }
);

export const LazyActiveConnectionsTable = dynamic(
  () => import('@/components/vpn/active-connections-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

export const LazyNetworkTopology = dynamic(
  () => import('@/components/vpn/network-topology'),
  {
    loading: () => (
      <div className="h-96 rounded-lg border flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading network diagram...</div>
      </div>
    ),
    ssr: false
  }
);

// Access Matrix Components
export const LazyDepartmentServiceMatrix = dynamic(
  () => import('@/components/dashboard/department-service-matrix'),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex space-x-2">
              <Skeleton className="h-8 w-32" />
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-8" />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
);

// Services Components
export const LazyEnhancedBulkOperations = dynamic(
  () => import('@/components/services/enhanced-bulk-operations'),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
);

export const LazyBulkOperationHistory = dynamic(
  () => import('@/components/services/bulk-operation-history'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

// Import/Export Components
export const LazyImportCard = dynamic(
  () => import('@/components/import-export/import-card'),
  {
    loading: () => <FormSkeleton />
  }
);

export const LazyExportCard = dynamic(
  () => import('@/components/import-export/export-card'),
  {
    loading: () => <FormSkeleton />
  }
);

export const LazyHistoryTable = dynamic(
  () => import('@/components/import-export/history-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

// Audit Components
export const LazyAuditTimeline = dynamic(
  () => import('@/components/audit/audit-timeline'),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-4 p-4 border rounded">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }
);

// Compliance Components
export const LazyComplianceControlsTable = dynamic(
  () => import('@/components/compliance/compliance-controls-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
);

// ============================================
// PRELOAD UTILITIES
// ============================================

export const preloadCriticalComponents = () => {
  // Preload components that are likely to be needed soon
  if (typeof window !== 'undefined') {
    // Preload user table (most commonly accessed)
    import('@/components/users/optimized-user-table');
    
    // Preload dashboard charts
    import('@/components/dashboard/user-distribution-chart');
    import('@/components/dashboard/advanced-metrics-grid');
  }
};\n\n// Auto-preload on client side after initial render\nif (typeof window !== 'undefined') {\n  // Delay preload to not interfere with initial render\n  setTimeout(preloadCriticalComponents, 2000);\n}\n\nexport default {\n  LazyOptimizedUserTable,\n  LazyUserTable,\n  LazyVirtualizedTable,\n  LazyUserDistributionChart,\n  LazyServicePerformanceRadar,\n  LazyUserActivityHeatmap,\n  LazyResourceUtilizationChart,\n  LazyAdvancedMetricsGrid,\n  LazyAccessHeatmap,\n  LazyServiceAdoptionChart,\n  LazySecurityClearancePie,\n  LazyVPNConfiguration,\n  LazyActiveConnectionsTable,\n  LazyNetworkTopology,\n  LazyDepartmentServiceMatrix,\n  LazyEnhancedBulkOperations,\n  LazyBulkOperationHistory,\n  LazyImportCard,\n  LazyExportCard,\n  LazyHistoryTable,\n  LazyAuditTimeline,\n  LazyComplianceControlsTable,\n  preloadCriticalComponents\n};