-- =====================================================
-- Migration: Create social media posts table
-- Description: Track CV posting requests to social media by users
-- Date: 2025-10-28
-- =====================================================

-- Create enum for social media post status
CREATE TYPE public.social_media_post_status AS ENUM ('PENDING', 'POSTED');

-- Create social_media_posts table
CREATE TABLE public.social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status public.social_media_post_status NOT NULL DEFAULT 'PENDING',
  posted_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_social_media_posts_user_id ON public.social_media_posts(user_id);
CREATE INDEX idx_social_media_posts_status ON public.social_media_posts(status, created_at DESC);

-- Add RLS policies
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own posts
CREATE POLICY "social_media_posts_select_own"
  ON public.social_media_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own posts
CREATE POLICY "social_media_posts_insert_own"
  ON public.social_media_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can view all posts
CREATE POLICY "social_media_posts_select_admin"
  ON public.social_media_posts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin can update all posts
CREATE POLICY "social_media_posts_update_admin"
  ON public.social_media_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Add visibility column to cv_data (for toggle show/hide in candidate cards)
ALTER TABLE public.cv_data ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

-- Add index
CREATE INDEX IF NOT EXISTS idx_cv_data_is_visible ON public.cv_data(is_visible) WHERE is_visible = true;

-- Comments
COMMENT ON TABLE public.social_media_posts IS 'User requests to post their CV on Roomah social media channels';
COMMENT ON COLUMN public.social_media_posts.user_id IS 'User who requested the social media post';
COMMENT ON COLUMN public.social_media_posts.status IS 'PENDING: waiting for admin to post, POSTED: successfully posted';
COMMENT ON COLUMN public.social_media_posts.posted_by IS 'Admin who posted the CV to social media';
COMMENT ON COLUMN public.social_media_posts.posted_at IS 'Timestamp when CV was posted to social media';
COMMENT ON COLUMN public.cv_data.is_visible IS 'Toggle to show/hide user CV in candidate cards (default: true)';

-- Verify
DO $$
DECLARE
  table_count int;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'social_media_posts';
  
  IF table_count = 1 THEN
    RAISE NOTICE '✓ Table social_media_posts created successfully';
  ELSE
    RAISE WARNING '✗ Failed to create table social_media_posts';
  END IF;
END $$;
