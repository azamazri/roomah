-- =============================================
-- ROOMAH DATABASE COMPLETE AUDIT
-- =============================================
-- This script generates a comprehensive report of the entire database
-- Run this in Supabase SQL Editor and share the output
-- =============================================

\echo '=============================================='
\echo 'ROOMAH DATABASE COMPLETE AUDIT'
\echo 'Generated: ' || NOW()
\echo '=============================================='
\echo ''

-- =============================================
-- 1. DATABASE OVERVIEW
-- =============================================
\echo '1. DATABASE OVERVIEW'
\echo '----------------------------------------------'

SELECT 
  current_database() as database_name,
  current_schema() as current_schema,
  version() as postgres_version;

\echo ''

-- =============================================
-- 2. EXTENSIONS
-- =============================================
-- Section: Installed Extensions

SELECT 
  '=== 2. INSTALLED EXTENSIONS ===' as section,
  extname as extension_name,
  extversion as version,
  extnamespace::regnamespace as schema
FROM pg_extension
WHERE extname NOT IN ('plpgsql')
ORDER BY extname;

-- =============================================
-- 3. SCHEMAS
-- =============================================
\echo '3. DATABASE SCHEMAS'
\echo '----------------------------------------------'

SELECT 
  schema_name,
  schema_owner
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema_name;

\echo ''

-- =============================================
-- 4. ENUMS (Custom Types)
-- =============================================
\echo '4. CUSTOM ENUM TYPES'
\echo '----------------------------------------------'

SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

\echo ''

-- =============================================
-- 5. TABLES
-- =============================================
\echo '5. ALL TABLES'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  tablename as table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- =============================================
-- 6. TABLE COLUMNS DETAIL
-- =============================================
\echo '6. TABLE COLUMNS (DETAILED)'
\echo '----------------------------------------------'

SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
    ELSE ''
  END as key_type
FROM information_schema.columns c
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

\echo ''

-- =============================================
-- 7. FOREIGN KEYS (RELATIONSHIPS)
-- =============================================
\echo '7. FOREIGN KEY RELATIONSHIPS'
\echo '----------------------------------------------'

SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- =============================================
-- 8. INDEXES
-- =============================================
\echo '8. DATABASE INDEXES'
\echo '----------------------------------------------'

SELECT
  schemaname as schema,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''

-- =============================================
-- 9. FUNCTIONS (RPC)
-- =============================================
\echo '9. CUSTOM FUNCTIONS (RPC)'
\echo '----------------------------------------------'

SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END as volatility,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security,
  l.lanname as language
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

\echo ''

-- =============================================
-- 10. SPECIFIC RPC CHECK (CRITICAL)
-- =============================================
\echo '10. CRITICAL RPC FUNCTIONS CHECK'
\echo '----------------------------------------------'

-- Check if deduct_koin exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'deduct_koin'
    ) THEN '✅ deduct_koin FOUND'
    ELSE '❌ deduct_koin MISSING'
  END as deduct_koin_status;

-- Check if add_koin exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'add_koin'
    ) THEN '✅ add_koin FOUND'
    ELSE '❌ add_koin MISSING'
  END as add_koin_status;

\echo ''

-- =============================================
-- 11. VIEWS
-- =============================================
\echo '11. DATABASE VIEWS'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  viewname as view_name,
  definition
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

\echo ''

-- =============================================
-- 12. TRIGGERS
-- =============================================
\echo '12. DATABASE TRIGGERS'
\echo '----------------------------------------------'

SELECT 
  trigger_schema as schema,
  trigger_name,
  event_object_table as table_name,
  action_timing as timing,
  event_manipulation as event,
  action_statement as action
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''

-- =============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- =============================================
\echo '13. ROW LEVEL SECURITY STATUS'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  tablename as table_name,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''

-- =============================================
-- 14. RLS POLICIES
-- =============================================
\echo '14. RLS POLICIES (DETAILED)'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  tablename as table_name,
  policyname as policy_name,
  permissive as permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''

-- =============================================
-- 15. SEQUENCES
-- =============================================
\echo '15. SEQUENCES'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  sequencename as sequence_name,
  last_value,
  increment_by
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;

\echo ''

-- =============================================
-- 16. STORAGE BUCKETS
-- =============================================
\echo '16. STORAGE BUCKETS'
\echo '----------------------------------------------'

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

\echo ''

-- =============================================
-- 17. DATA STATISTICS
-- =============================================
\echo '17. TABLE ROW COUNTS'
\echo '----------------------------------------------'

SELECT 
  schemaname as schema,
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

\echo ''

-- =============================================
-- 18. CRITICAL TABLES DATA CHECK
-- =============================================
\echo '18. CRITICAL TABLES DATA SAMPLE'
\echo '----------------------------------------------'

-- Profiles
SELECT 'profiles' as table_name, 
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE is_admin = true) as admins,
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  SUM(koin_balance) as total_koin
FROM profiles;

-- CV Data
SELECT 'cv_data' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
  COUNT(*) FILTER (WHERE status = 'REVIEW') as review,
  COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
  COUNT(*) FILTER (WHERE status = 'REVISI') as revisi,
  COUNT(*) FILTER (WHERE candidate_code IS NOT NULL) as has_code
FROM cv_data;

-- Taaruf Requests
SELECT 'taaruf_requests' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
  COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted,
  COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected
FROM taaruf_requests;

-- Taaruf Sessions
SELECT 'taaruf_sessions' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
  COUNT(DISTINCT taaruf_code) as unique_codes
FROM taaruf_sessions;

-- Wallet Transactions
SELECT 'wallet_transactions' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE type = 'CREDIT') as credits,
  COUNT(*) FILTER (WHERE type = 'DEBIT') as debits,
  SUM(amount_cents) FILTER (WHERE type = 'CREDIT') / 100 as total_credit_koin,
  SUM(amount_cents) FILTER (WHERE type = 'DEBIT') / 100 as total_debit_koin
FROM wallet_transactions;

-- Payment Transactions
SELECT 'payment_transactions' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'SETTLEMENT') as settlements,
  SUM(amount_cents) FILTER (WHERE status = 'SETTLEMENT') / 100 as total_revenue
FROM payment_transactions;

\echo ''

-- =============================================
-- 19. RECENT MIGRATIONS
-- =============================================
\echo '19. MIGRATION HISTORY'
\echo '----------------------------------------------'

SELECT 
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;

\echo ''

-- =============================================
-- 20. PERMISSIONS CHECK
-- =============================================
\echo '20. TABLE PERMISSIONS'
\echo '----------------------------------------------'

SELECT 
  grantee,
  table_schema as schema,
  table_name,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY grantee, table_schema, table_name
ORDER BY table_name, grantee;

\echo ''

-- =============================================
-- END OF AUDIT
-- =============================================
\echo '=============================================='
\echo 'AUDIT COMPLETED'
\echo 'Please copy ALL output and share with developer'
\echo '=============================================='
