import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Master sync endpoint - synchronize users from all services
    const { services } = await request.json()
    const servicesToSync = services || [
      'ldap', 'grafana', 'teleport', 'unifi', 'zabbix', 'radius', 
      'ipam', 'kibana', 'itop', 'neteco', 'esight', 'mikrotik-vpn', 
      'fortigate-vpn', 'noc-services', 'biometrics', 'eight-sight'
    ]

    const syncResults = {
      status: 'success',
      timestamp: new Date().toISOString(),
      totalServices: servicesToSync.length,
      servicesProcessed: servicesToSync.length,
      totalUsersProcessed: 0,
      totalUsersAdded: 0,
      totalUsersUpdated: 0,
      totalUsersDeactivated: 0,
      serviceResults: [] as any[]
    }

    // Mock sync results for each service
    for (const service of servicesToSync) {
      const serviceResult = {
        service: service.toUpperCase(),
        status: 'success',
        usersProcessed: Math.floor(Math.random() * 100) + 10,
        usersAdded: Math.floor(Math.random() * 5),
        usersUpdated: Math.floor(Math.random() * 10),
        usersDeactivated: Math.floor(Math.random() * 2),
        syncDuration: Math.floor(Math.random() * 30) + 5 + 's'
      }
      
      syncResults.totalUsersProcessed += serviceResult.usersProcessed
      syncResults.totalUsersAdded += serviceResult.usersAdded
      syncResults.totalUsersUpdated += serviceResult.usersUpdated
      syncResults.totalUsersDeactivated += serviceResult.usersDeactivated
      syncResults.serviceResults.push(serviceResult)
    }

    // Log the master sync operation
    await pool.query(`
      INSERT INTO audit_logs (action, details, timestamp, user_id) 
      VALUES ($1, $2, $3, $4)
    `, ['MASTER_SYNC', JSON.stringify(syncResults), new Date(), 1])

    return NextResponse.json(syncResults)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Master sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get sync status for all services
    const allServicesStatus = {
      lastMasterSync: '2025-08-24T06:00:00Z',
      nextMasterSync: '2025-08-25T06:00:00Z',
      masterSyncEnabled: true,
      totalServices: 16,
      connectedServices: 14,
      disconnectedServices: 2,
      services: [
        { name: 'LDAP', status: 'connected', lastSync: '2025-08-24T06:00:00Z', users: 245 },
        { name: 'Grafana', status: 'connected', lastSync: '2025-08-24T02:30:00Z', users: 87 },
        { name: 'Teleport', status: 'connected', lastSync: '2025-08-24T03:00:00Z', users: 45 },
        { name: 'Unifi', status: 'connected', lastSync: '2025-08-24T01:00:00Z', users: 156 },
        { name: 'Zabbix', status: 'connected', lastSync: '2025-08-24T04:00:00Z', users: 67 },
        { name: 'RADIUS', status: 'connected', lastSync: '2025-08-24T05:00:00Z', users: 189 },
        { name: 'IPAM', status: 'connected', lastSync: '2025-08-24T02:00:00Z', users: 78 },
        { name: 'Kibana', status: 'connected', lastSync: '2025-08-24T03:30:00Z', users: 45 },
        { name: 'ITop', status: 'connected', lastSync: '2025-08-24T01:30:00Z', users: 234 },
        { name: 'NetEco', status: 'connected', lastSync: '2025-08-24T04:30:00Z', users: 34 },
        { name: 'eSight', status: 'connected', lastSync: '2025-08-24T05:30:00Z', users: 23 },
        { name: 'Mikrotik VPN', status: 'connected', lastSync: '2025-08-24T02:45:00Z', users: 67 },
        { name: 'FortiGate VPN', status: 'connected', lastSync: '2025-08-24T03:45:00Z', users: 89 },
        { name: 'NOC Services', status: 'connected', lastSync: '2025-08-24T04:45:00Z', users: 45 },
        { name: 'Biometrics', status: 'disconnected', lastSync: '2025-08-23T06:00:00Z', users: 156, error: 'Connection timeout' },
        { name: 'Eight Sight', status: 'disconnected', lastSync: '2025-08-23T12:00:00Z', users: 23, error: 'API key expired' }
      ]
    }

    return NextResponse.json(allServicesStatus)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get services status' }, { status: 500 })
  }
}