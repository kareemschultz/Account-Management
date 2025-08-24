/**
 * ESM Platform - React Performance Optimization Hooks
 * Optimized for 300+ concurrent users and large datasets
 */

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

// ============================================
// MEMORY-OPTIMIZED HOOKS
// ============================================

/**
 * Memory-efficient state hook with automatic cleanup
 */
export function useOptimizedState<T>(
  initialValue: T,
  dependencies: any[] = []
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Memoized setter to prevent unnecessary re-renders
  const optimizedSetter = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      // Only update if value actually changed
      if (newState !== prevState) {
        return newState;
      }
      return prevState;
    });
  }, dependencies);
  
  return [state, optimizedSetter];
}

/**
 * Debounced search hook for large datasets
 */
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 300
): string {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);
  
  return debouncedValue;
}

/**
 * Virtualized list hook for handling large datasets
 */
export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleStart + visibleCount + overscan);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange
  };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options]);
  
  return [targetRef, isIntersecting];
}

/**
 * Throttled scroll hook for performance
 */
export function useThrottledScroll(delay: number = 16) {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  
  const throttledHandler = useMemo(
    () => throttle(() => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      });
    }, delay),
    [delay]
  );
  
  useEffect(() => {
    window.addEventListener('scroll', throttledHandler);
    return () => {
      window.removeEventListener('scroll', throttledHandler);
      throttledHandler.cancel();
    };
  }, [throttledHandler]);
  
  return scrollPosition;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - renderStartTime.current;
    
    // Log slow renders (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`🐌 Slow render in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current
      });
    }
    
    // Reset timer for next render
    renderStartTime.current = performance.now();
  });
  
  return {
    renderCount: renderCount.current,
    logRender: (label?: string) => {
      console.log(`🔄 ${componentName}${label ? ` (${label})` : ''} rendered`);
    }
  };
}

// ============================================
// DATA PROCESSING OPTIMIZATIONS
// ============================================

/**
 * Memoized sorting hook for large datasets
 */
export function useOptimizedSort<T>(
  data: T[],
  sortKey: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return useMemo(() => {
    if (!data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);
}

/**
 * Memoized filtering hook for large datasets
 */
export function useOptimizedFilter<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
): T[] {
  return useMemo(() => {
    if (!data || data.length === 0) return data;
    return data.filter(filterFn);
  }, [data, ...dependencies]);
}

/**
 * Paginated data hook with performance optimization
 */
export function usePaginatedData<T>({
  data,
  pageSize = 25,
  initialPage = 1
}: {
  data: T[];
  pageSize?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);
  
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);
  
  return {
    data: paginatedData,
    currentPage,
    totalPages,
    totalItems: data.length,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    pageSize
  };
}

// ============================================
// CACHE AND MEMOIZATION UTILITIES
// ============================================

/**
 * LRU Cache hook for expensive computations
 */
export function useLRUCache<K, V>(maxSize: number = 100) {
  const cache = useRef(new Map<K, V>());
  const order = useRef(new Set<K>());
  
  const get = useCallback((key: K): V | undefined => {
    if (cache.current.has(key)) {
      // Move to end (most recently used)
      order.current.delete(key);
      order.current.add(key);
      return cache.current.get(key);
    }
    return undefined;
  }, []);
  
  const set = useCallback((key: K, value: V): void => {
    if (cache.current.has(key)) {
      // Update existing
      cache.current.set(key, value);
      order.current.delete(key);
      order.current.add(key);
    } else {
      // Add new
      if (cache.current.size >= maxSize) {
        // Remove least recently used
        const oldest = order.current.values().next().value;
        cache.current.delete(oldest);
        order.current.delete(oldest);
      }
      cache.current.set(key, value);
      order.current.add(key);
    }
  }, [maxSize]);
  
  const clear = useCallback(() => {
    cache.current.clear();
    order.current.clear();
  }, []);
  
  return { get, set, clear, size: cache.current.size };
}

/**
 * Expensive computation hook with memoization
 */
export function useMemoizedComputation<T, R>(
  computeFn: (input: T) => R,
  input: T,
  dependencies: any[] = []
): R {
  return useMemo(() => {
    const startTime = performance.now();
    const result = computeFn(input);
    const duration = performance.now() - startTime;
    
    // Log expensive computations (>10ms)
    if (duration > 10) {
      console.warn(`🔄 Expensive computation took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }, [input, ...dependencies]);
}

export default {
  useOptimizedState,
  useDebouncedSearch,
  useVirtualizedList,
  useIntersectionObserver,
  useThrottledScroll,
  usePerformanceMonitor,
  useOptimizedSort,
  useOptimizedFilter,
  usePaginatedData,
  useLRUCache,
  useMemoizedComputation
};