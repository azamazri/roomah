-- =====================================================
-- Migration: Add INSERT policy for profiles
-- Description: Allow users to insert their own profile during registration
-- Date: 2025-01-18
-- =====================================================

-- Allow authenticated users to insert their own profile
-- This is needed for OAuth registration flow
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Note: This allows users to create their profile ONCE during registration.
-- The registered_at field will be NULL initially (onboarding incomplete).
-- It gets set to timestamp when onboarding completes.
