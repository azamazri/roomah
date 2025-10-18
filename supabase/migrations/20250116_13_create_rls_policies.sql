-- =====================================================
-- Migration: 13 - RLS Policies (All Tables)
-- Description: Complete Row Level Security policies
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- ONBOARDING_VERIFICATIONS POLICIES
-- =====================================================
CREATE POLICY "onboarding_select_own"
  ON public.onboarding_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "onboarding_insert_own"
  ON public.onboarding_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_update_own"
  ON public.onboarding_verifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- CV_DATA POLICIES
-- =====================================================
CREATE POLICY "cv_select_own"
  ON public.cv_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cv_select_admin"
  ON public.cv_data
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "cv_insert_own"
  ON public.cv_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cv_update_own"
  ON public.cv_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "cv_update_admin"
  ON public.cv_data
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- CV_DETAILS POLICIES
-- =====================================================
CREATE POLICY "cv_details_select_own"
  ON public.cv_details
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cv_details_select_admin"
  ON public.cv_details
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "cv_details_insert_own"
  ON public.cv_details
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cv_details_update_own"
  ON public.cv_details
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- APPROVED_CANDIDATES_V POLICIES
-- =====================================================
-- NOTE: Materialized Views don't support RLS policies
-- Access control is handled via application layer
-- All users can SELECT from this view (public candidate listing)

-- =====================================================
-- TAARUF_REQUESTS POLICIES
-- =====================================================
CREATE POLICY "taaruf_requests_select_own"
  ON public.taaruf_requests
  FOR SELECT
  TO authenticated
  USING (
    from_user = auth.uid() OR 
    to_user = auth.uid()
  );

CREATE POLICY "taaruf_requests_select_admin"
  ON public.taaruf_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "taaruf_requests_insert_guarded"
  ON public.taaruf_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user = auth.uid()
    AND public.can_ajukan_taaruf(from_user, to_user)
  );

CREATE POLICY "taaruf_requests_update_receiver"
  ON public.taaruf_requests
  FOR UPDATE
  TO authenticated
  USING (to_user = auth.uid())
  WITH CHECK (
    to_user = auth.uid()
    AND status IN ('ACCEPTED', 'REJECTED')
  );

-- =====================================================
-- TAARUF_SESSIONS POLICIES
-- =====================================================
CREATE POLICY "taaruf_sessions_select_participant"
  ON public.taaruf_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_a = auth.uid() OR 
    user_b = auth.uid()
  );

CREATE POLICY "taaruf_sessions_select_admin"
  ON public.taaruf_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "taaruf_sessions_update_finish"
  ON public.taaruf_sessions
  FOR UPDATE
  TO authenticated
  USING (
    (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'ACTIVE'
  )
  WITH CHECK (
    (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'FINISHED'
  );

-- =====================================================
-- WALLET_LEDGER_ENTRIES POLICIES
-- =====================================================
CREATE POLICY "ledger_select_own"
  ON public.wallet_ledger_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "ledger_select_admin"
  ON public.wallet_ledger_entries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- KOIN_TOPUP_ORDERS POLICIES
-- =====================================================
CREATE POLICY "orders_select_own"
  ON public.koin_topup_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_select_admin"
  ON public.koin_topup_orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "orders_insert_own"
  ON public.koin_topup_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- SEQUENCES POLICIES
-- =====================================================
-- No user-facing policies (function-only access via SECURITY DEFINER)

-- =====================================================
-- PROVINCES POLICIES
-- =====================================================
CREATE POLICY "provinces_select_public"
  ON public.provinces
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================
-- ADMIN_ACTIONS_AUDIT POLICIES
-- =====================================================
CREATE POLICY "audit_select_admin"
  ON public.admin_actions_audit
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_insert_admin"
  ON public.admin_actions_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
  policies_count int;
BEGIN
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ Created % RLS policies', policies_count;
END $$;
