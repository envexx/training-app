import bcrypt from 'bcrypt';
import pool from '../config/database.js';

/**
 * Script to create default admin user
 * Run this after database migration: node src/database/create-admin.js
 */

async function createAdmin() {
  try {
    console.log('🔄 Creating default admin user...');

    // Get admin role
    const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
    
    if (roleResult.rows.length === 0) {
      console.error('❌ Admin role not found. Please run migration first.');
      process.exit(1);
    }

    const roleId = roleResult.rows[0].id;

    // Check if admin user exists
    const existingUser = await pool.query("SELECT id FROM users WHERE username = 'admin'");
    
    if (existingUser.rows.length > 0) {
      console.log('ℹ️  Admin user already exists.');
      process.exit(0);
    }

    // Hash password (default: admin123)
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    await pool.query(
      `INSERT INTO users (username, password_hash, email, full_name, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', passwordHash, 'admin@training.app', 'System Administrator', roleId]
    );

    console.log('✅ Default admin user created successfully!');
    console.log('📝 Username: admin');
    console.log('🔑 Password: admin123 (PLEASE CHANGE AFTER FIRST LOGIN!)');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();

