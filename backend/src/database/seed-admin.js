/**
 * Seeder untuk membuat admin user
 * 
 * Usage:
 *   node src/database/seed-admin.js
 * 
 * Environment Variables (optional):
 *   ADMIN_USERNAME - default: admin
 *   ADMIN_PASSWORD - default: admin123
 *   ADMIN_EMAIL - default: admin@training.app
 *   ADMIN_FULL_NAME - default: System Administrator
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../config/database.js';

// Load environment variables
dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@training.app';
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'System Administrator';

async function seedAdmin() {
  let client;
  
  try {
    console.log('🌱 Starting admin seeder...\n');

    // Get database connection
    client = await pool.connect();
    console.log('✅ Database connected');

    // Step 1: Check if roles table exists and create admin role if not exists
    console.log('\n📋 Step 1: Checking roles table...');
    const roleCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);

    if (!roleCheck.rows[0].exists) {
      console.log('⚠️  Roles table does not exist. Creating...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          permissions JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Roles table created');
    }

    // Step 2: Create admin role if not exists
    console.log('\n📋 Step 2: Checking admin role...');
    let roleResult = await client.query("SELECT id FROM roles WHERE name = 'admin'");
    
    let roleId;
    if (roleResult.rows.length === 0) {
      console.log('⚠️  Admin role not found. Creating...');
      const insertRole = await client.query(
        `INSERT INTO roles (name, description, permissions)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          'admin',
          'System Administrator with full access',
          JSON.stringify({ all: true })
        ]
      );
      roleId = insertRole.rows[0].id;
      console.log('✅ Admin role created');
    } else {
      roleId = roleResult.rows[0].id;
      console.log('✅ Admin role already exists');
    }

    // Step 3: Check if users table exists
    console.log('\n📋 Step 3: Checking users table...');
    const userTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!userTableCheck.rows[0].exists) {
      console.log('⚠️  Users table does not exist. Creating...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          full_name VARCHAR(255),
          role_id UUID,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
        );
      `);
      console.log('✅ Users table created');
    }

    // Step 4: Check if admin user exists
    console.log('\n📋 Step 4: Checking admin user...');
    const existingUser = await client.query(
      "SELECT id, username FROM users WHERE username = $1",
      [ADMIN_USERNAME]
    );
    
    if (existingUser.rows.length > 0) {
      console.log(`ℹ️  Admin user "${ADMIN_USERNAME}" already exists.`);
      console.log('   To update password, delete the user first or use update script.');
      process.exit(0);
    }

    // Step 5: Create admin user
    console.log('\n📋 Step 5: Creating admin user...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const insertUser = await client.query(
      `INSERT INTO users (username, password_hash, email, full_name, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, full_name`,
      [ADMIN_USERNAME, passwordHash, ADMIN_EMAIL, ADMIN_FULL_NAME, roleId, true]
    );

    const newUser = insertUser.rows[0];
    
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Login Credentials:');
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Full Name: ${newUser.full_name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('✅ Seeder completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding admin user:');
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run seeder
seedAdmin();

