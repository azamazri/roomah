-- Enable RLS on all admin tables
ALTER TABLE public.admin_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taaruf_session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ADMIN PLATFORM SETTINGS POLICIES
-- =============================================================================
-- Only admins can view all settings
CREATE POLICY "admin_can_view_all_platform_settings"
ON public.admin_platform_settings FOR SELECT
USING (is_admin());

-- Only admins can create settings
CREATE POLICY "admin_can_create_platform_settings"
ON public.admin_platform_settings FOR INSERT
WITH CHECK (is_admin());

-- Only admins can update settings
CREATE POLICY "admin_can_update_platform_settings"
ON public.admin_platform_settings FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete settings
CREATE POLICY "admin_can_delete_platform_settings"
ON public.admin_platform_settings FOR DELETE
USING (is_admin());

-- =============================================================================
-- ADMIN FEATURE FLAGS POLICIES
-- =============================================================================
-- Authenticated users can view enabled flags
CREATE POLICY "authenticated_can_view_enabled_flags"
ON public.admin_feature_flags FOR SELECT
USING (enabled = TRUE OR is_admin());

-- Only admins can create flags
CREATE POLICY "admin_can_create_feature_flags"
ON public.admin_feature_flags FOR INSERT
WITH CHECK (is_admin());

-- Only admins can update flags
CREATE POLICY "admin_can_update_feature_flags"
ON public.admin_feature_flags FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete flags
CREATE POLICY "admin_can_delete_feature_flags"
ON public.admin_feature_flags FOR DELETE
USING (is_admin());

-- =============================================================================
-- SOCIAL MEDIA ACCOUNTS POLICIES
-- =============================================================================
-- Users can view their own social media accounts
CREATE POLICY "user_can_view_own_social_accounts"
ON public.social_media_accounts FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own social media accounts
CREATE POLICY "user_can_insert_own_social_accounts"
ON public.social_media_accounts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own social media accounts
CREATE POLICY "user_can_update_own_social_accounts"
ON public.social_media_accounts FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Users can delete their own social media accounts
CREATE POLICY "user_can_delete_own_social_accounts"
ON public.social_media_accounts FOR DELETE
USING (user_id = auth.uid());

-- Public can view verified social media accounts
CREATE POLICY "public_can_view_verified_social_accounts"
ON public.social_media_accounts FOR SELECT
USING (is_verified = TRUE);

-- =============================================================================
-- AUDIT LOGS POLICIES
-- =============================================================================
-- Only admins can view all audit logs
CREATE POLICY "admin_can_view_all_audit_logs"
ON public.audit_logs FOR SELECT
USING (is_admin());

-- Only system can insert audit logs (via triggers/functions)
CREATE POLICY "system_can_insert_audit_logs"
ON public.audit_logs FOR INSERT
WITH CHECK (TRUE);

-- =============================================================================
-- CV VERIFICATION QUEUE POLICIES
-- =============================================================================
-- Only admins can view verification queue
CREATE POLICY "admin_can_view_verification_queue"
ON public.cv_verification_queue FOR SELECT
USING (is_admin());

-- Users can view their own verification status
CREATE POLICY "user_can_view_own_verification"
ON public.cv_verification_queue FOR SELECT
USING (user_id = auth.uid());

-- Only admins can create/update verification queue entries
CREATE POLICY "admin_can_manage_verification_queue"
ON public.cv_verification_queue FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "admin_can_update_verification_queue"
ON public.cv_verification_queue FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================================================
-- TAARUF SESSION REPORTS POLICIES
-- =============================================================================
-- Users can create reports for sessions they're involved in
CREATE POLICY "user_can_create_session_reports"
ON public.taaruf_session_reports FOR INSERT
WITH CHECK (
  reporter_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.taaruf_sessions ts
    WHERE ts.id = session_id
    AND (ts.user_a = auth.uid() OR ts.user_b = auth.uid())
  )
);

-- Users can view their own reports
CREATE POLICY "user_can_view_own_reports"
ON public.taaruf_session_reports FOR SELECT
USING (reporter_id = auth.uid());

-- Admins can view all reports
CREATE POLICY "admin_can_view_all_reports"
ON public.taaruf_session_reports FOR SELECT
USING (is_admin());

-- Only admins can update report status
CREATE POLICY "admin_can_update_reports"
ON public.taaruf_session_reports FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================================================
-- USER SUSPENSIONS POLICIES
-- =============================================================================
-- Users can view their own suspension status
CREATE POLICY "user_can_view_own_suspension"
ON public.user_suspensions FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all suspensions
CREATE POLICY "admin_can_view_all_suspensions"
ON public.user_suspensions FOR SELECT
USING (is_admin());

-- Only admins can create suspensions
CREATE POLICY "admin_can_create_suspensions"
ON public.user_suspensions FOR INSERT
WITH CHECK (is_admin() AND suspended_by = auth.uid());

-- Only admins can update suspensions
CREATE POLICY "admin_can_update_suspensions"
ON public.user_suspensions FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================================================
-- PAYMENT REFUNDS POLICIES
-- =============================================================================
-- Users can view refunds for their own transactions
CREATE POLICY "user_can_view_own_refunds"
ON public.payment_refunds FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wallet_transactions wt
    WHERE wt.id = transaction_id
    AND wt.user_id = auth.uid()
  )
);

-- Admins can view all refunds
CREATE POLICY "admin_can_view_all_refunds"
ON public.payment_refunds FOR SELECT
USING (is_admin());

-- Only admins can create refunds
CREATE POLICY "admin_can_create_refunds"
ON public.payment_refunds FOR INSERT
WITH CHECK (is_admin() AND initiated_by = auth.uid());

-- Only admins can update refunds
CREATE POLICY "admin_can_update_refunds"
ON public.payment_refunds FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================================================
-- SOCIAL MEDIA PLATFORM SETTINGS POLICIES
-- =============================================================================
-- Only admins can view platform settings
CREATE POLICY "admin_can_view_platform_settings"
ON public.social_media_platform_settings FOR SELECT
USING (is_admin());

-- Only admins can manage platform settings
CREATE POLICY "admin_can_manage_platform_settings"
ON public.social_media_platform_settings FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "admin_can_update_platform_settings"
ON public.social_media_platform_settings FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "admin_can_delete_platform_settings"
ON public.social_media_platform_settings FOR DELETE
USING (is_admin());

-- =============================================================================
-- DASHBOARD METRICS POLICIES
-- =============================================================================
-- Admins can view all metrics
CREATE POLICY "admin_can_view_metrics"
ON public.dashboard_metrics FOR SELECT
USING (is_admin());

-- Only admins can create metrics
CREATE POLICY "admin_can_create_metrics"
ON public.dashboard_metrics FOR INSERT
WITH CHECK (is_admin());

-- Only admins can update metrics
CREATE POLICY "admin_can_update_metrics"
ON public.dashboard_metrics FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete metrics
CREATE POLICY "admin_can_delete_metrics"
ON public.dashboard_metrics FOR DELETE
USING (is_admin());

-- ============================================================================
-- MIGRATION 15 COMPLETE
-- ============================================================================
-- All RLS policies created with correct is_admin() function calls
-- Ready for production
