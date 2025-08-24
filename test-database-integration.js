#!/usr/bin/env node
/**
 * ESM Platform Database Integration Test
 * Verifies database connection and services are working
 */

const { initializeDatabase, checkDatabaseHealth, query } = require('./lib/database.ts');

async function testDatabaseIntegration() {
  console.log('🧪 ESM Platform Database Integration Test');
  console.log('=========================================\n');

  try {
    // Test 1: Database connection and health
    console.log('1️⃣ Testing database connection...');
    const health = await checkDatabaseHealth();
    
    if (health.connected) {
      console.log(`✅ Database connected successfully`);
      console.log(`   PostgreSQL: ${health.version}`);
      console.log(`   Latency: ${health.latency}ms`);
    } else {
      throw new Error(`Database connection failed: ${health.error}`);
    }

    // Test 2: Verify tables exist
    console.log('\n2️⃣ Verifying database schema...');
    const tables = await query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   📋 ${table.table_name} (${table.column_count} columns)`);
    });

    // Test 3: Check initial data
    console.log('\n3️⃣ Checking initial data...');
    
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const serviceCount = await query('SELECT COUNT(*) as count FROM services');
    const deptCount = await query('SELECT COUNT(*) as count FROM departments');
    
    console.log(`✅ Data verification:`);
    console.log(`   👥 Users: ${userCount[0].count}`);
    console.log(`   🔧 Services: ${serviceCount[0].count}`);
    console.log(`   🏢 Departments: ${deptCount[0].count}`);

    // Test 4: Services data detail
    console.log('\n4️⃣ Checking services configuration...');
    const services = await query(`
      SELECT name, display_name, category, array_length(auth_methods, 1) as auth_count
      FROM services 
      ORDER BY name
      LIMIT 5
    `);
    
    console.log(`✅ Sample services configuration:`);
    services.forEach(service => {
      console.log(`   🔧 ${service.display_name} (${service.category}) - ${service.auth_count || 0} auth methods`);
    });

    // Test 5: Departments data
    console.log('\n5️⃣ Checking departments...');
    const departments = await query(`
      SELECT name FROM departments WHERE active = true ORDER BY name LIMIT 5
    `);
    
    console.log(`✅ Sample departments:`);
    departments.forEach(dept => {
      console.log(`   🏢 ${dept.name}`);
    });

    console.log('\n🎉 All database integration tests passed!');
    console.log('\n✅ Ready for:');
    console.log('   • Application development with real data');
    console.log('   • Spreadsheet data migration');
    console.log('   • User interface testing');
    console.log('   • Production deployment preparation');

    return true;

  } catch (error) {
    console.error('\n❌ Database integration test failed:', error.message);
    return false;
  }
}

async function main() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const success = await testDatabaseIntegration();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { testDatabaseIntegration };
