#!/usr/bin/env node

/**
 * Migration Script
 * Menjalankan migration SQL files dari folder migrations/
 * 
 * Usage: npm run migrate
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = join(__dirname, '..', 'migrations');

// Table to track migrations
const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migrations table ready');
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

async function getExecutedMigrations() {
  try {
    const result = await pool.query(`SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY executed_at`);
    return result.rows.map(row => row.filename);
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    throw error;
  }
}

async function markMigrationAsExecuted(filename) {
  try {
    await pool.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
      [filename]
    );
  } catch (error) {
    console.error('Error marking migration as executed:', error);
    throw error;
  }
}

async function runMigration(filename) {
  const filePath = join(migrationsDir, filename);
  
  try {
    console.log(`\n📄 Running migration: ${filename}`);
    const sql = readFileSync(filePath, 'utf8');
    
    // Split SQL by semicolon and execute each statement
    // Filter out comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Remove comments (lines starting with --)
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        });
        return lines.length > 0;
      });
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    await markMigrationAsExecuted(filename);
    console.log(`✓ Migration ${filename} executed successfully`);
  } catch (error) {
    console.error(`✗ Error running migration ${filename}:`, error.message);
    console.error('Full error:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get all migration files
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically to ensure order
    
    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    console.log(`Found ${files.length} migration file(s)\n`);
    
    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Run pending migrations
    let executedCount = 0;
    for (const file of files) {
      if (!executedMigrations.includes(file)) {
        await runMigration(file);
        executedCount++;
      } else {
        console.log(`⏭️  Skipping ${file} (already executed)`);
      }
    }
    
    if (executedCount === 0) {
      console.log('\n✓ All migrations are up to date');
    } else {
      console.log(`\n✅ Successfully executed ${executedCount} migration(s)`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();

