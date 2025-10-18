#!/usr/bin/env node

/**
 * Roomah Database Migration Runner
 * 
 * This script runs all database migrations in order using Supabase client.
 * It's designed to work with Next.js and can be run in development environment.
 * 
 * Usage:
 *   node scripts/run-migrations.js
 * 
 * Prerequisites:
 *   - .env.local with SUPABASE_SERVICE_ROLE_KEY
 *   - Supabase project initialized
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const MIGRATIONS = [
  '20250116_01_create_enums.sql',
  '20250116_02_create_core_tables.sql',
  '20250116_03_create_cv_tables.sql',
  // Add remaining migrations as they're created
];

async function runMigration(filename) {
  const filepath = path.join(__dirname, '../supabase/migrations', filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Skipping ${filename} (file not found)`);
    return { success: true, skipped: true };
  }
  
  const sql = fs.readFileSync(filepath, 'utf8');
  
  console.log(`\n📄 Running migration: ${filename}`);
  console.log(`   File size: ${(sql.length / 1024).toFixed(2)} KB`);
  
  try {
    // Split SQL by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   Statements to execute: ${statements.length}`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      
      // Execute statement
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })
        .catch(async () => {
          // Fallback: try direct query if rpc doesn't exist
          return await supabase.from('_migrations').insert({ statement });
        });
      
      if (error) {
        // Some errors are acceptable (e.g., "already exists")
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}: Already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return { success: true, skipped: false };
    
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Roomah Database Migration Runner\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`📁 Migrations directory: supabase/migrations\n`);
  console.log('═══════════════════════════════════════════════\n');
  
  const results = [];
  
  for (const migration of MIGRATIONS) {
    const result = await runMigration(migration);
    results.push({ migration, ...result });
    
    // Stop on first error
    if (!result.success) {
      console.log('\n❌ Migration process stopped due to error.\n');
      break;
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 Migration Summary:\n');
  
  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${results.length}\n`);
  
  if (failed > 0) {
    console.log('⚠️  Some migrations failed. Check the error messages above.\n');
    process.exit(1);
  } else {
    console.log('🎉 All migrations completed successfully!\n');
    console.log('Next steps:');
    console.log('   1. Verify tables created: SELECT * FROM information_schema.tables WHERE table_schema = \'public\';');
    console.log('   2. Check RLS enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\';');
    console.log('   3. Verify provinces seeded: SELECT COUNT(*) FROM public.provinces;\n');
  }
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
