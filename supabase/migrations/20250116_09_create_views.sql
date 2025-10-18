-- =====================================================
-- Migration: 09 - Create Views
-- Description: Materialized view for candidate listing + balance view
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- MATERIALIZED VIEW: approved_candidates_v
-- Public candidate listing (pre-computed for performance)
-- =====================================================
CREATE MATERIALIZED VIEW public.approved_candidates_v AS
SELECT
  cd.user_id,
  cd.candidate_code,
  CASE WHEN COALESCE(cd.gender, p.gender) = 'IKHWAN' 
    THEN 'Ikhwan' 
    ELSE 'Akhwat' 
  END as gender_label,
  COALESCE(cd.occupation, p.occupation) as occupation,
  EXTRACT(YEAR FROM AGE(COALESCE(cd.birth_date, p.dob)))::int as age,
  COALESCE(pr.name, 'N/A') as province,
  COALESCE(cd.education, p.education) as education,
  cd.income_bracket,
  cd.height_cm,
  cd.weight_kg,
  cd.disease_history,
  cd.updated_at as cv_updated_at
FROM public.cv_data cd
JOIN public.profiles p ON p.user_id = cd.user_id
LEFT JOIN public.provinces pr ON pr.id = COALESCE(cd.province_id, p.province_id)
WHERE cd.status = 'APPROVED'
  AND cd.allow_public = true;

-- =====================================================
-- INDEXES for Materialized View
-- =====================================================
-- UNIQUE index required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX ON public.approved_candidates_v (user_id);

-- Additional indexes for filtering
CREATE INDEX idx_approved_gender ON public.approved_candidates_v (gender_label);
CREATE INDEX idx_approved_province ON public.approved_candidates_v (province);
CREATE INDEX idx_approved_education ON public.approved_candidates_v (education);
CREATE INDEX idx_approved_age ON public.approved_candidates_v (age);

-- Composite index for common filter combinations
CREATE INDEX idx_approved_filter_combo ON public.approved_candidates_v 
  (gender_label, age, province, education);

COMMENT ON MATERIALIZED VIEW public.approved_candidates_v IS 
  'Public candidate listing - refresh manually or via cron job';

-- =====================================================
-- VIEW: wallet_balances_v
-- Real-time balance calculation
-- =====================================================
CREATE OR REPLACE VIEW public.wallet_balances_v AS
SELECT 
  user_id,
  COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount_cents ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount_cents ELSE 0 END), 0) 
    AS balance_cents
FROM public.wallet_ledger_entries
GROUP BY user_id;

COMMENT ON VIEW public.wallet_balances_v IS 
  'Real-time balance calculation - balance = SUM(CREDIT) - SUM(DEBIT)';

-- =====================================================
-- REFRESH FUNCTION for MV (Manual trigger)
-- =====================================================
CREATE OR REPLACE FUNCTION public.refresh_approved_candidates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use CONCURRENTLY for zero-downtime refresh
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;
END;
$$;

COMMENT ON FUNCTION public.refresh_approved_candidates() IS 'Manually refresh candidate listing MV - call after CV approval';
