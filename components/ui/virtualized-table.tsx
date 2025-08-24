/**
 * ESM Platform - High-Performance Virtualized Table Component
 * Optimized for 300+ concurrent users and large datasets (245+ records)
 */

"use client";

import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useVirtualizedList, useDebouncedSearch, usePerformanceMonitor } from '@/lib/performance-hooks';
import { cn } from '@/lib/utils';

interface VirtualizedTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: VirtualizedTableColumn<T>[];
  itemHeight?: number;
  containerHeight?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchableColumns?: (keyof T)[];
  sortable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  overscan?: number;
}

// Memoized table row component for performance
const TableRow = memo(<T,>({ 
  row, 
  columns, 
  index, 
  onClick, 
  onDoubleClick, 
  className,
  style 
}: {
  row: T;
  columns: VirtualizedTableColumn<T>[];
  index: number;
  onClick?: (row: T, index: number) => void;
  onDoubleClick?: (row: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const handleClick = useCallback(() => {
    onClick?.(row, index);
  }, [onClick, row, index]);
  
  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(row, index);
  }, [onDoubleClick, row, index]);

  return (
    <div
      className={cn(
        "flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150",
        className
      )}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {columns.map((column, colIndex) => {
        const value = typeof column.key === 'string' && column.key.includes('.') 
          ? column.key.split('.').reduce((obj, key) => obj?.[key], row as any)
          : (row as any)[column.key];
        
        return (
          <div
            key={`${column.key as string}-${colIndex}`}
            className={cn(
              "px-4 py-2 text-sm text-gray-900 truncate",
              column.className
            )}
            style={{
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.minWidth || 120,
              maxWidth: column.maxWidth || 300,
              flex: column.width ? 'none' : 1
            }}
            title={typeof value === 'string' ? value : String(value)}
          >
            {column.render ? column.render(value, row, index) : String(value || '')}
          </div>
        );
      })}
    </div>
  );
}) as <T>(props: {
  row: T;
  columns: VirtualizedTableColumn<T>[];
  index: number;
  onClick?: (row: T, index: number) => void;
  onDoubleClick?: (row: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) => JSX.Element;

TableRow.displayName = 'TableRow';

// Memoized search input component
const SearchInput = memo(({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
}) => (
  <div className="mb-4">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';

// Main virtualized table component
export function VirtualizedTable<T>({
  data = [],
  columns,
  itemHeight = 48,
  containerHeight = 600,
  searchable = true,
  searchPlaceholder,
  searchableColumns,
  sortable = true,
  onRowClick,
  onRowDoubleClick,
  className,
  loading = false,
  emptyMessage = "No data available",
  headerClassName,
  rowClassName,
  overscan = 10
}: VirtualizedTableProps<T>) {
  const { logRender } = usePerformanceMonitor('VirtualizedTable');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300);
  
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return data;
    
    const searchColumns = searchableColumns || columns.map(col => col.key);
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item =>
      searchColumns.some(key => {
        const value = typeof key === 'string' && key.includes('.') 
          ? key.split('.').reduce((obj, k) => obj?.[k], item as any)
          : (item as any)[key];
        
        return String(value || '').toLowerCase().includes(searchLower);
      })
    );
  }, [data, debouncedSearchTerm, searchableColumns, columns]);
  
  // Sorting functionality
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = typeof sortConfig.key === 'string' && sortConfig.key.includes('.')
        ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a as any)
        : (a as any)[sortConfig.key];
      
      const bValue = typeof sortConfig.key === 'string' && sortConfig.key.includes('.')
        ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b as any)
        : (b as any)[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  const handleSort = useCallback((columnKey: keyof T | string) => {
    setSortConfig(current => ({
      key: columnKey,
      direction: current?.key === columnKey && current?.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  // Virtualization
  const {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange
  } = useVirtualizedList({
    items: sortedData,
    itemHeight,
    containerHeight,
    overscan
  });
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, [setScrollTop]);
  
  // Row className handler
  const getRowClassName = useCallback((row: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  }, [rowClassName]);
  
  // Performance logging
  React.useEffect(() => {
    logRender(`${data.length} items, ${visibleItems.length} visible`);
  }, [data.length, visibleItems.length, logRender]);
  
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height: containerHeight }}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height: containerHeight }}>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }
  
  return (
    <div className={cn("w-full", className)}>
      {searchable && (
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={searchPlaceholder}
        />
      )}
      
      {/* Performance Stats (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 text-xs text-gray-500">
          Showing {visibleRange.start + 1}-{visibleRange.end} of {sortedData.length} items
          {debouncedSearchTerm && ` (filtered from ${data.length})`}
        </div>
      )}
      
      {/* Table Header */}
      <div className={cn(
        "flex items-center bg-gray-50 border-b border-gray-200 sticky top-0 z-10",
        headerClassName
      )}>
        {columns.map((column, index) => (
          <div
            key={`header-${column.key as string}-${index}`}
            className={cn(
              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate",
              sortable && column.sortable !== false && "cursor-pointer hover:bg-gray-100 transition-colors",
              column.className
            )}
            style={{
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.minWidth || 120,
              maxWidth: column.maxWidth || 300,
              flex: column.width ? 'none' : 1
            }}
            onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {sortable && column.sortable !== false && sortConfig?.key === column.key && (
                <span className="text-blue-600">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Virtualized Table Body */}
      <div
        ref={containerRef}
        className="relative overflow-auto border border-gray-200"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map(({ item, index }) => (
              <TableRow
                key={`row-${index}`}
                row={item}
                columns={columns}
                index={index}
                onClick={onRowClick}
                onDoubleClick={onRowDoubleClick}
                className={getRowClassName(item, index)}
                style={{ height: itemHeight }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Table Footer with Stats */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Total: {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
        {debouncedSearchTerm && (
          <span className="ml-2">
            (filtered from {data.length})
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(VirtualizedTable) as typeof VirtualizedTable;