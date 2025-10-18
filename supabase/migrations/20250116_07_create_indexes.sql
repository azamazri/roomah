-- =====================================================
-- Migration: 07 - Create Indexes
-- Description: All indexes for performance optimization
-- Total: 38 indexes
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- PROFILES INDEXES
-- =====================================================
CREATE INDEX idx_profiles_gender ON public.profiles(gender) WHERE gender IS NOT NULL;
CREATE INDEX idx_profiles_province ON public.profiles(province_id) WHERE province_id IS NOT NULL;
CREATE INDEX idx_profiles_registered ON public.profiles(registered_at) WHERE registered_at IS NOT NULL;
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- =====================================================
-- CV_DATA INDEXES
-- =====================================================
CREATE INDEX idx_cv_status ON public.cv_data(status);
CREATE INDEX idx_cv_candidate_code ON public.cv_data(candidate_code) WHERE candidate_code IS NOT NULL;
CREATE INDEX idx_cv_gender ON public.cv_data(gender) WHERE gender IS NOT NULL;
CREATE INDEX idx_cv_province ON public.cv_data(province_id) WHERE province_id IS NOT NULL;
CREATE INDEX idx_cv_education ON public.cv_data(education) WHERE education IS NOT NULL;
-- Partial index for MV refresh performance
CREATE INDEX idx_cv_public_approved ON public.cv_data(user_id) 
  WHERE status = 'APPROVED' AND allow_public = true;

-- =====================================================
-- CV_DETAILS INDEXES (JSONB GIN)
-- =====================================================
CREATE INDEX idx_cv_details_family ON public.cv_details USING GIN (family_background);
CREATE INDEX idx_cv_details_worship ON public.cv_details USING GIN (worship_profile);
CREATE INDEX idx_cv_details_spouse ON public.cv_details USING GIN (spouse_criteria);
CREATE INDEX idx_cv_details_marriage ON public.cv_details USING GIN (marriage_plan);

-- =====================================================
-- TAARUF_REQUESTS INDEXES
-- =====================================================
CREATE INDEX idx_taaruf_from_user ON public.taaruf_requests(from_user, status);
CREATE INDEX idx_taaruf_to_user ON public.taaruf_requests(to_user, status);
CREATE INDEX idx_taaruf_status ON public.taaruf_requests(status);
-- Partial index for cleanup job (expired requests)
CREATE INDEX idx_taaruf_expires_at ON public.taaruf_requests(expires_at) 
  WHERE status = 'PENDING';

-- =====================================================
-- TAARUF_SESSIONS INDEXES
-- =====================================================
CREATE INDEX idx_taaruf_sessions_user_a ON public.taaruf_sessions(user_a, status);
CREATE INDEX idx_taaruf_sessions_user_b ON public.taaruf_sessions(user_b, status);
CREATE INDEX idx_taaruf_sessions_code ON public.taaruf_sessions(taaruf_code);
CREATE INDEX idx_taaruf_sessions_status ON public.taaruf_sessions(status);
-- Partial unique indexes: enforce single active taaruf per user
CREATE UNIQUE INDEX idx_taaruf_active_user_a ON public.taaruf_sessions(user_a) 
  WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX idx_taaruf_active_user_b ON public.taaruf_sessions(user_b) 
  WHERE status = 'ACTIVE';

-- =====================================================
-- KOIN_TOPUP_ORDERS INDEXES
-- =====================================================
CREATE INDEX idx_orders_user_id ON public.koin_topup_orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.koin_topup_orders(status);
CREATE INDEX idx_orders_settled_at ON public.koin_topup_orders(settled_at) 
  WHERE settled_at IS NOT NULL;

-- =====================================================
-- WALLET_LEDGER_ENTRIES INDEXES
-- =====================================================
CREATE INDEX idx_ledger_user_id ON public.wallet_ledger_entries(user_id, created_at DESC);
CREATE INDEX idx_ledger_type_reason ON public.wallet_ledger_entries(type, reason);
CREATE INDEX idx_ledger_order_id ON public.wallet_ledger_entries(linked_order_id) 
  WHERE linked_order_id IS NOT NULL;
CREATE INDEX idx_ledger_idempotency ON public.wallet_ledger_entries(idempotency_key);

-- =====================================================
-- SEQUENCES INDEXES
-- =====================================================
CREATE INDEX idx_sequences_updated ON public.sequences(updated_at);

-- =====================================================
-- PROVINCES INDEXES
-- =====================================================
CREATE INDEX idx_provinces_name ON public.provinces(name);

-- =====================================================
-- ADMIN_ACTIONS_AUDIT INDEXES
-- =====================================================
CREATE INDEX idx_audit_admin_id ON public.admin_actions_audit(admin_id, created_at DESC);
CREATE INDEX idx_audit_action ON public.admin_actions_audit(action, created_at DESC);
CREATE INDEX idx_audit_target ON public.admin_actions_audit(target_table, target_id);
CREATE INDEX idx_audit_correlation ON public.admin_actions_audit(correlation_id) 
  WHERE correlation_id IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON INDEX idx_cv_public_approved IS 'Optimize MV refresh query - filters approved & public CVs';
COMMENT ON INDEX idx_taaruf_expires_at IS 'Optimize cleanup job for expired taaruf requests';
COMMENT ON INDEX idx_taaruf_active_user_a IS 'Enforce business rule: max 1 active taaruf per user (user_a)';
COMMENT ON INDEX idx_taaruf_active_user_b IS 'Enforce business rule: max 1 active taaruf per user (user_b)';
COMMENT ON INDEX idx_ledger_idempotency IS 'Prevent duplicate transactions via idempotency key';
