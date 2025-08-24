import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection for health check
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Minimal connection for health check
  connectionTimeoutMillis: 5000,
});

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      percentage: number;
    };
  };
  uptime: number;
}

// Start time for uptime calculation
const startTime = Date.now();

async function checkDatabase(): Promise<HealthStatus['services']['database']> {
  const start = Date.now();
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    const responseTime = Date.now() - start;
    return {
      status: 'connected',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkRedis(): Promise<HealthStatus['services']['redis']> {
  const start = Date.now();
  
  try {
    // If Redis is configured, add actual Redis health check here
    if (process.env.REDIS_URL) {
      // Placeholder for Redis connection check
      // const redis = new Redis(process.env.REDIS_URL);
      // await redis.ping();
      // redis.disconnect();
      
      return {
        status: 'connected',
        responseTime: Date.now() - start,
      };
    } else {
      return {
        status: 'disconnected',
        responseTime: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

function getMemoryUsage() {
  const used = process.memoryUsage();
  const totalHeap = used.heapTotal;
  const usedHeap = used.heapUsed;
  
  return {
    used: Math.round(usedHeap / 1024 / 1024), // MB
    percentage: Math.round((usedHeap / totalHeap) * 100),
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const healthCheck: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      memory: getMemoryUsage(),
    },
    uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
  };

  // Determine overall health status
  const dbHealthy = healthCheck.services.database.status === 'connected';
  const redisHealthy = healthCheck.services.redis.status === 'connected' || 
                      healthCheck.services.redis.status === 'disconnected'; // Redis is optional
  const memoryHealthy = healthCheck.services.memory.percentage < 90;

  if (!dbHealthy || !memoryHealthy) {
    healthCheck.status = 'unhealthy';
  }

  // Return appropriate HTTP status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthCheck, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// Also support HEAD requests for simple availability checks
export async function HEAD(): Promise<NextResponse> {
  try {
    // Simple database connectivity check for HEAD requests
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}