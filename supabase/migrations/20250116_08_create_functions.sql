-- =====================================================
-- Migration: 08 - Create Functions & Triggers
-- Description: Core database functions and triggers
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- FUNCTION: update_updated_at
-- Auto-update timestamp on UPDATE
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at() IS 'Automatically update updated_at timestamp';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER onboarding_verifications_updated_at
  BEFORE UPDATE ON public.onboarding_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cv_data_updated_at
  BEFORE UPDATE ON public.cv_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cv_details_updated_at
  BEFORE UPDATE ON public.cv_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER koin_topup_orders_updated_at
  BEFORE UPDATE ON public.koin_topup_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNCTION: generate_candidate_code
-- Generate IKHWAN1, AKHWAT1, etc.
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_candidate_code(p_gender public.gender_enum)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seq_key text;
  v_next_num bigint;
  v_code text;
BEGIN
  -- Determine sequence key
  v_seq_key := 'CANDIDATE_' || p_gender::text;
  
  -- Atomic increment with row lock
  UPDATE public.sequences
  SET last_number = last_number + 1,
      updated_at = now()
  WHERE seq_key = v_seq_key
  RETURNING last_number INTO v_next_num;
  
  -- Format code: IKHWAN1, AKHWAT1, etc.
  v_code := p_gender::text || v_next_num::text;
  
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.generate_candidate_code(public.gender_enum) IS 'Generate candidate code with atomic sequence increment';

-- =====================================================
-- FUNCTION: generate_taaruf_code
-- Generate TAARUF1, TAARUF2, etc.
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_taaruf_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_num bigint;
BEGIN
  UPDATE public.sequences
  SET last_number = last_number + 1,
      updated_at = now()
  WHERE seq_key = 'TAARUF'
  RETURNING last_number INTO v_next_num;
  
  RETURN 'TAARUF' || v_next_num::text;
END;
$$;

COMMENT ON FUNCTION public.generate_taaruf_code() IS 'Generate taaruf session code with atomic sequence increment';

-- =====================================================
-- FUNCTION: can_ajukan_taaruf
-- Business guards for taaruf proposals
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_ajukan_taaruf(
  from_user_id uuid,
  to_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  from_cv_status public.cv_status_enum;
  from_gender public.gender_enum;
  to_gender public.gender_enum;
  from_balance int;
  has_active_taaruf boolean;
  taaruf_cost_cents int := 500; -- 5 koin (configurable)
BEGIN
  -- Check 1: Not same user
  IF from_user_id = to_user_id THEN
    RETURN FALSE;
  END IF;

  -- Check 2: From user's CV must be APPROVED
  SELECT cd.status, cd.gender 
  INTO from_cv_status, from_gender
  FROM public.cv_data cd
  WHERE cd.user_id = from_user_id;

  IF from_cv_status IS NULL OR from_cv_status != 'APPROVED' THEN
    RETURN FALSE;
  END IF;

  -- Check 3: To user's CV must be APPROVED
  SELECT cd.gender 
  INTO to_gender
  FROM public.cv_data cd
  WHERE cd.user_id = to_user_id
    AND cd.status = 'APPROVED';

  IF to_gender IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check 4: Must be opposite gender
  IF from_gender = to_gender THEN
    RETURN FALSE;
  END IF;

  -- Check 5: From user must have sufficient balance
  SELECT COALESCE(
    SUM(CASE WHEN type = 'CREDIT' THEN amount_cents ELSE 0 END) -
    SUM(CASE WHEN type = 'DEBIT' THEN amount_cents ELSE 0 END), 
    0
  )
  INTO from_balance
  FROM public.wallet_ledger_entries
  WHERE user_id = from_user_id;

  IF from_balance < taaruf_cost_cents THEN
    RETURN FALSE;
  END IF;

  -- Check 6: From user must not have active taaruf
  SELECT EXISTS (
    SELECT 1 
    FROM public.taaruf_sessions 
    WHERE (user_a = from_user_id OR user_b = from_user_id)
      AND status = 'ACTIVE'
  ) INTO has_active_taaruf;

  IF has_active_taaruf THEN
    RETURN FALSE;
  END IF;

  -- All checks passed
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.can_ajukan_taaruf(uuid, uuid) IS 'Comprehensive business guards: CV approved, opposite gender, sufficient koin, no active taaruf';

-- =====================================================
-- TRIGGER FUNCTION: cv_approval_trigger_fn
-- Auto-generate candidate code on approval
-- =====================================================
CREATE OR REPLACE FUNCTION public.cv_approval_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger on status change to APPROVED
  IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
    -- Generate candidate code if not exists
    IF NEW.candidate_code IS NULL THEN
      NEW.candidate_code := generate_candidate_code(NEW.gender);
    END IF;
    
    -- Note: MV refresh will be handled by cron job or manual refresh
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER cv_approval_trigger
  BEFORE UPDATE ON public.cv_data
  FOR EACH ROW
  EXECUTE FUNCTION cv_approval_trigger_fn();

COMMENT ON FUNCTION public.cv_approval_trigger_fn() IS 'Auto-generate candidate code on CV approval';

-- =====================================================
-- TRIGGER FUNCTION: cv_admin_audit_trigger_fn
-- Log admin CV status changes
-- =====================================================
CREATE OR REPLACE FUNCTION public.cv_admin_audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log status changes by admin
  IF NEW.status != OLD.status AND NEW.last_reviewed_by IS NOT NULL THEN
    INSERT INTO public.admin_actions_audit (
      admin_id,
      action,
      target_table,
      target_id,
      details,
      created_at
    ) VALUES (
      NEW.last_reviewed_by,
      'CV_STATUS_CHANGE',
      'cv_data',
      NEW.user_id::text,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'candidate_code', NEW.candidate_code
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER cv_admin_audit_trigger
  AFTER UPDATE ON public.cv_data
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION cv_admin_audit_trigger_fn();

COMMENT ON FUNCTION public.cv_admin_audit_trigger_fn() IS 'Audit trail for admin CV status changes';

-- =====================================================
-- FUNCTION: cleanup_expired_taaruf_requests
-- Auto-expire taaruf requests after 7 days
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_taaruf_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.taaruf_requests
  SET status = 'EXPIRED',
      decided_at = now()
  WHERE status = 'PENDING'
    AND expires_at < now();
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_taaruf_requests() IS 'Scheduled job: expire pending taaruf requests after 7 days';
