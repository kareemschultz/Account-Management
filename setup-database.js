#!/usr/bin/env node
/**
 * ESM Platform Database Setup Script
 * Handles database creation, schema deployment, and initial data setup
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Database configuration with fallbacks
const adminConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: 'postgres', // Default admin user
  password: process.env.DB_PASSWORD || 'admin',
  database: 'postgres' // Connect to default database first
};

const appConfig = {
  ...adminConfig,
  database: process.env.DB_NAME || 'esm_platform'
};

console.log('🚀 ESM Platform Database Setup');
console.log('================================');

async function testConnection(config, name) {
  console.log(`\n🔌 Testing ${name} connection...`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    await pool.end();
    
    console.log(`✅ ${name} connection successful`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} connection failed: ${error.message}`);
    if (error.code === '28P01') {
      console.log('   Hint: Check password authentication');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Hint: Check if PostgreSQL service is running');
    }
    await pool.end();
    return false;
  }
}

async function databaseExists(dbName) {
  const pool = new Pool(adminConfig);
  
  try {
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    await pool.end();
    return result.rows.length > 0;
  } catch (error) {
    await pool.end();
    throw error;
  }
}

async function createDatabase(dbName) {
  console.log(`\n🏗️ Creating database: ${dbName}`);
  
  const pool = new Pool(adminConfig);
  
  try {
    await pool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Database "${dbName}" created successfully`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️ Database "${dbName}" already exists`);
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

async function deploySchema() {
  console.log('\n📋 Deploying database schema...');
  
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const pool = new Pool(appConfig);
  
  try {
    await pool.query(schema);
    console.log('✅ Schema deployed successfully');
    
    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Created ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...');
  
  const pool = new Pool(appConfig);
  
  try {
    // Check essential tables
    const requiredTables = ['users', 'services', 'departments', 'user_service_access'];
    
    for (const table of requiredTables) {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      
      if (result.rows[0].count === '0') {
        throw new Error(`Required table missing: ${table}`);
      }
    }
    
    console.log('✅ All required tables present');
    
    // Check sample data
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const serviceCount = await pool.query('SELECT COUNT(*) as count FROM services');
    const deptCount = await pool.query('SELECT COUNT(*) as count FROM departments');
    
    console.log(`📊 Database contents:`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Services: ${serviceCount.rows[0].count}`);
    console.log(`   Departments: ${deptCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    // Step 1: Test admin connection
    const adminConnected = await testConnection(adminConfig, 'Admin');
    if (!adminConnected) {
      console.log('\n❌ Cannot connect to PostgreSQL as admin user');
      console.log('Please check:');
      console.log('1. PostgreSQL service is running');
      console.log('2. Password is correct (current: "admin")');
      console.log('3. User "postgres" exists and has proper permissions');
      process.exit(1);
    }
    
    // Step 2: Create database if needed
    const dbName = process.env.DB_NAME || 'esm_platform';
    const exists = await databaseExists(dbName);
    
    if (!exists) {
      await createDatabase(dbName);
    } else {
      console.log(`\nℹ️ Database "${dbName}" already exists`);
    }
    
    // Step 3: Test application database connection
    const appConnected = await testConnection(appConfig, 'Application');
    if (!appConnected) {
      process.exit(1);
    }
    
    // Step 4: Deploy schema
    await deploySchema();
    
    // Step 5: Verify setup
    await verifySetup();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test migration: node lib/migration-test.js');
    console.log('3. Import spreadsheet data');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = { testConnection, createDatabase, deploySchema, verifySetup };
