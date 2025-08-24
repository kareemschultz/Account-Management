import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Unifi sync endpoint - synchronize users from Unifi Network Controller
    const body = await request.json()
    
    // Mock Unifi API sync logic
    const syncResult = {
      service: 'Unifi Network',
      status: 'success',
      timestamp: new Date().toISOString(),
      controllerUrl: 'https://unifi.company.com',
      usersProcessed: 156,
      usersAdded: 3,
      usersUpdated: 7,
      sitesProcessed: 5,
      devicesManaged: 142,
      clientsSeen: 289,
      errors: []
    }

    // Log the sync operation
    await pool.query(`
      INSERT INTO audit_logs (action, details, timestamp, user_id) 
      VALUES ($1, $2, $3, $4)
    `, ['UNIFI_SYNC', JSON.stringify(syncResult), new Date(), 1])

    return NextResponse.json(syncResult)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Unifi sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get Unifi integration status
    const status = {
      service: 'Unifi Network',
      lastSync: '2025-08-24T01:00:00Z',
      nextSync: '2025-08-24T07:00:00Z',
      syncEnabled: true,
      connectionStatus: 'connected',
      controllerUrl: 'unifi.company.com:8443',
      version: '8.0.24',
      totalUsers: 156,
      totalSites: 5,
      totalDevices: 142,
      syncInterval: '6h',
      authMethod: 'Local Account'
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get Unifi status' }, { status: 500 })
  }
}
