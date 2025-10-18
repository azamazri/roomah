-- =====================================================
-- Migration: 11 - Enable RLS
-- Description: Enable Row Level Security on all tables
-- Date: 2025-01-16
-- =====================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taaruf_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taaruf_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koin_topup_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_audit ENABLE ROW LEVEL SECURITY;

-- Enable RLS on materialized view
ALTER MATERIALIZED VIEW public.approved_candidates_v OWNER TO postgres;

-- Verify RLS enabled
DO $$
DECLARE
  table_count int;
  rls_enabled_count int;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND rowsecurity = true;
  
  RAISE NOTICE 'Total tables: %, RLS enabled: %', table_count, rls_enabled_count;
  
  IF rls_enabled_count < 11 THEN
    RAISE WARNING 'Expected at least 11 tables with RLS enabled';
  END IF;
END $$;
