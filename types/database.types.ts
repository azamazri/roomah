/**
 * Database types - 100% matching actual Supabase schema
 * Generated from schema audit and migration verification
 * Last updated: 2025-10-18
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS - Match database exactly
// ============================================================================

export type GenderEnum = 'IKHWAN' | 'AKHWAT'
export type GenderBackend = 'MALE' | 'FEMALE' // For backend compatibility

export type EducationEnum = 'SMA_SMK' | 'D3' | 'S1' | 'S2' | 'S3'

export type IncomeBracket = 'SAAT_TAARUF' | '0_2' | '2_5' | '5_10' | '10_PLUS'

export type CVStatus = 'DRAFT' | 'REVIEW' | 'REVISI' | 'APPROVED'

export type MaritalStatus = 'SINGLE' | 'JANDA' | 'DUDA'

export type TaarufRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export type TaarufSessionStatus = 'ACTIVE' | 'FINISHED' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'SETTLEMENT' | 'CANCEL' | 'EXPIRE' | 'REFUND' | 'CHARGEBACK'

export type LedgerType = 'CREDIT' | 'DEBIT'

export type LedgerReason = 'TOPUP' | 'TAARUF_COST' | 'ADJUSTMENT' | 'REFUND' | 'CHARGEBACK'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Profile {
  user_id: string
  email: string
  full_name: string | null
  gender: GenderEnum | null
  dob: string | null
  province_id: number | null
  education: EducationEnum | null
  occupation: string | null
  avatar_path: string | null
  is_admin: boolean
  registered_at: string | null
  koin_balance: number
  is_suspended: boolean
  is_verified: boolean
  last_active_at: string | null
  phone_number: string | null
  whatsapp_number: string | null
  telegram_username: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
}

export interface CVData {
  user_id: string
  candidate_code: string | null
  full_name: string
  birth_date: string
  gender: GenderEnum
  province_id: number
  education: EducationEnum
  occupation: string
  income_bracket: IncomeBracket
  height_cm: number
  weight_kg: number
  disease_history: string[] | null
  marital_status: MaritalStatus | null
  full_address: string | null
  ciri_fisik: string | null
  status: CVStatus
  allow_public: boolean
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface CVDetails {
  user_id: string
  worship_profile: Json
  family_background: Json
  spouse_criteria: Json
  marriage_plan: Json
  life_vision: Json | null
  created_at: string
  updated_at: string
}

export interface ApprovedCandidate {
  user_id: string
  candidate_code: string | null
  full_name: string
  birth_date: string
  age: number
  gender: GenderEnum
  gender_label: GenderBackend
  province_id: number
  province: string
  education: EducationEnum
  occupation: string
  income_bracket: IncomeBracket
  height_cm: number
  weight_kg: number
  allow_public: boolean
  cv_updated_at: string
  taaruf_status: 'DALAM_PROSES' | 'SIAP_BERTAARUF'
}

export interface TaarufRequest {
  id: string
  from_user: string
  to_user: string
  status: TaarufRequestStatus
  created_at: string
  expires_at: string
  responded_at: string | null
  reject_reason: string | null
}

export interface TaarufSession {
  id: string
  user_a: string
  user_b: string
  status: TaarufSessionStatus
  started_at: string
  ended_at: string | null
  created_at: string
}

export interface TaarufSessionReport {
  id: string
  session_id: string
  reporter_user: string
  reported_user: string
  report_category: string
  report_details: string
  evidence_url: string | null
  admin_note: string | null
  action_taken: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: LedgerType
  amount_cents: number
  reason: LedgerReason
  created_at: string
  idempotency_key: string | null
  linked_order_id: string | null
}

export interface KoinTopupOrder {
  order_id: string
  user_id: string
  amount_cents: number
  payment_type: string | null
  status: PaymentStatus
  snap_token: string | null
  raw_midtrans: Json | null
  created_at: string
  updated_at: string
  settled_at: string | null
}

export interface PaymentRefund {
  id: string
  transaction_id: string
  user_id: string
  amount_cents: number
  reason: string
  status: PaymentStatus
  admin_id: string | null
  admin_note: string | null
  processed_at: string | null
  refund_proof: string | null
  created_at: string
  updated_at: string
}

export interface Province {
  id: number
  name: string
}

export interface OnboardingVerification {
  user_id: string
  phone_verified: boolean
  email_verified: boolean
  identity_verified: boolean
  cv_submitted: boolean
  cv_approved: boolean
  profile_complete: boolean
  onboarding_completed: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface CVVerificationQueue {
  id: string
  user_id: string
  cv_user_id: string
  status: string
  priority: number
  assigned_admin: string | null
  submitted_at: string
  reviewed_at: string | null
  notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface UserSuspension {
  id: string
  user_id: string
  reason: string
  suspended_by: string
  suspended_at: string
  suspended_until: string | null
  is_permanent: boolean
  appeal_status: string | null
  appeal_text: string | null
  appeal_reviewed_by: string | null
  appeal_reviewed_at: string | null
  appeal_decision: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string
  changes: Json | null
  ip_address: string | null
  user_agent: string | null
  metadata: Json | null
  created_at: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_entity: string
  target_id: string
  details: Json | null
  ip_address: string | null
  created_at: string
}

export interface AdminFeatureFlag {
  id: string
  flag_name: string
  description: string | null
  enabled: boolean
  config: Json | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AdminPlatformSetting {
  id: string
  setting_key: string
  setting_value: Json
  description: string | null
  last_modified_by: string | null
  created_at: string
  updated_at: string
}

export interface DashboardMetric {
  id: string
  metric_type: string
  metric_date: string
  metric_value: number
  metadata: Json | null
  created_at: string
  updated_at: string
}

export interface SocialMediaAccount {
  id: string
  user_id: string
  platform: string
  account_handle: string
  account_url: string | null
  follower_count: number | null
  is_verified: boolean
  verification_screenshot: string | null
  verified_by: string | null
  verified_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface SocialMediaPlatformSetting {
  id: string
  platform: string
  is_enabled: boolean
  min_followers: number
  requires_verification: boolean
  icon_url: string | null
  display_name: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Sequence {
  seq_key: string
  current_value: number
  updated_at: string
}

// ============================================================================
// COMPATIBILITY VIEWS (for backend)
// ============================================================================

export interface WalletLedgerEntry {
  id: string
  user_id: string
  entry_type: LedgerType
  amount: number
  transaction_type: LedgerReason
  description: string
  metadata: Json
  created_at: string
}

export interface PaymentTransaction {
  id: string
  user_id: string
  order_id: string
  package_id: string
  amount: number
  amount_cents: number
  status: PaymentStatus
  payment_method: string
  created_at: string
  updated_at: string
}

// ============================================================================
// DATABASE TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      cv_data: {
        Row: CVData
        Insert: Omit<CVData, 'created_at' | 'updated_at'>
        Update: Partial<CVData>
      }
      cv_details: {
        Row: CVDetails
        Insert: Omit<CVDetails, 'created_at' | 'updated_at'>
        Update: Partial<CVDetails>
      }
      taaruf_requests: {
        Row: TaarufRequest
        Insert: Omit<TaarufRequest, 'id' | 'created_at'>
        Update: Partial<TaarufRequest>
      }
      taaruf_sessions: {
        Row: TaarufSession
        Insert: Omit<TaarufSession, 'id' | 'created_at'>
        Update: Partial<TaarufSession>
      }
      taaruf_session_reports: {
        Row: TaarufSessionReport
        Insert: Omit<TaarufSessionReport, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<TaarufSessionReport>
      }
      wallet_transactions: {
        Row: WalletTransaction
        Insert: Omit<WalletTransaction, 'id' | 'created_at'>
        Update: Partial<WalletTransaction>
      }
      koin_topup_orders: {
        Row: KoinTopupOrder
        Insert: Omit<KoinTopupOrder, 'created_at' | 'updated_at'>
        Update: Partial<KoinTopupOrder>
      }
      payment_refunds: {
        Row: PaymentRefund
        Insert: Omit<PaymentRefund, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<PaymentRefund>
      }
      provinces: {
        Row: Province
        Insert: Province
        Update: Partial<Province>
      }
      onboarding_verifications: {
        Row: OnboardingVerification
        Insert: Omit<OnboardingVerification, 'created_at' | 'updated_at'>
        Update: Partial<OnboardingVerification>
      }
      cv_verification_queue: {
        Row: CVVerificationQueue
        Insert: Omit<CVVerificationQueue, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<CVVerificationQueue>
      }
      user_suspensions: {
        Row: UserSuspension
        Insert: Omit<UserSuspension, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<UserSuspension>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: never
      }
      admin_actions_audit: {
        Row: AdminAction
        Insert: Omit<AdminAction, 'id' | 'created_at'>
        Update: never
      }
      admin_feature_flags: {
        Row: AdminFeatureFlag
        Insert: Omit<AdminFeatureFlag, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<AdminFeatureFlag>
      }
      admin_platform_settings: {
        Row: AdminPlatformSetting
        Insert: Omit<AdminPlatformSetting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<AdminPlatformSetting>
      }
      dashboard_metrics: {
        Row: DashboardMetric
        Insert: Omit<DashboardMetric, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<DashboardMetric>
      }
      social_media_accounts: {
        Row: SocialMediaAccount
        Insert: Omit<SocialMediaAccount, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<SocialMediaAccount>
      }
      social_media_platform_settings: {
        Row: SocialMediaPlatformSetting
        Insert: Omit<SocialMediaPlatformSetting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<SocialMediaPlatformSetting>
      }
      sequences: {
        Row: Sequence
        Insert: Omit<Sequence, 'updated_at'>
        Update: Partial<Sequence>
      }
    }
    Views: {
      approved_candidates_v: {
        Row: ApprovedCandidate
      }
      wallet_ledger_entries: {
        Row: WalletLedgerEntry
      }
      payment_transactions: {
        Row: PaymentTransaction
      }
    }
    Functions: {
      map_gender_to_backend: {
        Args: { g: GenderEnum }
        Returns: GenderBackend
      }
      map_gender_from_backend: {
        Args: { g: GenderBackend }
        Returns: GenderEnum
      }
      refresh_approved_candidates: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      gender_enum: GenderEnum
      education_enum: EducationEnum
      income_bracket_enum: IncomeBracket
      cv_status_enum: CVStatus
      marital_status_enum: MaritalStatus
      taaruf_request_status: TaarufRequestStatus
      taaruf_session_status: TaarufSessionStatus
      payment_status: PaymentStatus
      ledger_type: LedgerType
      ledger_reason: LedgerReason
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']
