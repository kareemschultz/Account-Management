/**
 * ESM Platform - Database Connection Configuration
 * Handles PostgreSQL connection and query utilities
 */

import { Pool, PoolClient } from 'pg';

// Database configuration optimized for 300+ concurrent users
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'esm_platform',
  user: process.env.DB_USER || 'esm_user',
  password: process.env.DB_PASSWORD || '',
  
  // Optimized pool settings for high concurrency
  min: parseInt(process.env.DB_POOL_MIN || '5'),           // Keep minimum connections ready
  max: parseInt(process.env.DB_POOL_MAX || '50'),          // Handle up to 50 concurrent connections
  acquireTimeoutMillis: 60000,                            // Wait up to 60s for connection
  idleTimeoutMillis: parseInt(process.env.DB_POOL_TIMEOUT || '60000'), // Keep connections alive longer
  connectionTimeoutMillis: 5000,                          // Connection timeout
  keepAlive: true,                                         // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0,                         // Start keep-alive immediately
  
  // Performance optimizations
  statement_timeout: 30000,                               // 30s query timeout
  query_timeout: 25000,                                   // 25s individual query timeout
  application_name: 'esm_platform_web',                  // App identifier
};

// Alternative: use DATABASE_URL if provided
if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for production deployments
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = parseInt(url.port) || 5432;
  dbConfig.database = url.pathname.substring(1); // Remove leading slash
  dbConfig.user = url.username;
  dbConfig.password = url.password;
}

// Create connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    // Log connection info (without password)
    console.log(`🔌 Database pool configured: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }
  return pool;
}

// Optimized database query utilities with performance monitoring
export async function query<T = any>(text: string, params?: any[], options?: { 
  timeout?: number;
  priority?: 'high' | 'normal' | 'low';
  cache?: boolean;
}): Promise<T[]> {
  const pool = getPool();
  const startTime = Date.now();
  
  try {
    // Apply query timeout if specified
    const queryTimeout = options?.timeout || 25000;
    
    // Add query performance monitoring
    const result = await Promise.race([
      pool.query(text, params),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    
    // Log slow queries (>1000ms)
    if (duration > 1000) {
      console.warn(`🐌 Slow query detected (${duration}ms):`, {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration,
        priority: options?.priority || 'normal'
      });
    }
    
    return (result as any).rows;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Database query error:', {
      error: error instanceof Error ? error.message : error,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params: params?.length ? `${params.length} parameters` : 'no parameters',
      duration,
      priority: options?.priority || 'normal'
    });
    throw error;
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Transaction support
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Comprehensive database health check with connection pool metrics
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency?: number;
  version?: string;
  poolStats?: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
  error?: string;
}> {
  try {
    const start = Date.now();
    const pool = getPool();
    
    // Test connection and get version
    const result = await queryOne<{ version: string }>('SELECT version() as version');
    const latency = Date.now() - start;
    
    // Get pool statistics for monitoring
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
    
    return {
      connected: true,
      latency,
      version: result?.version?.split(' ')[1] || 'Unknown',
      poolStats
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Database initialization
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔧 Initializing database connection...');
    
    // Test connection
    const health = await checkDatabaseHealth();
    if (!health.connected) {
      throw new Error(`Database connection failed: ${health.error}`);
    }
    
    console.log(`✅ Database connected successfully (PostgreSQL ${health.version}, ${health.latency}ms)`);
    
    // Verify essential tables exist
    const tables = await query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'services', 'departments')
    `);
    
    if (tables.length < 3) {
      console.warn('⚠️ Some required tables are missing. Please run the schema.sql file.');
      console.warn('Required tables: users, services, departments');
      console.warn(`Found tables: ${tables.map(t => t.table_name).join(', ')}`);
    } else {
      console.log('✅ Essential database tables verified');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Cleanup
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connections closed');
  }
}

// Query result caching for frequently accessed data
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedQuery<T = any>(
  cacheKey: string, 
  queryFn: () => Promise<T[]>,
  ttlMs: number = 300000 // 5 minutes default
): Promise<T[]> {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached result if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return Promise.resolve(cached.data);
  }
  
  // Execute query and cache result
  return queryFn().then(data => {
    queryCache.set(cacheKey, { data, timestamp: now, ttl: ttlMs });
    return data;
  });
}

export function clearQueryCache(pattern?: string): void {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

// Bulk operations for performance
export async function queryBatch<T = any>(
  queries: Array<{ text: string; params?: any[] }>,
  options?: { transaction?: boolean }
): Promise<T[][]> {
  if (options?.transaction) {
    return withTransaction(async (client) => {
      const results: T[][] = [];
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result.rows);
      }
      return results;
    });
  } else {
    const pool = getPool();
    const promises = queries.map(q => pool.query(q.text, q.params));
    const results = await Promise.all(promises);
    return results.map(r => r.rows);
  }
}

// Performance monitoring
export interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  averageLatency: number;
  cacheHits: number;
  cacheMisses: number;
}

const metrics: QueryMetrics = {
  totalQueries: 0,
  slowQueries: 0,
  averageLatency: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

export function getQueryMetrics(): QueryMetrics {
  return { ...metrics };
}

export function resetQueryMetrics(): void {
  Object.assign(metrics, {
    totalQueries: 0,
    slowQueries: 0,
    averageLatency: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });
}

// Database connection warming for faster startup
export async function warmUpConnections(): Promise<void> {
  const pool = getPool();
  const warmupQueries = Array(Math.min(dbConfig.min, 3)).fill(0).map(() => 
    query('SELECT 1 as warmup', [])
  );
  
  try {
    await Promise.all(warmupQueries);
    console.log('✅ Database connections warmed up');
  } catch (error) {
    console.warn('⚠️ Connection warmup failed:', error);
  }
}

// Export pool for advanced usage
export { pool };