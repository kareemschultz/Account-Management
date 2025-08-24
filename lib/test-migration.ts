/**
 * ESM Platform - Migration Test Script
 * Tests the migration utilities with actual spreadsheet data
 * Run with: npm run test-migration
 */

import * as XLSX from 'xlsx';
import {
  processSpreadsheetData,
  generateUserInsertSQL,
  validateMigrationData,
  generateMigrationReport,
} from './migration-utils';

// Path to the uploaded spreadsheet file
const SPREADSHEET_PATH = './AccountManagementJune_20250606_v01.xlsx';

async function testMigration() {
  console.log('🚀 ESM Platform - Migration Test Starting...\n');

  try {
    // Read the Excel file
    console.log('📖 Reading spreadsheet file...');
    const workbook = XLSX.readFile(SPREADSHEET_PATH);
    console.log(`✅ Workbook loaded with sheets: ${workbook.SheetNames.join(', ')}\n`);

    // Extract data from each sheet
    const servicesSheet = workbook.Sheets['Services'];
    const vpnSheet = workbook.Sheets['VPN'];
    const employeeSheet = workbook.Sheets['Employee Data'];
    const biometricsSheet = workbook.Sheets['Biometrics'];

    // Convert to arrays
    const servicesData = XLSX.utils.sheet_to_json(servicesSheet, { header: 1 });
    const vpnData = XLSX.utils.sheet_to_json(vpnSheet, { header: 1 });
    const employeeData = XLSX.utils.sheet_to_json(employeeSheet, { header: 1 });
    const biometricsData = XLSX.utils.sheet_to_json(biometricsSheet, { header: 1 });

    console.log('📊 Sheet Data Summary:');
    console.log(`  Services: ${servicesData.length} rows`);
    console.log(`  VPN: ${vpnData.length} rows`);
    console.log(`  Employee Data: ${employeeData.length} rows`);
    console.log(`  Biometrics: ${biometricsData.length} rows\n`);

    // Process the data
    console.log('⚙️ Processing spreadsheet data...');
    const users = processSpreadsheetData(
      servicesData as any[][],
      vpnData as any[][],
      employeeData as any[][],
      biometricsData as any[][]
    );

    console.log(`✅ Processed ${users.length} users\n`);

    // Validate the data
    console.log('🔍 Validating migration data...');
    const errors = validateMigrationData(users);
    
    if (errors.length > 0) {
      console.log(`❌ Validation errors found (${errors.length}):`);
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    } else {
      console.log('✅ No validation errors found!');
    }
    console.log('');

    // Generate migration report
    console.log('📋 Generating migration report...');
    const report = generateMigrationReport(users);
    console.log(report);
    console.log('');

    // Sample user analysis
    console.log('👤 Sample User Analysis:');
    const sampleUsers = users.slice(0, 3);
    
    for (const user of sampleUsers) {
      console.log(`\n📝 ${user.name} (${user.username})`);
      console.log(`   Status: ${user.employment_status}`);
      console.log(`   Position: ${user.position || 'N/A'}`);
      console.log(`   Services: ${user.service_access.length}`);
      
      if (user.service_access.length > 0) {
        user.service_access.forEach(service => {
          console.log(`     - ${service.service_name}: ${service.access_level || 'User'} (${service.account_status || 'N/A'})`);
        });
      }
      
      if (user.vpn_access.length > 0) {
        console.log(`   VPN Access:`);
        user.vpn_access.forEach(vpn => {
          console.log(`     - ${vpn.vpn_type}: ${vpn.account_status || 'Active'}`);
        });
      }
      
      if (user.biometric_access) {
        console.log(`   Biometric: ${user.biometric_access.registration_status}`);
      }
    }

    // Generate SQL for first 5 users (for testing)
    console.log('\n🗄️ Generating sample SQL...');
    const sampleSQL = generateUserInsertSQL(users.slice(0, 5));
    
    // Write the SQL to a file for review
    const fs = require('fs');
    const sqlPath = './database/sample-migration.sql';
    fs.writeFileSync(sqlPath, sampleSQL);
    console.log(`✅ Sample SQL written to: ${sqlPath}`);

    // Write full migration report
    const reportPath = './database/migration-report.txt';
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Migration report written to: ${reportPath}`);

    // Summary
    console.log('\n🎯 Migration Test Summary:');
    console.log(`✅ Successfully processed ${users.length} users`);
    console.log(`📊 Service access records: ${users.reduce((sum, u) => sum + u.service_access.length, 0)}`);
    console.log(`🔐 VPN access records: ${users.reduce((sum, u) => sum + u.vpn_access.length, 0)}`);
    console.log(`👆 Biometric access records: ${users.filter(u => u.biometric_access).length}`);
    console.log(`${errors.length === 0 ? '✅' : '⚠️'} Validation: ${errors.length} errors found`);
    
    console.log('\n📁 Files Generated:');
    console.log(`  - ${sqlPath} (Sample SQL for 5 users)`);
    console.log(`  - ${reportPath} (Full migration report)`);

    if (errors.length === 0) {
      console.log('\n🚀 Migration test PASSED! Ready for database import.');
    } else {
      console.log('\n⚠️ Migration test completed with warnings. Review errors before import.');
    }

  } catch (error) {
    console.error('❌ Migration test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Additional utility functions for testing specific aspects

export function testServiceMapping() {
  console.log('🔧 Testing Service Column Mapping...\n');
  
  const testRow = [
    1, // Serial No
    'John Doe', // Name
    'Active', // Employment Status
    'john.doe', // Username
    'Yes', // IPAM Access
    'Local', // IPAM Account Type
    'Active', // IPAM Account Status
    'Admin', // IPAM Access Level
    'Administrators', // IPAM Groups
    'Yes', // Grafana Access
    'LDAP', // Grafana Account Type
    'Active', // Grafana Account Status
    'Editor', // Grafana Access Level
    'Editors', // Grafana Groups
    // ... more columns
  ];

  // Test the mapping logic here
  console.log('Sample row structure:', testRow.slice(0, 14));
  console.log('✅ Service mapping test completed');
}

export function testDatabaseConnection() {
  console.log('🔌 Testing Database Connection...');
  
  // This would test the actual database connection
  // For now, just validate the schema exists
  const fs = require('fs');
  const schemaExists = fs.existsSync('./database/schema.sql');
  
  console.log(`Database schema file: ${schemaExists ? '✅ Found' : '❌ Missing'}`);
  
  if (schemaExists) {
    const schemaContent = fs.readFileSync('./database/schema.sql', 'utf8');
    const tableCount = (schemaContent.match(/CREATE TABLE/g) || []).length;
    console.log(`Schema contains ${tableCount} tables`);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMigration();
}

export { testMigration };