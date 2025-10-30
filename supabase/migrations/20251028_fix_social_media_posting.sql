-- =============================================
-- Migration: Fix Social Media Posting Issues
-- Description: Add missing RPC function and enum value
-- Date: 2025-10-28
-- =============================================

-- =============================================
-- 1. Add SOCIAL_MEDIA_POST to ledger_reason enum
-- =============================================
ALTER TYPE public.ledger_reason ADD VALUE IF NOT EXISTS 'SOCIAL_MEDIA_POST';

-- =============================================
-- 2. Create get_wallet_balance RPC function
-- Description: Calculate user's wallet balance from wallet_transactions
-- Returns: Balance in cents (1 koin = 100 cents)
-- =============================================
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Calculate balance by summing credits and debits
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN type = 'CREDIT' THEN amount_cents
        WHEN type = 'DEBIT' THEN -amount_cents
        ELSE 0
      END
    ), 
    0
  )
  INTO v_balance
  FROM wallet_transactions
  WHERE user_id = p_user_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- Grant Execute Permissions
-- =============================================
GRANT EXECUTE ON FUNCTION get_wallet_balance(UUID) TO authenticated;

-- =============================================
-- Comments for Documentation
-- =============================================
COMMENT ON FUNCTION get_wallet_balance IS 'Calculate user wallet balance from wallet_transactions. Returns balance in cents.';
