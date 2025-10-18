-- ============================================================================
-- Migration: Add Missing Columns for Backend Compatibility
-- Date: 2025-10-18
-- Purpose: Add admin_note, suspension fields, and avatar_url for backend alignment
-- ============================================================================

-- 1. Add admin_note column to cv_data for revision notes
ALTER TABLE public.cv_data 
ADD COLUMN IF NOT EXISTS admin_note text;

COMMENT ON COLUMN public.cv_data.admin_note IS 'Admin notes when CV is marked for revision';

-- 2. Add suspension fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS suspension_reason text,
ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.is_suspended IS 'Whether the user account is suspended';
COMMENT ON COLUMN public.profiles.suspension_reason IS 'Reason for account suspension';
COMMENT ON COLUMN public.profiles.suspended_at IS 'Timestamp when account was suspended';
COMMENT ON COLUMN public.profiles.suspended_by IS 'Admin who suspended the account';

-- 3. Add avatar_url column to profiles (computed from avatar_path)
-- This allows backward compatibility while storage uses avatar_path
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS 'Public URL for avatar (generated from avatar_path)';

-- 4. Create index for suspension queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended 
ON public.profiles(is_suspended) 
WHERE is_suspended = true;

-- 5. Create index for admin_note queries (when CV is in REVISI status)
CREATE INDEX IF NOT EXISTS idx_cv_data_admin_note 
ON public.cv_data(status) 
WHERE status = 'REVISI' AND admin_note IS NOT NULL;

-- ============================================================================
-- Verification Queries (commented out, for reference)
-- ============================================================================

-- Check if columns were added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name IN ('profiles', 'cv_data')
--   AND column_name IN ('admin_note', 'is_suspended', 'suspension_reason', 'suspended_at', 'suspended_by', 'avatar_url')
-- ORDER BY table_name, ordinal_position;
