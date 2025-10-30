-- =====================================================
-- Migration: Add INSERT policy for wallet_transactions
-- Description: Allow authenticated users to insert wallet transactions (for payment confirmation)
-- Date: 2025-10-28
-- =====================================================

-- Add INSERT policy for wallet_transactions (system operations)
-- This allows the payment confirmation API to credit koin after successful payment
CREATE POLICY "wallet_transactions_insert_system"
  ON public.wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add UPDATE policy for koin_topup_orders (needed for status updates)
CREATE POLICY "orders_update_own"
  ON public.koin_topup_orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Verify policies created
DO $$
DECLARE
  wallet_insert_policy_count int;
  orders_update_policy_count int;
BEGIN
  SELECT COUNT(*) INTO wallet_insert_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'wallet_transactions'
    AND cmd = 'INSERT';
  
  SELECT COUNT(*) INTO orders_update_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'koin_topup_orders'
    AND cmd = 'UPDATE';
  
  RAISE NOTICE '✓ wallet_transactions INSERT policies: %', wallet_insert_policy_count;
  RAISE NOTICE '✓ koin_topup_orders UPDATE policies: %', orders_update_policy_count;
END $$;
