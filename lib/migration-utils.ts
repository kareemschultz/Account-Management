/**
 * ESM Platform - Spreadsheet Data Migration Utilities
 * Converts Excel spreadsheet data to database format
 * Date: 2025-08-20
 * Source: AccountManagementJune_20250606_v01.xlsx analysis
 */

// Service mapping from spreadsheet columns to database
export const SERVICE_COLUMN_MAPPING = {
  ipam: {
    access: 4, // Column E: "IPAM Access (Yes/No)"
    accountType: 5, // Column F: "IPAM Account Type (Local/Active Directory)"
    accountStatus: 6, // Column G: "IPAM Account Status (Active\" or \"Inactive)"
    accessLevel: 7, // Column H: "IPAM Access Level"
    groups: 8, // Column I: "IPAM Groups"
  },
  grafana: {
    access: 9, // Column J: "Grafana Access"
    accountType: 10, // Column K: "Grafana Account Type"
    accountStatus: 11, // Column L: "Grafana Account Status"
    accessLevel: 12, // Column M: "Grafana Access Level"
    groups: 13, // Column N: "Grafana Groups"
  },
  teleport: {
    access: 14, // Column O: "Teleport Access"
    accountType: 15, // Column P: "Teleport Account Type"
    accountStatus: 16, // Column Q: "Teleport Account Status"
    accessLevel: 17, // Column R: "Teleport Access Level"
    groups: 18, // Column S: "Teleport Groups"
  },
  uc_sbc: {
    access: 19, // Column T: "UC SBC Branch 1 iBMC Access"
    accountType: 20, // Column U: "UC SBC Branch 1 iBMC Account Type"
  },
  radius: {
    access: 21, // Column V: "RADIUS Access"
    accountType: 22, // Column W: "RADIUS Account TypeRADIUS"
    accountStatus: 23, // Column X: " Account Status"
    accessLevel: 24, // Column Y: "RADIUS Access Level"
    groups: 25, // Column Z: "RADIUS Groups"
  },
  unifi: {
    access: 26, // Column AA: "Unifi Network Access"
    accountType: 27, // Column AB: "Unifi Network Account Type"
    accountStatus: 28, // Column AC: "Unifi Network Account Status"
    accessLevel: 29, // Column AD: "Unifi Network access Level"
  },
  noc_services: {
    access: 31, // Column AF: "NOC Services"
  },
  itop: {
    access: 32, // Column AG: "ITop Acess"
    accountStatus: 33, // Column AH: "ITop Account Status"
    accountType: 34, // Column AI: "ITop Acconut type"
    accessLevel: 35, // Column AJ: "Itop Acess Level"
  },
  zabbix: {
    access: 36, // Column AK: "Zabbix Access"
    accountStatus: 37, // Column AL: "Zabbix Access Status"
    accountType: 38, // Column AM: "Zabbix Account Type"
    accessLevel: 39, // Column AN: "Zabbix Access Level"
  },
  eightsight: {
    access: 40, // Column AO: "Eight Sight Access"
    accountStatus: 41, // Column AP: "Eight Sight Account Status"
    accountType: 42, // Column AQ: "Eight Sight Account Type"
    accessLevel: 43, // Column AR: "Eight Sight Access Level"
  },
  kibana: {
    access: 44, // Column AS: "Kibana Access"
    accountStatus: 45, // Column AT: "Kibbanat Account Status"
    accountType: 46, // Column AU: "Kibbanat Account Type"
    accessLevel: 47, // Column AV: "Kibana Access Level"
  },
  ivs_neteco: {
    access: 48, // Column AW: "IVS NetEco Access"
    accountStatus: 49, // Column AX: "IVS NetEco Account Status"
    accountType: 50, // Column AY: "IVS NetEco Account Type"
    accessLevel: 51, // Column AZ: "IVS NetEco Access Level"
  },
  neteco: {
    access: 52, // Column BA: " NetEco Access"
    accountStatus: 53, // Column BB: "INetEco Account Status"
    accountType: 54, // Column BC: " NetEco Account Type"
    accessLevel: 55, // Column BD: " NetEco Access Level"
  },
  lte_grafana: {
    access: 56, // Column BE: "LTE Grafana Access"
    accountStatus: 57, // Column BF: "LTE Grafana Account Status"
    accountType: 58, // Column BG: "LTE GrafanaAccount Type"
    accessLevel: 59, // Column BH: "LTE Grafana Access Level"
  },
  generator_grafana: {
    access: 60, // Column BI: "Generator Grafana Access"
    accountStatus: 61, // Column BJ: "Generator Grafana Account Status"
    accountType: 62, // Column BK: "Generator Grafana Account Type"
    accessLevel: 63, // Column BL: "Generator Grafana Access Level"
  },
  nce_fan_atp: {
    access: 64, // Column BM: "NCE-FAN ATP Access"
    accountStatus: 65, // Column BN: "NCE-FAN ATP Account Status"
    accountType: 66, // Column BO: "NCE-FAN ATP Account Type"
    accessLevel: 67, // Column BP: "NCE-FAN ATP Access Level"
  },
  esight_srv2: {
    access: 68, // Column BQ: "eSight-SRV-2 Access"
    accountStatus: 69, // Column BR: "eSight-SRV-2 Account Status"
    accountType: 70, // Column BS: "eSight-SRV-2 Account Type"
    accessLevel: 71, // Column BT: "eSight-SRV-2 Access Level"
  },
};

// VPN column mapping from VPN sheet
export const VPN_COLUMN_MAPPING = {
  mikrotik: {
    access: 4, // Column E: "Mikrotik VPN Access"
    accountType: 5, // Column F: "Mikrotik VPN Account Type"
    accountStatus: 6, // Column G: "Mikrotik VPN Account Status"
    groups: 7, // Column H: "Mikrotik VPN Groups"
  },
  fortigate: {
    access: 9, // Column J: "Fortigate VPN Access"
    accountType: 10, // Column K: "Fortigate VPN Account Type"
    accountStatus: 11, // Column L: "Fortigate VPN Account Status"
    groups: 12, // Column M: "Fortigate VPN Groups"
  },
};

// Department name mapping (handle variations)
export const DEPARTMENT_MAPPING = {
  'Secretariat': 'Secretariat',
  'Corporate & Social Responsibility Unit': 'Corporate & Social Responsibility Unit',
  'Cybersecurity': 'Cybersecurity',
  'eServices': 'eServices',
  'Infrastructure-Data Communication': 'Infrastructure-Data Communication',
  'Cloud Service': 'Cloud Service',
  'Data Centre': 'Data Centre',
  'Hinterland & Remote Connectivity': 'Hinterland & Remote Connectivity',
  'Power & Environment': 'Power & Environment',
  'Operations': 'Operations',
  'Project Management Unit': 'Project Management Unit',
  'Finance & Admin. Services': 'Finance & Admin. Services',
  'Accounts': 'Accounts',
  'Procurement': 'Procurement',
  'Human Resources': 'Human Resources',
  'Temporary Staff': 'Temporary Staff',
  'LTE Grafana Unit': 'LTE Grafana Unit',
  'eSight-SRV-2 Operations': 'eSight-SRV-2 Operations',
};

// Interfaces for type safety
interface SpreadsheetUser {
  serialNo: number;
  name: string;
  employmentStatus: string;
  username: string;
  // Services will be mapped dynamically
  [key: string]: any;
}

interface DatabaseUser {
  serial_number: number;
  name: string;
  username: string;
  employment_status: string;
  department_id?: number;
  position?: string;
  hire_date?: Date;
  service_access: ServiceAccess[];
  vpn_access: VpnAccess[];
  biometric_access?: BiometricAccess;
}

interface ServiceAccess {
  service_name: string;
  has_access: boolean;
  account_type?: string;
  account_status?: string;
  access_level?: string;
  groups?: string[];
}

interface VpnAccess {
  vpn_type: 'Mikrotik' | 'FortiGate';
  has_access: boolean;
  account_type?: string;
  account_status?: string;
  groups?: string[];
}

interface BiometricAccess {
  has_access: boolean;
  registration_status: string;
  location: string;
}

/**
 * Parses a single row from the Services sheet
 */
export function parseServicesRow(row: any[], headers: string[]): SpreadsheetUser | null {
  // Skip header rows and empty rows
  if (!row || row.length < 4 || !row[1] || typeof row[1] !== 'string') {
    return null;
  }

  // Skip department header rows (they don't have serial numbers)
  if (typeof row[0] !== 'number') {
    return null;
  }

  return {
    serialNo: row[0] as number,
    name: (row[1] as string).trim(),
    employmentStatus: row[2] ? (row[2] as string).trim() : 'Unknown',
    username: row[3] ? (row[3] as string).trim() : '',
    rawRow: row, // Keep original for debugging
  };
}

/**
 * Extracts service access from spreadsheet row
 */
export function extractServiceAccess(row: any[], serviceName: string): ServiceAccess | null {
  const mapping = SERVICE_COLUMN_MAPPING[serviceName as keyof typeof SERVICE_COLUMN_MAPPING];
  if (!mapping) return null;

  const access = row[mapping.access];
  const hasAccess = access === 'Yes' || access === 'yes' || access === 'Y';

  if (!hasAccess) return null;

  return {
    service_name: serviceName,
    has_access: true,
    account_type: mapping.accountType ? cleanString(row[mapping.accountType]) : undefined,
    account_status: mapping.accountStatus ? cleanString(row[mapping.accountStatus]) : undefined,
    access_level: mapping.accessLevel ? cleanString(row[mapping.accessLevel]) : undefined,
    groups: mapping.groups ? parseGroups(row[mapping.groups]) : undefined,
  };
}

/**
 * Extracts VPN access from VPN sheet row
 */
export function extractVpnAccess(row: any[], vpnType: 'mikrotik' | 'fortigate'): VpnAccess | null {
  const mapping = VPN_COLUMN_MAPPING[vpnType];
  if (!mapping) return null;

  const access = row[mapping.access];
  const hasAccess = access === 'Yes' || access === 'yes' || access === 'Y';

  if (!hasAccess) return null;

  return {
    vpn_type: vpnType === 'mikrotik' ? 'Mikrotik' : 'FortiGate',
    has_access: true,
    account_type: mapping.accountType ? cleanString(row[mapping.accountType]) : undefined,
    account_status: mapping.accountStatus ? cleanString(row[mapping.accountStatus]) : undefined,
    groups: mapping.groups ? parseGroups(row[mapping.groups]) : undefined,
  };
}

/**
 * Processes complete spreadsheet data into database format
 */
export function processSpreadsheetData(
  servicesData: any[][],
  vpnData: any[][],
  employeeData: any[][],
  biometricsData: any[][]
): DatabaseUser[] {
  const users: DatabaseUser[] = [];
  
  // Create employee lookup from Employee Data sheet
  const employeeLookup = new Map<string, any>();
  if (employeeData && employeeData.length > 2) {
    for (let i = 2; i < employeeData.length; i++) {
      const row = employeeData[i];
      if (row && row[1]) {
        employeeLookup.set(row[1].toString().trim(), {
          position: row[2] ? row[2].toString().trim() : undefined,
          hire_date: row[3] ? parseDate(row[3]) : undefined,
        });
      }
    }
  }

  // Create biometrics lookup
  const biometricsLookup = new Map<string, BiometricAccess>();
  if (biometricsData && biometricsData.length > 2) {
    for (let i = 2; i < biometricsData.length; i++) {
      const row = biometricsData[i];
      if (row && row[1]) {
        const registered = row[3] && (row[3].toString().toLowerCase() === 'x' || row[3].toString().toLowerCase() === 'registered');
        biometricsLookup.set(row[1].toString().trim(), {
          has_access: registered,
          registration_status: registered ? 'Registered' : 'Not Registered',
          location: 'Data Centre',
        });
      }
    }
  }

  // Process Services sheet (main data)
  if (servicesData && servicesData.length > 2) {
    for (let i = 2; i < servicesData.length; i++) {
      const spreadsheetUser = parseServicesRow(servicesData[i], servicesData[0]);
      if (!spreadsheetUser) continue;

      // Extract service access for all services
      const serviceAccess: ServiceAccess[] = [];
      for (const serviceName of Object.keys(SERVICE_COLUMN_MAPPING)) {
        const access = extractServiceAccess(servicesData[i], serviceName);
        if (access) {
          serviceAccess.push(access);
        }
      }

      // Get employee details
      const employeeDetails = employeeLookup.get(spreadsheetUser.name);

      // Create database user
      const dbUser: DatabaseUser = {
        serial_number: spreadsheetUser.serialNo,
        name: spreadsheetUser.name,
        username: spreadsheetUser.username || generateUsername(spreadsheetUser.name),
        employment_status: normalizeEmploymentStatus(spreadsheetUser.employmentStatus),
        position: employeeDetails?.position,
        hire_date: employeeDetails?.hire_date,
        service_access: serviceAccess,
        vpn_access: [],
        biometric_access: biometricsLookup.get(spreadsheetUser.name),
      };

      users.push(dbUser);
    }
  }

  // Add VPN data
  if (vpnData && vpnData.length > 2) {
    for (let i = 2; i < vpnData.length; i++) {
      const row = vpnData[i];
      if (!row || !row[1]) continue;

      const name = row[1].toString().trim();
      const user = users.find(u => u.name === name);
      if (!user) continue;

      // Check Mikrotik VPN
      const mikrotikAccess = extractVpnAccess(row, 'mikrotik');
      if (mikrotikAccess) {
        user.vpn_access.push(mikrotikAccess);
      }

      // Check FortiGate VPN
      const fortigateAccess = extractVpnAccess(row, 'fortigate');
      if (fortigateAccess) {
        user.vpn_access.push(fortigateAccess);
      }
    }
  }

  return users;
}

/**
 * Utility functions
 */
function cleanString(value: any): string | undefined {
  if (!value) return undefined;
  const cleaned = value.toString().trim();
  return cleaned === '' ? undefined : cleaned;
}

function parseGroups(value: any): string[] | undefined {
  if (!value) return undefined;
  const str = value.toString().trim();
  if (str === '') return undefined;
  
  // Split by common delimiters
  return str.split(/[,;|]/).map(g => g.trim()).filter(g => g.length > 0);
}

function normalizeEmploymentStatus(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (normalized.includes('active')) return 'Active';
  if (normalized.includes('dormant')) return 'Dormant';
  if (normalized.includes('leave')) return 'On Leave';
  return status; // Return original if no match
}

function generateUsername(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z ]/g, '')
    .split(' ')
    .join('.');
}

function parseDate(value: any): Date | undefined {
  if (!value) return undefined;
  
  const str = value.toString();
  
  // Try parsing Excel date format (YYYY.MM.DD)
  if (str.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
    const [year, month, day] = str.split('.').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Try standard date parsing
  const date = new Date(str);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * SQL generation for database import
 */
export function generateUserInsertSQL(users: DatabaseUser[]): string {
  let sql = `-- ESM Platform User Data Import
-- Generated from spreadsheet: ${new Date().toISOString()}
-- Total users: ${users.length}

`;

  for (const user of users) {
    // Insert user
    sql += `-- User: ${user.name}\n`;
    sql += `INSERT INTO users (serial_number, name, username, employment_status, position, hire_date, active) VALUES\n`;
    sql += `  (${user.serial_number}, '${escapeSql(user.name)}', '${escapeSql(user.username)}', '${user.employment_status}', `;
    sql += user.position ? `'${escapeSql(user.position)}'` : 'NULL';
    sql += `, `;
    sql += user.hire_date ? `'${user.hire_date.toISOString().split('T')[0]}'` : 'NULL';
    sql += `, true);\n\n`;

    // Insert service access
    if (user.service_access.length > 0) {
      for (const access of user.service_access) {
        sql += `INSERT INTO user_service_access (user_id, service_id, has_access, account_type, account_status, access_level, groups) \n`;
        sql += `SELECT u.id, s.id, true, `;
        sql += access.account_type ? `'${escapeSql(access.account_type)}'` : 'NULL';
        sql += `, `;
        sql += access.account_status ? `'${escapeSql(access.account_status)}'` : 'NULL';
        sql += `, `;
        sql += access.access_level ? `'${escapeSql(access.access_level)}'` : 'NULL';
        sql += `, `;
        sql += access.groups ? `ARRAY[${access.groups.map(g => `'${escapeSql(g)}'`).join(', ')}]` : 'ARRAY[]::TEXT[]';
        sql += `\nFROM users u, services s WHERE u.username = '${escapeSql(user.username)}' AND s.name = '${access.service_name}';\n`;
      }
      sql += `\n`;
    }

    // Insert VPN access
    if (user.vpn_access.length > 0) {
      for (const vpn of user.vpn_access) {
        sql += `INSERT INTO vpn_access (user_id, vpn_type, has_access, account_type, account_status, groups)\n`;
        sql += `SELECT u.id, '${vpn.vpn_type}', true, `;
        sql += vpn.account_type ? `'${escapeSql(vpn.account_type)}'` : 'NULL';
        sql += `, `;
        sql += vpn.account_status ? `'${escapeSql(vpn.account_status)}'` : 'NULL';
        sql += `, `;
        sql += vpn.groups ? `ARRAY[${vpn.groups.map(g => `'${escapeSql(g)}'`).join(', ')}]` : 'ARRAY[]::TEXT[]';
        sql += `\nFROM users u WHERE u.username = '${escapeSql(user.username)}';\n`;
      }
      sql += `\n`;
    }

    // Insert biometric access
    if (user.biometric_access) {
      sql += `INSERT INTO biometric_access (user_id, has_access, registration_status, location)\n`;
      sql += `SELECT u.id, ${user.biometric_access.has_access}, '${user.biometric_access.registration_status}', '${user.biometric_access.location}'\n`;
      sql += `FROM users u WHERE u.username = '${escapeSql(user.username)}';\n\n`;
    }
  }

  return sql;
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Migration validation functions
 */
export function validateMigrationData(users: DatabaseUser[]): string[] {
  const errors: string[] = [];
  const usernames = new Set<string>();
  const serialNumbers = new Set<number>();

  for (const user of users) {
    // Check for required fields
    if (!user.name || user.name.trim() === '') {
      errors.push(`User with serial ${user.serial_number}: Missing name`);
    }

    if (!user.username || user.username.trim() === '') {
      errors.push(`User ${user.name}: Missing username`);
    }

    // Check for duplicates
    if (usernames.has(user.username)) {
      errors.push(`Duplicate username: ${user.username}`);
    }
    usernames.add(user.username);

    if (serialNumbers.has(user.serial_number)) {
      errors.push(`Duplicate serial number: ${user.serial_number}`);
    }
    serialNumbers.add(user.serial_number);

    // Validate service access
    for (const access of user.service_access) {
      if (!Object.keys(SERVICE_COLUMN_MAPPING).includes(access.service_name)) {
        errors.push(`User ${user.name}: Unknown service ${access.service_name}`);
      }
    }
  }

  return errors;
}

export function generateMigrationReport(users: DatabaseUser[]): string {
  const report = [];
  
  report.push(`ESM Platform Migration Report`);
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push(`Total Users: ${users.length}`);
  report.push('');

  // Employment status breakdown
  const statusCounts = users.reduce((acc, user) => {
    acc[user.employment_status] = (acc[user.employment_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  report.push(`Employment Status Breakdown:`);
  for (const [status, count] of Object.entries(statusCounts)) {
    report.push(`  ${status}: ${count}`);
  }
  report.push('');

  // Service access summary
  const serviceStats = {} as Record<string, number>;
  for (const user of users) {
    for (const access of user.service_access) {
      serviceStats[access.service_name] = (serviceStats[access.service_name] || 0) + 1;
    }
  }

  report.push(`Service Access Summary:`);
  for (const [service, count] of Object.entries(serviceStats).sort(([,a], [,b]) => b - a)) {
    report.push(`  ${service}: ${count} users`);
  }
  report.push('');

  // VPN access summary
  const vpnStats = { Mikrotik: 0, FortiGate: 0 };
  for (const user of users) {
    for (const vpn of user.vpn_access) {
      vpnStats[vpn.vpn_type]++;
    }
  }

  report.push(`VPN Access Summary:`);
  report.push(`  Mikrotik: ${vpnStats.Mikrotik} users`);
  report.push(`  FortiGate: ${vpnStats.FortiGate} users`);
  report.push('');

  // Biometric access summary
  const biometricCount = users.filter(u => u.biometric_access?.has_access).length;
  report.push(`Biometric Access: ${biometricCount} users`);

  return report.join('\n');
}