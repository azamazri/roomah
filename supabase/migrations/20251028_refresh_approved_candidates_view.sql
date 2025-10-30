-- =====================================================
-- Migration: Refresh Approved Candidates View
-- Description: Refresh materialized view dengan data terbaru setelah fix bucket name
-- Date: 2025-10-28
-- =====================================================

-- Refresh view dengan data terbaru
REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;
