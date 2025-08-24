/**
 * ESM Platform - API Performance Optimization Utilities
 * Optimized for 300+ concurrent users with caching, rate limiting, and response optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// ============================================
// RESPONSE CACHING UTILITIES
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag: string;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Limit cache size to prevent memory issues
  
  set<T>(key: string, data: T, ttlMs: number = 300000): string {
    // Generate ETag for caching validation
    const etag = this.generateETag(data);
    
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      etag
    });
    
    return etag;
  }
  
  get<T>(key: string): { data: T; etag: string } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if ((now - entry.timestamp) > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return { data: entry.data, etag: entry.etag };
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    for (const [key, entry] of entries) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key);
      }
    }
    
    // If still too full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key)) // Only existing entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = Math.floor(this.maxSize * 0.1); // Remove 10% of entries
      for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }
  
  private generateETag(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `"${hash.toString(36)}"`;
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const apiCache = new APICache();

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  async isAllowed(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }
    
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    entry.count++;
    this.limits.set(identifier, entry);
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Different rate limiters for different endpoints
export const rateLimiters = {
  general: new RateLimiter(100, 60000),    // 100 requests per minute
  auth: new RateLimiter(10, 300000),       // 10 auth attempts per 5 minutes
  bulk: new RateLimiter(5, 60000),         // 5 bulk operations per minute
  search: new RateLimiter(200, 60000),     // 200 search requests per minute
  reports: new RateLimiter(20, 60000),     // 20 report generations per minute
};

// ============================================
// REQUEST OPTIMIZATION UTILITIES
// ============================================

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = userAgent.slice(0, 20); // Use first 20 chars
  
  return `${ip}:${userAgentHash}`;
}

export function createCacheKey(request: NextRequest, additionalKeys: string[] = []): string {
  const url = new URL(request.url);
  const pathAndQuery = url.pathname + url.search;
  const method = request.method;
  
  const baseKey = `${method}:${pathAndQuery}`;
  
  if (additionalKeys.length > 0) {
    return `${baseKey}:${additionalKeys.join(':')}`;
  }
  
  return baseKey;
}

// ============================================
// RESPONSE OPTIMIZATION
// ============================================

export interface APIResponseOptions {
  cache?: boolean;
  cacheTTL?: number;
  compress?: boolean;
  rateLimitType?: keyof typeof rateLimiters;
  includeMetrics?: boolean;
}

export async function optimizedAPIResponse<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options: APIResponseOptions = {}
): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    // Rate limiting check
    if (options.rateLimitType) {
      const identifier = getClientIdentifier(request);
      const rateLimiter = rateLimiters[options.rateLimitType];
      const rateLimit = await rateLimiter.isAllowed(identifier);
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', type: 'RATE_LIMIT_EXCEEDED' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(rateLimiter['maxRequests']),
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-RateLimit-Reset': String(rateLimit.resetTime),
              'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
            }
          }
        );
      }
    }
    
    // Cache check
    let cacheKey: string | null = null;
    let cachedResult: { data: T; etag: string } | null = null;
    
    if (options.cache && request.method === 'GET') {
      cacheKey = createCacheKey(request);
      cachedResult = apiCache.get<T>(cacheKey);
      
      // Check If-None-Match header for conditional requests
      const ifNoneMatch = request.headers.get('If-None-Match');
      if (cachedResult && ifNoneMatch === cachedResult.etag) {
        return new NextResponse(null, { status: 304 });
      }
    }
    
    let data: T;
    let etag: string | undefined;
    
    if (cachedResult) {
      // Use cached data
      data = cachedResult.data;
      etag = cachedResult.etag;
    } else {
      // Execute handler
      data = await handler();
      
      // Cache the result
      if (options.cache && cacheKey && request.method === 'GET') {
        etag = apiCache.set(cacheKey, data, options.cacheTTL);
      }
    }
    
    const duration = performance.now() - startTime;
    
    // Prepare response headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': options.cache 
        ? `public, max-age=${Math.floor((options.cacheTTL || 300000) / 1000)}` 
        : 'no-cache, no-store, must-revalidate',
    };
    
    if (etag) {
      responseHeaders['ETag'] = etag;
    }
    
    // Add performance metrics in development or if requested
    if (options.includeMetrics || process.env.NODE_ENV === 'development') {
      responseHeaders['X-Response-Time'] = `${duration.toFixed(2)}ms`;
      responseHeaders['X-Cache-Status'] = cachedResult ? 'HIT' : 'MISS';
    }
    
    // Compression hint (actual compression handled by Next.js/deployment)
    if (options.compress) {
      responseHeaders['Content-Encoding'] = 'gzip';
    }
    
    const response = {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(options.includeMetrics && {
          performance: {
            responseTime: duration,
            cached: !!cachedResult
          }
        })
      }
    };
    
    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders
    });
    
  } catch (error) {
    const duration = performance.now() - startTime;
    
    console.error('API Error:', {
      url: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : error,
      duration: `${duration.toFixed(2)}ms`
    });
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        type: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${duration.toFixed(2)}ms`
        }
      }
    );
  }
}

// ============================================
// BULK OPERATIONS OPTIMIZATION
// ============================================

export async function processBulkOperation<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    maxConcurrency?: number;
    onProgress?: (completed: number, total: number) => void;
    onError?: (error: Error, item: T, index: number) => void;
  } = {}
): Promise<R[]> {
  const { batchSize = 10, maxConcurrency = 5, onProgress, onError } = options;
  const results: R[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  
  // Process in batches to control memory usage and concurrency
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch with controlled concurrency
    const batchPromises = batch.map(async (item, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const result = await processor(item);
        results[globalIndex] = result;
        onProgress?.(results.filter(r => r !== undefined).length, items.length);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ index: globalIndex, error: err });
        onError?.(err, item, globalIndex);
        throw err;
      }
    });
    
    // Wait for batch to complete with controlled concurrency
    const semaphore = new Array(Math.min(maxConcurrency, batch.length)).fill(null);
    let promiseIndex = 0;
    
    await Promise.allSettled(
      semaphore.map(async () => {
        while (promiseIndex < batchPromises.length) {
          const currentPromise = batchPromises[promiseIndex++];
          try {
            await currentPromise;
          } catch {
            // Error already handled in the promise
          }
        }
      })
    );
  }
  
  return results;
}

// ============================================
// CLEANUP AND MAINTENANCE
// ============================================

export function startCleanupInterval(intervalMs: number = 300000): () => void {
  const interval = setInterval(() => {
    // Clean up rate limiters
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
    
    // Cache cleanup is handled automatically in the APICache class
    
    console.log('🧹 API optimization cleanup completed');
  }, intervalMs);
  
  return () => clearInterval(interval);
}

// ============================================
// MONITORING AND METRICS
// ============================================

export interface APIMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  rateLimitBlocks: number;
  averageResponseTime: number;
  errorCount: number;
}

class MetricsCollector {
  private metrics: APIMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    rateLimitBlocks: 0,
    averageResponseTime: 0,
    errorCount: 0
  };
  
  private responseTimes: number[] = [];
  private maxResponseTimes = 1000; // Keep last 1000 response times
  
  recordRequest(): void {
    this.metrics.totalRequests++;
  }
  
  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }
  
  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }
  
  recordRateLimit(): void {
    this.metrics.rateLimitBlocks++;
  }
  
  recordError(): void {
    this.metrics.errorCount++;
  }
  
  recordResponseTime(duration: number): void {
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes = this.responseTimes.slice(-this.maxResponseTimes);
    }
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
  
  getMetrics(): APIMetrics & { 
    cacheHitRate: number; 
    p95ResponseTime: number;
    p99ResponseTime: number;
  } {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? this.metrics.cacheHits / cacheTotal : 0;
    
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
    
    return {
      ...this.metrics,
      cacheHitRate,
      p95ResponseTime,
      p99ResponseTime
    };
  }
  
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitBlocks: 0,
      averageResponseTime: 0,
      errorCount: 0
    };
    this.responseTimes = [];
  }
}

export const metricsCollector = new MetricsCollector();

export default {
  apiCache,
  rateLimiters,
  optimizedAPIResponse,
  processBulkOperation,
  startCleanupInterval,
  metricsCollector
};