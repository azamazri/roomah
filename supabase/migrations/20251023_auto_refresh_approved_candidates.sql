-- =====================================================
-- Migration: Auto Refresh Approved Candidates View
-- Description: Trigger untuk otomatis refresh materialized view saat CV approved
-- Date: 2025-10-23
-- =====================================================

-- Function untuk refresh approved candidates setelah CV status update
CREATE OR REPLACE FUNCTION public.trigger_refresh_approved_candidates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Hanya refresh jika status berubah ke APPROVED atau allow_public berubah
  IF (TG_OP = 'INSERT' AND NEW.status = 'APPROVED' AND NEW.allow_public = true)
     OR (TG_OP = 'UPDATE' AND (
       (OLD.status != 'APPROVED' AND NEW.status = 'APPROVED') OR
       (OLD.allow_public != NEW.allow_public) OR
       (OLD.status = 'APPROVED' AND NEW.status != 'APPROVED')
     ))
     OR (TG_OP = 'DELETE' AND OLD.status = 'APPROVED')
  THEN
    -- Refresh materialized view
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger pada cv_data table
DROP TRIGGER IF EXISTS after_cv_status_change ON public.cv_data;
CREATE TRIGGER after_cv_status_change
  AFTER INSERT OR UPDATE OR DELETE ON public.cv_data
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_refresh_approved_candidates();

COMMENT ON FUNCTION public.trigger_refresh_approved_candidates() IS 
  'Auto-refresh approved_candidates_v when CV status changes to/from APPROVED';
