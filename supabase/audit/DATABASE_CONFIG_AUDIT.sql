-- =============================================
-- ROOMAH DATABASE CONFIGURATION AUDIT
-- =============================================
-- Fokus: KONFIGURASI (bukan data)
-- Tables, RLS, Policies, Functions, Storage, dll
-- =============================================

SELECT '=== ROOMAH DATABASE CONFIGURATION AUDIT ===' as title, NOW() as timestamp;

-- =============================================
-- 1. DATABASE INFO
-- =============================================
SELECT '=== 1. DATABASE INFORMATION ===' as section;
SELECT 
  current_database() as database_name,
  current_schema() as schema,
  version() as postgres_version;

-- =============================================
-- 2. EXTENSIONS
-- =============================================
SELECT '=== 2. INSTALLED EXTENSIONS ===' as section;
SELECT 
  extname as extension_name,
  extversion as version,
  extnamespace::regnamespace as schema
FROM pg_extension
WHERE extname NOT IN ('plpgsql')
ORDER BY extname;

-- =============================================
-- 3. SCHEMAS
-- =============================================
SELECT '=== 3. DATABASE SCHEMAS ===' as section;
SELECT 
  schema_name,
  schema_owner
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
ORDER BY schema_name;

-- =============================================
-- 4. CUSTOM ENUM TYPES
-- =============================================
SELECT '=== 4. CUSTOM ENUM TYPES ===' as section;
SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as possible_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- =============================================
-- 5. ALL TABLES
-- =============================================
SELECT '=== 5. ALL TABLES ===' as section;
SELECT 
  tablename as table_name,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 6. TABLE COLUMNS (ALL TABLES)
-- =============================================
SELECT '=== 6. TABLE COLUMNS (STRUCTURE) ===' as section;
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
    WHEN uk.column_name IS NOT NULL THEN 'UNIQUE'
    ELSE ''
  END as constraint_type
FROM information_schema.columns c
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
) uk ON c.table_name = uk.table_name AND c.column_name = uk.column_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- =============================================
-- 7. PRIMARY KEYS
-- =============================================
SELECT '=== 7. PRIMARY KEYS ===' as section;
SELECT
  tc.table_name,
  string_agg(kcu.column_name, ', ') as primary_key_columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY tc.table_name;

-- =============================================
-- 8. FOREIGN KEYS (RELATIONSHIPS)
-- =============================================
SELECT '=== 8. FOREIGN KEY RELATIONSHIPS ===' as section;
SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column,
  tc.constraint_name,
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

-- =============================================
-- 9. INDEXES
-- =============================================
SELECT '=== 9. INDEXES ===' as section;
SELECT
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================
-- 10. UNIQUE CONSTRAINTS
-- =============================================
SELECT '=== 10. UNIQUE CONSTRAINTS ===' as section;
SELECT
  tc.table_name,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- =============================================
-- 11. CHECK CONSTRAINTS
-- =============================================
SELECT '=== 11. CHECK CONSTRAINTS ===' as section;
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================
-- 12. FUNCTIONS (RPC) - DETAILED
-- =============================================
SELECT '=== 12. CUSTOM FUNCTIONS (RPC) ===' as section;
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as parameters,
  pg_get_function_result(p.oid) as return_type,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END as volatility,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  l.lanname as language,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- =============================================
-- 13. CRITICAL RPC CHECK
-- =============================================
SELECT '=== 13. CRITICAL RPC FUNCTIONS STATUS ===' as section;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'deduct_koin'
    ) THEN '✅ FOUND'
    ELSE '❌ MISSING'
  END as deduct_koin_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'add_koin'
    ) THEN '✅ FOUND'
    ELSE '❌ MISSING'
  END as add_koin_status;

-- =============================================
-- 14. TRIGGERS
-- =============================================
SELECT '=== 14. TRIGGERS ===' as section;
SELECT 
  trigger_schema as schema,
  trigger_name,
  event_object_table as table_name,
  action_timing as timing,
  string_agg(event_manipulation, ', ') as events,
  action_statement as trigger_function
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY trigger_schema, trigger_name, event_object_table, action_timing, action_statement
ORDER BY event_object_table, trigger_name;

-- =============================================
-- 15. VIEWS
-- =============================================
SELECT '=== 15. VIEWS ===' as section;
SELECT 
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =============================================
-- 16. ROW LEVEL SECURITY (RLS) STATUS
-- =============================================
SELECT '=== 16. ROW LEVEL SECURITY STATUS ===' as section;
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
-- 17. RLS POLICIES (DETAILED)
-- =============================================
SELECT '=== 17. RLS POLICIES ===' as section;
SELECT 
  schemaname as schema,
  tablename as table_name,
  policyname as policy_name,
  CASE permissive
    WHEN 'PERMISSIVE' THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as type,
  roles::text as for_roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 18. STORAGE BUCKETS
-- =============================================
SELECT '=== 18. STORAGE BUCKETS ===' as section;
SELECT 
  id,
  name,
  owner,
  public,
  avif_autodetection,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY name;

-- =============================================
-- 19. STORAGE POLICIES
-- =============================================
SELECT '=== 19. STORAGE BUCKET POLICIES ===' as section;
SELECT 
  bucket_id,
  name as policy_name,
  definition
FROM storage.policies
ORDER BY bucket_id, name;

-- =============================================
-- 20. SEQUENCES
-- =============================================
SELECT '=== 20. SEQUENCES ===' as section;
SELECT 
  schemaname as schema,
  sequencename as sequence_name,
  last_value,
  start_value,
  increment_by,
  max_value,
  min_value,
  cache_size,
  cycle
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;

-- =============================================
-- 21. TABLE PERMISSIONS
-- =============================================
SELECT '=== 21. TABLE PERMISSIONS ===' as section;
SELECT 
  grantee as role,
  table_name,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres')
GROUP BY grantee, table_name
ORDER BY table_name, grantee;

-- =============================================
-- 22. FUNCTION PERMISSIONS
-- =============================================
SELECT '=== 22. FUNCTION PERMISSIONS ===' as section;
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  array_to_string(p.proacl, ', ') as grants
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- =============================================
-- 23. RECENT MIGRATIONS
-- =============================================
SELECT '=== 23. MIGRATION HISTORY (LAST 20) ===' as section;
SELECT 
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;

-- =============================================
-- 24. PUBLICATIONS (Realtime)
-- =============================================
SELECT '=== 24. PUBLICATIONS (REALTIME) ===' as section;
SELECT 
  pubname as publication_name,
  puballtables as all_tables,
  pubinsert as publish_insert,
  pubupdate as publish_update,
  pubdelete as publish_delete
FROM pg_publication
ORDER BY pubname;

-- =============================================
-- 25. PUBLICATION TABLES
-- =============================================
SELECT '=== 25. PUBLISHED TABLES (REALTIME) ===' as section;
SELECT 
  p.pubname as publication_name,
  n.nspname as schema,
  c.relname as table_name
FROM pg_publication p
JOIN pg_publication_rel pr ON p.oid = pr.prpubid
JOIN pg_class c ON pr.prrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.pubname, c.relname;

-- =============================================
-- AUDIT COMPLETE
-- =============================================
SELECT '=== AUDIT COMPLETED ===' as footer, NOW() as timestamp;
SELECT 'Copy ALL output above and share with developer' as instruction;
