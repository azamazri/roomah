-- =============================================
-- ROOMAH DATABASE AUDIT - SUPABASE COMPATIBLE
-- =============================================
-- Copy-paste dan run script ini di Supabase SQL Editor
-- Kemudian copy SEMUA output dan share
-- =============================================

-- === AUDIT START ===
SELECT '=== ROOMAH DATABASE AUDIT STARTED ===' as audit_header, NOW() as timestamp;

-- =============================================
-- 1. DATABASE OVERVIEW
-- =============================================
SELECT '=== 1. DATABASE OVERVIEW ===' as section;
SELECT 
  current_database() as database_name,
  current_schema() as current_schema,
  version() as postgres_version;

-- =============================================
-- 2. EXTENSIONS
-- =============================================
SELECT '=== 2. INSTALLED EXTENSIONS ===' as section;
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname NOT IN ('plpgsql')
ORDER BY extname;

-- =============================================
-- 3. ENUMS (Custom Types)
-- =============================================
SELECT '=== 3. CUSTOM ENUM TYPES ===' as section;
SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- =============================================
-- 4. TABLES
-- =============================================
SELECT '=== 4. ALL TABLES WITH SIZES ===' as section;
SELECT 
  tablename as table_name,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- =============================================
-- 5. CRITICAL RPC CHECK ⚡ 
-- =============================================
SELECT '=== 5. CRITICAL RPC FUNCTIONS CHECK (IMPORTANT!) ===' as section;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'deduct_koin'
    ) THEN '✅ deduct_koin FOUND'
    ELSE '❌ deduct_koin MISSING - RUN MIGRATION 20251023_add_koin_rpc_functions.sql'
  END as deduct_koin_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'add_koin'
    ) THEN '✅ add_koin FOUND'
    ELSE '❌ add_koin MISSING - RUN MIGRATION 20251023_add_koin_rpc_functions.sql'
  END as add_koin_status;

-- =============================================
-- 6. ALL FUNCTIONS (RPC)
-- =============================================
SELECT '=== 6. ALL CUSTOM FUNCTIONS ===' as section;
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- =============================================
-- 7. ROW LEVEL SECURITY STATUS
-- =============================================
SELECT '=== 7. ROW LEVEL SECURITY (RLS) STATUS ===' as section;
SELECT 
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 8. RLS POLICIES COUNT
-- =============================================
SELECT '=== 8. RLS POLICIES COUNT ===' as section;
SELECT 
  tablename as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- =============================================
-- 9. INDEXES
-- =============================================
SELECT '=== 9. DATABASE INDEXES ===' as section;
SELECT
  tablename as table_name,
  indexname as index_name
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================
-- 10. STORAGE BUCKETS
-- =============================================
SELECT '=== 10. STORAGE BUCKETS ===' as section;
SELECT 
  name,
  public,
  file_size_limit
FROM storage.buckets
ORDER BY name;

-- =============================================
-- 11. TABLE ROW COUNTS
-- =============================================
SELECT '=== 11. TABLE ROW COUNTS ===' as section;
SELECT 
  relname as table_name,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =============================================
-- 12. CRITICAL DATA CHECK: PROFILES
-- =============================================
SELECT '=== 12. PROFILES TABLE DATA ===' as section;
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admins,
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  SUM(koin_balance) as total_koin,
  AVG(koin_balance)::numeric(10,2) as avg_koin
FROM profiles;

-- =============================================
-- 13. CRITICAL DATA CHECK: CV DATA
-- =============================================
SELECT '=== 13. CV DATA TABLE ===' as section;
SELECT 
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE candidate_code IS NOT NULL) as has_candidate_code
FROM cv_data
GROUP BY status
ORDER BY status;

-- =============================================
-- 14. CRITICAL DATA CHECK: TAARUF REQUESTS
-- =============================================
SELECT '=== 14. TAARUF REQUESTS TABLE ===' as section;
SELECT 
  status,
  COUNT(*) as count
FROM taaruf_requests
GROUP BY status
ORDER BY status;

-- =============================================
-- 15. CRITICAL DATA CHECK: TAARUF SESSIONS
-- =============================================
SELECT '=== 15. TAARUF SESSIONS TABLE ===' as section;
SELECT 
  status,
  COUNT(*) as count,
  COUNT(DISTINCT taaruf_code) as unique_codes
FROM taaruf_sessions
GROUP BY status
ORDER BY status;

-- =============================================
-- 16. CRITICAL DATA CHECK: WALLET TRANSACTIONS
-- =============================================
SELECT '=== 16. WALLET TRANSACTIONS TABLE ===' as section;
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount_cents) / 100 as total_koin
FROM wallet_transactions
GROUP BY type
ORDER BY type;

-- =============================================
-- 17. CRITICAL DATA CHECK: PAYMENT TRANSACTIONS
-- =============================================
SELECT '=== 17. PAYMENT TRANSACTIONS TABLE ===' as section;
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount_cents) / 100 as total_amount_idr
FROM payment_transactions
GROUP BY status
ORDER BY status;

-- =============================================
-- 18. RECENT MIGRATIONS
-- =============================================
SELECT '=== 18. RECENT MIGRATIONS (LAST 10) ===' as section;
SELECT 
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;

-- =============================================
-- 19. TABLE COLUMNS OVERVIEW
-- =============================================
SELECT '=== 19. PROFILES TABLE COLUMNS ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '=== CV_DATA TABLE COLUMNS ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cv_data'
ORDER BY ordinal_position;

-- =============================================
-- 20. FOREIGN KEY RELATIONSHIPS
-- =============================================
SELECT '=== 20. FOREIGN KEY RELATIONSHIPS ===' as section;
SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- === AUDIT END ===
SELECT '=== AUDIT COMPLETED - COPY ALL OUTPUT ABOVE ===' as audit_footer, NOW() as timestamp;
