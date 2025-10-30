-- =============================================
-- Add koin_balance to profiles table
-- =============================================
-- This migration adds koin_balance column to profiles
-- to support taaruf request functionality
-- =============================================

-- Add koin_balance column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS koin_balance INTEGER NOT NULL DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.profiles.koin_balance IS 'User koin balance for ajukan taaruf (5 koin per request). 1 koin = 100 balance units in wallet system.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_koin_balance ON public.profiles(koin_balance) WHERE koin_balance > 0;

-- Add check constraint to prevent negative balance
ALTER TABLE public.profiles
ADD CONSTRAINT chk_koin_balance_non_negative CHECK (koin_balance >= 0);

-- =============================================
-- Update existing users with initial balance
-- =============================================
-- Give all existing registered users 10 koin as starting balance
UPDATE public.profiles
SET koin_balance = 10
WHERE registered_at IS NOT NULL
  AND koin_balance = 0;

COMMENT ON CONSTRAINT chk_koin_balance_non_negative ON public.profiles IS 'Ensures koin balance cannot go negative';
