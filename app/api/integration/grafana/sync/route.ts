import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Grafana sync endpoint - synchronize users from Grafana
    const body = await request.json()
    
    // Mock Grafana API sync logic
    const syncResult = {
      service: 'Grafana',
      status: 'success',
      timestamp: new Date().toISOString(),
      grafanaUrl: 'https://grafana.company.com',
      usersProcessed: 87,
      usersAdded: 5,
      usersUpdated: 8,
      organizationsProcessed: 3,
      teamsProcessed: 12,
      dashboardPermissions: 156,
      errors: []
    }

    // Log the sync operation
    await pool.query(`
      INSERT INTO audit_logs (action, details, timestamp, user_id) 
      VALUES ($1, $2, $3, $4)
    `, ['GRAFANA_SYNC', JSON.stringify(syncResult), new Date(), 1])

    return NextResponse.json(syncResult)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Grafana sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get Grafana integration status
    const status = {
      service: 'Grafana',
      lastSync: '2025-08-24T02:30:00Z',
      nextSync: '2025-08-24T08:30:00Z',
      syncEnabled: true,
      connectionStatus: 'connected',
      apiUrl: 'https://grafana.company.com/api',
      version: '10.2.3',
      totalUsers: 87,
      totalOrganizations: 3,
      syncInterval: '6h',
      authMethod: 'API Token'
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get Grafana status' }, { status: 500 })
  }
}