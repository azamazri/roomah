-- =====================================================
-- Migration: Fix can_ajukan_taaruf function
-- Description: Query from wallet_transactions instead of wallet_ledger_entries view
-- Date: 2025-10-28
-- Issue: wallet_ledger_entries VIEW renames 'type' to 'entry_type', causing balance check to fail
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_ajukan_taaruf(from_user_id uuid, to_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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
  -- FIX: Query from wallet_transactions directly (not the VIEW)
  SELECT COALESCE(
    SUM(CASE WHEN type = 'CREDIT' THEN amount_cents ELSE 0 END) -
    SUM(CASE WHEN type = 'DEBIT' THEN amount_cents ELSE 0 END), 
    0
  )
  INTO from_balance
  FROM public.wallet_transactions
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_ajukan_taaruf(uuid, uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.can_ajukan_taaruf IS 'Check if user can create taaruf request. Used by RLS policy on taaruf_requests table.';
