#!/usr/bin/env node
/**
 * ESM Platform Database Password Discovery & Setup
 * Tries multiple authentication methods and passwords
 */

const { Pool } = require('pg');

// Common PostgreSQL passwords to try
const commonPasswords = [
  'postgres',
  'admin',
  'password',
  'root',
  '123456',
  '1234',
  '',  // Empty password
  'letmein'
];

async function tryConnection(password, description) {
  const config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres',
    connectionTimeoutMillis: 3000
  };
  
  const pool = new Pool(config);
  
  try {
    console.log(`🔍 Trying: ${description}`);
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    await pool.end();
    
    console.log(`✅ SUCCESS! Password found: "${password}"`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    return password;
  } catch (error) {
    console.log(`❌ Failed: ${error.code === '28P01' ? 'Wrong password' : error.message}`);
    await pool.end();
    return null;
  }
}

async function discoverPassword() {
  console.log('🔐 PostgreSQL Password Discovery');
  console.log('===============================\n');
  
  // Try each common password
  for (let i = 0; i < commonPasswords.length; i++) {
    const password = commonPasswords[i];
    const description = password === '' ? 'Empty password' : `"${password}"`;
    
    const success = await tryConnection(password, description);
    if (success !== null) {
      return success;
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n❌ No common passwords worked');
  console.log('\n💡 To reset PostgreSQL password:');
  console.log('1. Open Command Prompt as Administrator');
  console.log('2. Stop PostgreSQL: net stop postgresql-x64-17');
  console.log('3. Start in single-user mode with trust auth');
  console.log('4. Reset password with: ALTER USER postgres PASSWORD \'newpassword\';');
  console.log('5. Restart service: net start postgresql-x64-17');
  
  return null;
}

async function main() {
  const workingPassword = await discoverPassword();
  
  if (workingPassword !== null) {
    // Update .env.local with working password
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env.local');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(
        /DB_PASSWORD=.*/,
        `DB_PASSWORD=${workingPassword}`
      );
      envContent = envContent.replace(
        /DATABASE_URL="postgresql:\/\/postgres:.*@/,
        `DATABASE_URL="postgresql://postgres:${workingPassword}@`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log(`\n✅ Updated .env.local with working password`);
      console.log(`\n🚀 Now run: node setup-database.js`);
    } catch (error) {
      console.log(`\n⚠️ Couldn't update .env.local: ${error.message}`);
      console.log(`\nManually update DB_PASSWORD to: ${workingPassword}`);
    }
  }
}

if (require.main === module) {
  main();
}
