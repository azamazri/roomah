-- ============================================================================
-- SCHEMA MISMATCH FIXES - Backend Compatibility
-- Date: 2025-10-18
-- Purpose: Fix table names, enums, and missing columns
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO cv_data
-- ============================================================================

-- Add marital_status enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status_enum') THEN
    CREATE TYPE public.marital_status_enum AS ENUM ('SINGLE', 'JANDA', 'DUDA');
  END IF;
END $$;

-- Add missing columns
ALTER TABLE public.cv_data 
ADD COLUMN IF NOT EXISTS marital_status public.marital_status_enum,
ADD COLUMN IF NOT EXISTS full_address text,
ADD COLUMN IF NOT EXISTS ciri_fisik text;

COMMENT ON COLUMN public.cv_data.marital_status IS 'Marital status: SINGLE, JANDA, DUDA';
COMMENT ON COLUMN public.cv_data.full_address IS 'Full address for biodata';
COMMENT ON COLUMN public.cv_data.ciri_fisik IS 'Physical characteristics';

-- Fix disease_history type (from text to text array)
-- Need to drop dependent views first
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_data' 
      AND column_name = 'disease_history' 
      AND data_type = 'text'
  ) THEN
    -- Drop materialized view first (will recreate later)
    DROP MATERIALIZED VIEW IF EXISTS public.approved_candidates_v CASCADE;
    
    -- Convert text to text array (assuming comma-separated or empty)
    ALTER TABLE public.cv_data 
    ALTER COLUMN disease_history TYPE text[] 
    USING CASE 
      WHEN disease_history IS NULL THEN NULL
      WHEN disease_history = '' THEN ARRAY[]::text[]
      ELSE string_to_array(disease_history, ',')
    END;
  END IF;
END $$;

-- ============================================================================
-- 2. CREATE VIEWS FOR BACKWARD COMPATIBILITY (Table Name Aliases)
-- ============================================================================

-- Backend expects "wallet_ledger_entries" but database has "wallet_transactions"
CREATE OR REPLACE VIEW public.wallet_ledger_entries AS
SELECT 
  id,
  user_id,
  type as entry_type,
  amount_cents as amount,
  reason as transaction_type,
  description,
  metadata::jsonb as metadata,
  created_at
FROM public.wallet_transactions;

COMMENT ON VIEW public.wallet_ledger_entries IS 'Compatibility view - maps wallet_transactions to expected backend schema';

-- Backend expects "payment_transactions" but database has "koin_topup_orders"
CREATE OR REPLACE VIEW public.payment_transactions AS
SELECT 
  order_id as id,
  user_id,
  order_id,
  'TOPUP' as package_id,
  price_idr as amount,
  koin_amount,
  status as status,
  '' as payment_method,
  created_at,
  settled_at as updated_at
FROM public.koin_topup_orders;

COMMENT ON VIEW public.payment_transactions IS 'Compatibility view - maps koin_topup_orders to expected backend schema';

-- ============================================================================
-- 3. ADD ENUM VALUES FOR SESSION STATUS (if needed)
-- ============================================================================

-- Add COMPLETED and CANCELLED to taaruf_session_status if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'taaruf_session_status' AND e.enumlabel = 'COMPLETED'
  ) THEN
    ALTER TYPE public.taaruf_session_status ADD VALUE 'COMPLETED';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'taaruf_session_status' AND e.enumlabel = 'CANCELLED'
  ) THEN
    ALTER TYPE public.taaruf_session_status ADD VALUE 'CANCELLED';
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE GENDER MAPPING FUNCTION (IKHWAN/AKHWAT <-> MALE/FEMALE)
-- ============================================================================

-- Function to convert gender labels for backend compatibility
CREATE OR REPLACE FUNCTION public.map_gender_to_backend(g public.gender_enum)
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN g = 'IKHWAN' THEN 'MALE'
    WHEN g = 'AKHWAT' THEN 'FEMALE'
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.map_gender_from_backend(g text)
RETURNS public.gender_enum AS $$
BEGIN
  RETURN CASE 
    WHEN g = 'MALE' THEN 'IKHWAN'::public.gender_enum
    WHEN g = 'FEMALE' THEN 'AKHWAT'::public.gender_enum
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. UPDATE approved_candidates_v TO USE BACKEND-COMPATIBLE LABELS
-- ============================================================================

-- Drop existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.approved_candidates_v CASCADE;

-- Recreate with backend-compatible gender labels
CREATE MATERIALIZED VIEW public.approved_candidates_v AS
SELECT 
  cd.user_id,
  cd.candidate_code,
  cd.full_name,
  cd.birth_date,
  EXTRACT(YEAR FROM AGE(cd.birth_date))::int AS age,
  cd.gender,
  -- Map IKHWAN/AKHWAT to MALE/FEMALE for backend
  CASE 
    WHEN cd.gender = 'IKHWAN' THEN 'MALE'
    WHEN cd.gender = 'AKHWAT' THEN 'FEMALE'
  END AS gender_label,
  cd.province_id,
  pr.name AS province,
  cd.education,
  cd.occupation,
  cd.income_bracket,
  cd.height_cm,
  cd.weight_kg,
  cd.allow_public,
  cd.updated_at AS cv_updated_at,
  -- Status label for ta'aruf readiness
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM taaruf_sessions ts 
      WHERE (ts.user_a = cd.user_id OR ts.user_b = cd.user_id) 
        AND ts.status = 'ACTIVE'
    ) THEN 'DALAM_PROSES'
    ELSE 'SIAP_BERTAARUF'
  END AS taaruf_status
FROM cv_data cd
LEFT JOIN provinces pr ON cd.province_id = pr.id
WHERE cd.status = 'APPROVED'::cv_status_enum
  AND cd.allow_public = true;

-- Recreate indexes
CREATE UNIQUE INDEX approved_candidates_v_user_id_idx ON approved_candidates_v(user_id);
CREATE INDEX idx_approved_gender ON approved_candidates_v(gender_label);
CREATE INDEX idx_approved_age ON approved_candidates_v(age);
CREATE INDEX idx_approved_education ON approved_candidates_v(education);
CREATE INDEX idx_approved_province ON approved_candidates_v(province);
CREATE INDEX idx_approved_filter_combo ON approved_candidates_v(gender_label, age, province, education);

COMMENT ON MATERIALIZED VIEW public.approved_candidates_v IS 'Approved candidates with backend-compatible gender labels (MALE/FEMALE)';

-- ============================================================================
-- 6. CREATE REFRESH FUNCTION (if not exists)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_approved_candidates()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES (commented out)
-- ============================================================================

-- Check views exist:
-- SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public' AND viewname IN ('wallet_ledger_entries', 'payment_transactions');

-- Check cv_data columns:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cv_data' AND column_name IN ('marital_status', 'full_address', 'ciri_fisik', 'disease_history');

-- Check approved_candidates_v:
-- SELECT * FROM approved_candidates_v LIMIT 1;
