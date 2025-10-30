-- =============================================
-- RPC Functions for Koin Management
-- =============================================
-- These functions are used for atomic koin operations
-- to ensure balance consistency and prevent race conditions
-- =============================================

-- =============================================
-- Function: deduct_koin
-- Description: Deduct koin from user balance (atomic operation)
-- Usage: Used when user ajukan taaruf (TAARUF_COST)
-- Returns: Updated koin_balance or NULL if insufficient
-- =============================================
CREATE OR REPLACE FUNCTION deduct_koin(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE(koin_balance INTEGER) AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT profiles.koin_balance INTO v_current_balance
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- Check if balance is sufficient
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_current_balance, p_amount;
  END IF;
  
  -- Deduct koin
  UPDATE profiles 
  SET koin_balance = koin_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING profiles.koin_balance INTO koin_balance;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: add_koin
-- Description: Add koin to user balance (atomic operation)
-- Usage: Used for refunds and topup settlements
-- Returns: Updated koin_balance
-- =============================================
CREATE OR REPLACE FUNCTION add_koin(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE(koin_balance INTEGER) AS $$
BEGIN
  -- Add koin
  UPDATE profiles 
  SET koin_balance = koin_balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING profiles.koin_balance INTO koin_balance;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Grant Execute Permissions
-- =============================================
-- Allow authenticated users to call these functions
GRANT EXECUTE ON FUNCTION deduct_koin(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_koin(UUID, INTEGER) TO authenticated;

-- =============================================
-- Comments for Documentation
-- =============================================
COMMENT ON FUNCTION deduct_koin IS 'Atomically deduct koin from user balance. Raises exception if insufficient balance.';
COMMENT ON FUNCTION add_koin IS 'Atomically add koin to user balance. Used for refunds and topup settlements.';
