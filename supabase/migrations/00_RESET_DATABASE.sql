-- =====================================================
-- RESET DATABASE - Clean Slate for Phase 2
-- =====================================================
-- WARNING: This will DELETE ALL data and schema!
-- Only run this if you want to start fresh.
-- 
-- Backup your data first if needed:
--   pg_dump your_db > backup.sql
-- =====================================================

-- =====================================================
-- STEP 1: Drop all RLS policies
-- =====================================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: Drop all materialized views
-- =====================================================
DO $$ 
DECLARE
    mv RECORD;
BEGIN
    FOR mv IN 
        SELECT schemaname, matviewname
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', 
            mv.schemaname, mv.matviewname);
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: Drop all views
-- =====================================================
DO $$ 
DECLARE
    v RECORD;
BEGIN
    FOR v IN 
        SELECT schemaname, viewname
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', 
            v.schemaname, v.viewname);
    END LOOP;
END $$;

-- =====================================================
-- STEP 4: Drop all triggers
-- =====================================================
DO $$ 
DECLARE
    trg RECORD;
BEGIN
    FOR trg IN 
        SELECT schemaname, tablename, triggername
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            trg.triggername, trg.schemaname, trg.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 5: Drop all functions
-- =====================================================
DO $$ 
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT n.nspname as schema, p.proname as name, 
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
            func.schema, func.name, func.args);
    END LOOP;
END $$;

-- =====================================================
-- STEP 6: Drop all tables (CASCADE to handle FKs)
-- =====================================================
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 7: Drop all sequences
-- =====================================================
DO $$ 
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN 
        SELECT sequencename
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', seq.sequencename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 8: Drop all types (enums)
-- =====================================================
DO $$ 
DECLARE
    typ RECORD;
BEGIN
    FOR typ IN 
        SELECT typname
        FROM pg_type 
        WHERE typnamespace = 'public'::regnamespace
          AND typtype = 'e'  -- enum types only
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', typ.typname);
    END LOOP;
END $$;

-- =====================================================
-- STEP 9: Reset public schema permissions
-- =====================================================
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- =====================================================
-- VERIFICATION QUERIES (Run these after reset)
-- =====================================================

-- Should return empty or only system tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Should return empty:
-- SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e';

-- Should return empty:
-- SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';

-- =====================================================
-- RESET COMPLETE
-- =====================================================
-- Next steps:
-- 1. Verify database is clean (run verification queries above)
-- 2. Run migrations 01-18 in order
-- 3. Verify new schema is created correctly
-- =====================================================
