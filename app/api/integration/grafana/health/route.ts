import { NextRequest, NextResponse } from 'next/server'

// Health check for Grafana integration
export async function GET(request: NextRequest) {
  try {
    // Simulate health check for Grafana API
    const startTime = Date.now()
    
    // In production, this would make actual API calls to Grafana
    const healthCheck = {
      service: 'Grafana Monitoring',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime + Math.floor(Math.random() * 100),
      url: 'https://grafana.company.com',
      version: '10.2.3',
      connection: {
        status: 'connected',
        method: 'API Token',
        lastSuccessful: '2025-08-24T07:30:00Z'
      },
      metrics: {
        totalUsers: 87,
        totalOrganizations: 3,
        totalDashboards: 156,
        alertsActive: 12,
        datasourcesConnected: 8
      },
      sync: {
        lastSync: '2025-08-24T02:30:00Z',
        nextSync: '2025-08-24T08:30:00Z',
        syncEnabled: true,
        syncInterval: '6h'
      },
      errors: []
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json({
      service: 'Grafana Monitoring',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

// POST endpoint for testing Grafana connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType = 'connection' } = body

    const connectionTest = {
      service: 'Grafana Monitoring',
      testType,
      timestamp: new Date().toISOString(),
      results: {
        connection: {
          status: 'success',
          responseTime: 89,
          details: 'Successfully connected to Grafana API'
        },
        authentication: {
          status: 'success',
          details: 'API token is valid and active'
        },
        dataRetrieval: {
          status: 'success',
          usersRetrieved: 87,
          organizationsRetrieved: 3,
          details: 'Successfully retrieved user and organization data'
        }
      },
      recommendations: testType === 'full' ? [
        'API token expires in 180 days - consider rotation',
        'User sync is healthy and up to date',
        'No blocked users detected'
      ] : []
    }

    return NextResponse.json(connectionTest)
  } catch (error) {
    return NextResponse.json({
      service: 'Grafana Monitoring',
      testType: 'connection',
      status: 'error',
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
