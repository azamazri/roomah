-- =====================================================
-- Migration: 12 - RLS Helper Functions
-- Description: Helper functions for RLS policies
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- FUNCTION: is_admin
-- Check if current user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND is_admin = true
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 
  'Security definer function - checks if current user has admin privileges';

-- =====================================================
-- FUNCTION: get_user_gender
-- Get current user's gender
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_gender()
RETURNS public.gender_enum
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT gender 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_user_gender() IS 
  'Returns authenticated user gender for opposite gender filtering';
