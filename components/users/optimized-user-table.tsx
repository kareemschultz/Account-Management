/**
 * ESM Platform - High-Performance User Table Component
 * Optimized for 245+ user records with virtualization and memoization
 */

"use client";

import React, { memo, useMemo, useCallback, useState } from 'react';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOptimizedFilter, usePerformanceMonitor } from '@/lib/performance-hooks';
import { departments } from '@/lib/data';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OptimizedUserTableProps {
  data: User[];
  loading?: boolean;
  onRowClick?: (user: User) => void;
  onRowDoubleClick?: (user: User) => void;
  className?: string;
  containerHeight?: number;
}

// Memoized status badge component for performance
const StatusBadge = memo(({ status }: { status: User['status'] }) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'active':
        return 'default';
      case 'dormant':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  }, [status]);
  
  return (
    <Badge variant={variant} className="text-xs font-medium">
      {status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Memoized security clearance badge
const SecurityBadge = memo(({ clearance }: { clearance: User['securityClearance'] }) => {
  const { bgColor, textColor } = useMemo(() => {
    switch (clearance) {
      case 'Top Secret':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'Restricted':
        return { bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      case 'Confidential':
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'Internal':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  }, [clearance]);
  
  return (
    <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', bgColor, textColor)}>
      {clearance}
    </span>
  );
});

SecurityBadge.displayName = 'SecurityBadge';

// Filter controls component
const FilterControls = memo(({ 
  departmentFilter, 
  setDepartmentFilter,
  employmentFilter,
  setEmploymentFilter,
  clearanceFilter,
  setClearanceFilter,
  statusFilter,
  setStatusFilter
}: {
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  employmentFilter: string;
  setEmploymentFilter: (value: string) => void;
  clearanceFilter: string;
  setClearanceFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) => {
  const employmentTypes = useMemo<User['employmentType'][]>(() => [
    'Permanent', 'Contract', 'Temporary', 'Consultant', 'Intern'
  ], []);
  
  const securityClearances = useMemo<User['securityClearance'][]>(() => [
    'Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'
  ], []);
  
  const statuses = useMemo<User['status'][]>(() => [
    'active', 'dormant', 'suspended'
  ], []);
  
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
        <SelectTrigger className="w-full md:w-[220px]">
          <SelectValue placeholder="Filter by Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select onValueChange={setEmploymentFilter} value={employmentFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Employment Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          {employmentTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select onValueChange={setClearanceFilter} value={clearanceFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Security Clearance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Clearances</SelectItem>
          {securityClearances.map((clearance) => (
            <SelectItem key={clearance} value={clearance}>
              {clearance}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select onValueChange={setStatusFilter} value={statusFilter}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        onClick={() => {
          setDepartmentFilter('');
          setEmploymentFilter('');
          setClearanceFilter('');
          setStatusFilter('');
        }}
        className="ml-auto"
      >
        Clear Filters
      </Button>
    </div>
  );
});

FilterControls.displayName = 'FilterControls';

export const OptimizedUserTable = memo<OptimizedUserTableProps>(({
  data = [],
  loading = false,
  onRowClick,
  onRowDoubleClick,
  className,
  containerHeight = 600
}) => {
  const { logRender } = usePerformanceMonitor('OptimizedUserTable');
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Optimized filtering with memoization
  const filteredData = useOptimizedFilter(
    data,
    useCallback((user: User) => {
      if (departmentFilter && user.department !== departmentFilter) return false;
      if (employmentFilter && user.employmentType !== employmentFilter) return false;
      if (clearanceFilter && user.securityClearance !== clearanceFilter) return false;
      if (statusFilter && user.status !== statusFilter) return false;
      return true;
    }, [departmentFilter, employmentFilter, clearanceFilter, statusFilter]),
    [departmentFilter, employmentFilter, clearanceFilter, statusFilter]
  );
  
  // Define table columns with optimized rendering
  const columns = useMemo(() => [
    {
      key: 'employeeId' as keyof User,
      header: 'Employee ID',
      width: 120,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'name' as keyof User,
      header: 'Name',
      minWidth: 200,
      render: (value: string, user: User) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      )
    },
    {
      key: 'department' as keyof User,
      header: 'Department',
      width: 180,
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      )
    },
    {
      key: 'jobTitle' as keyof User,
      header: 'Job Title',
      width: 160,
      render: (value: string) => (
        <span className="text-sm text-gray-700 truncate" title={value}>{value}</span>
      )
    },
    {
      key: 'employmentType' as keyof User,
      header: 'Employment',
      width: 120,
      render: (value: User['employmentType']) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'securityClearance' as keyof User,
      header: 'Clearance',
      width: 140,
      render: (value: User['securityClearance']) => (
        <SecurityBadge clearance={value} />
      )
    },
    {
      key: 'status' as keyof User,
      header: 'Status',
      width: 100,
      render: (value: User['status']) => (
        <StatusBadge status={value} />
      )
    },
    {
      key: 'phoneNumber' as keyof User,
      header: 'Phone',
      width: 140,
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600">{value || 'N/A'}</span>
      )
    }
  ], []);
  
  // Handle row interactions
  const handleRowClick = useCallback((user: User) => {
    onRowClick?.(user);
  }, [onRowClick]);
  
  const handleRowDoubleClick = useCallback((user: User) => {
    onRowDoubleClick?.(user);
  }, [onRowDoubleClick]);
  
  // Row styling based on status
  const getRowClassName = useCallback((user: User) => {
    switch (user.status) {
      case 'suspended':
        return 'bg-red-50 hover:bg-red-100';
      case 'dormant':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'active':
        return 'hover:bg-blue-50';
      default:
        return 'hover:bg-gray-50';
    }
  }, []);
  
  // Performance logging
  React.useEffect(() => {
    logRender(`${data.length} total users, ${filteredData.length} filtered`);
  }, [data.length, filteredData.length, logRender]);
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <FilterControls
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        employmentFilter={employmentFilter}
        setEmploymentFilter={setEmploymentFilter}
        clearanceFilter={clearanceFilter}
        setClearanceFilter={setClearanceFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <VirtualizedTable
        data={filteredData}
        columns={columns}
        itemHeight={64}
        containerHeight={containerHeight}
        searchable={true}
        searchPlaceholder="Search users by name, ID, or email..."
        searchableColumns={['name', 'employeeId', 'email', 'department']}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        loading={loading}
        emptyMessage="No users found matching your criteria"
        rowClassName={getRowClassName}
        overscan={15} // Higher overscan for smoother scrolling
      />
    </div>
  );
});

OptimizedUserTable.displayName = 'OptimizedUserTable';

export default OptimizedUserTable;