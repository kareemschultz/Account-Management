import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Zabbix sync endpoint - synchronize users from Zabbix Monitoring
    const body = await request.json()
    
    // Mock Zabbix API sync logic
    const syncResult = {
      service: 'Zabbix Monitoring',
      status: 'success',
      timestamp: new Date().toISOString(),
      zabbixUrl: 'https://zabbix.company.com',
      usersProcessed: 67,
      usersAdded: 2,
      usersUpdated: 4,
      userGroupsProcessed: 8,
      hostsMonitored: 1247,
      triggersActive: 89,
      errors: []
    }

    // Log the sync operation
    await pool.query(`
      INSERT INTO audit_logs (action, details, timestamp, user_id) 
      VALUES ($1, $2, $3, $4)
    `, ['ZABBIX_SYNC', JSON.stringify(syncResult), new Date(), 1])

    return NextResponse.json(syncResult)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Zabbix sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get Zabbix integration status
    const status = {
      service: 'Zabbix Monitoring',
      lastSync: '2025-08-24T04:00:00Z',
      nextSync: '2025-08-24T10:00:00Z',
      syncEnabled: true,
      connectionStatus: 'connected',
      apiUrl: 'https://zabbix.company.com/api_jsonrpc.php',
      version: '6.4.10',
      totalUsers: 67,
      totalHosts: 1247,
      syncInterval: '6h',
      authMethod: 'API Token'
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get Zabbix status' }, { status: 500 })
  }
}
