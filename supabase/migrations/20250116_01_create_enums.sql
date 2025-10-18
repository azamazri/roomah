-- =====================================================
-- Migration: 01 - Create Enums
-- Description: Define all enum types for type safety
-- Author: Roomah Development Team
-- Date: 2025-01-16
-- =====================================================

-- Gender enum
CREATE TYPE public.gender_enum AS ENUM ('IKHWAN', 'AKHWAT');

-- Income bracket (safe labels for privacy)
CREATE TYPE public.income_bracket_enum AS ENUM (
  'SAAT_TAARUF',  -- Will disclose during ta'aruf
  '0_2',          -- 0-2 juta/bulan
  '2_5',          -- 2-5 juta/bulan
  '5_10',         -- 5-10 juta/bulan
  '10_PLUS'       -- >10 juta/bulan
);

-- Education level
CREATE TYPE public.education_enum AS ENUM ('SMA_SMK', 'D3', 'S1', 'S2', 'S3');

-- CV Status (no REJECTED to avoid dead-end)
CREATE TYPE public.cv_status_enum AS ENUM ('DRAFT', 'REVIEW', 'REVISI', 'APPROVED');

-- Taaruf Request Status
CREATE TYPE public.taaruf_request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- Taaruf Session Status
CREATE TYPE public.taaruf_session_status AS ENUM ('ACTIVE', 'FINISHED');

-- Ledger Type
CREATE TYPE public.ledger_type AS ENUM ('CREDIT', 'DEBIT');

-- Ledger Reason
CREATE TYPE public.ledger_reason AS ENUM (
  'TOPUP',
  'TAARUF_COST',
  'ADJUSTMENT',
  'REFUND',
  'CHARGEBACK'
);

-- Payment Status (aligned with Midtrans)
CREATE TYPE public.payment_status AS ENUM (
  'PENDING',
  'SETTLEMENT',
  'CANCEL',
  'EXPIRE',
  'REFUND',
  'CHARGEBACK'
);

-- Comments
COMMENT ON TYPE public.gender_enum IS 'Gender classification: IKHWAN (male) or AKHWAT (female)';
COMMENT ON TYPE public.income_bracket_enum IS 'Income ranges with privacy option (SAAT_TAARUF)';
COMMENT ON TYPE public.education_enum IS 'Education levels from high school to doctorate';
COMMENT ON TYPE public.cv_status_enum IS 'CV workflow statuses - no REJECTED to encourage revision';
COMMENT ON TYPE public.taaruf_request_status IS 'Ta''aruf proposal statuses with auto-expiration';
COMMENT ON TYPE public.taaruf_session_status IS 'Ta''aruf session lifecycle';
COMMENT ON TYPE public.ledger_type IS 'Ledger entry types for wallet transactions';
COMMENT ON TYPE public.ledger_reason IS 'Transaction reasons for audit trail';
COMMENT ON TYPE public.payment_status IS 'Payment statuses aligned with Midtrans gateway';
