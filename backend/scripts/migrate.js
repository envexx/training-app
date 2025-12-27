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

/**
 * Split SQL into statements, handling dollar-quoted strings properly
 */
function splitSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Check for dollar-quoted string start: $tag$ or $$
    if (char === '$' && !inDollarQuote) {
      let tag = '$';
      let j = i + 1;
      
      // Read the tag (can be empty $$ or $tag$)
      while (j < sql.length && sql[j] !== '$') {
        tag += sql[j];
        j++;
      }
      
      if (j < sql.length && sql[j] === '$') {
        tag += '$';
        dollarTag = tag;
        inDollarQuote = true;
        currentStatement += tag;
        i = j + 1;
        continue;
      }
    }

    // Check for dollar-quoted string end
    if (inDollarQuote && char === '$') {
      let potentialTag = '$';
      let j = i + 1;
      
      while (j < sql.length && sql[j] !== '$') {
        potentialTag += sql[j];
        j++;
      }
      
      if (j < sql.length && sql[j] === '$') {
        potentialTag += '$';
        
        if (potentialTag === dollarTag) {
          // Found matching closing tag
          currentStatement += potentialTag;
          inDollarQuote = false;
          dollarTag = '';
          i = j + 1;
          continue;
        }
      }
    }

    // Check for statement terminator (semicolon) only if not in dollar quote
    if (char === ';' && !inDollarQuote) {
      const trimmed = currentStatement.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      currentStatement = '';
      i++;
      continue;
    }

    currentStatement += char;
    i++;
  }

  // Add remaining statement
  const trimmed = currentStatement.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

/**
 * Remove comments from SQL statement
 */
function removeComments(statement) {
  const lines = statement.split('\n');
  const cleanedLines = [];
  let inMultiLineComment = false;

  for (const line of lines) {
    let cleanedLine = line;
    
    // Handle multi-line comments /* ... */
    if (inMultiLineComment) {
      const endIndex = cleanedLine.indexOf('*/');
      if (endIndex !== -1) {
        cleanedLine = cleanedLine.substring(endIndex + 2);
        inMultiLineComment = false;
      } else {
        continue; // Skip entire line
      }
    }

    // Check for multi-line comment start
    const multiLineStart = cleanedLine.indexOf('/*');
    if (multiLineStart !== -1) {
      const multiLineEnd = cleanedLine.indexOf('*/', multiLineStart);
      if (multiLineEnd !== -1) {
        // Single line multi-line comment
        cleanedLine = cleanedLine.substring(0, multiLineStart) + cleanedLine.substring(multiLineEnd + 2);
      } else {
        // Multi-line comment starts here
        cleanedLine = cleanedLine.substring(0, multiLineStart);
        inMultiLineComment = true;
      }
    }

    // Remove single-line comments (--), but not if inside dollar quotes
    // For simplicity, we'll just remove lines starting with --
    const trimmed = cleanedLine.trim();
    if (trimmed.startsWith('--')) {
      continue;
    }

    // Remove inline comments (-- at end of line)
    const commentIndex = cleanedLine.indexOf('--');
    if (commentIndex !== -1) {
      // Make sure it's not part of a string (simple check)
      const beforeComment = cleanedLine.substring(0, commentIndex);
      if (!beforeComment.includes("'") || (beforeComment.match(/'/g) || []).length % 2 === 0) {
        cleanedLine = cleanedLine.substring(0, commentIndex);
      }
    }

    if (cleanedLine.trim().length > 0 || line.trim().length === 0) {
      cleanedLines.push(cleanedLine);
    }
  }

  return cleanedLines.join('\n').trim();
}

async function runMigration(filename) {
  const filePath = join(migrationsDir, filename);
  
  try {
    console.log(`\n📄 Running migration: ${filename}`);
    const sql = readFileSync(filePath, 'utf8');
    
    // Split SQL into statements, handling dollar-quoted strings
    const rawStatements = splitSQLStatements(sql);
    
    // Clean and filter statements
    const statements = rawStatements
      .map(removeComments)
      .filter(s => s.trim().length > 0);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          console.error(`Error executing statement ${i + 1}/${statements.length}:`);
          console.error(`Statement: ${statement.substring(0, 200)}...`);
          throw error;
        }
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

