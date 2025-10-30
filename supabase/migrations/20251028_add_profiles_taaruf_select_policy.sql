-- =====================================================
-- Migration: Add profiles SELECT policy for taaruf participants
-- Description: Allow users to view profiles of people they have taaruf requests with
-- Date: 2025-10-28
-- =====================================================

-- Allow users to view profiles of people in their taaruf requests
CREATE POLICY "profiles_select_taaruf_participants"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- User can see profile if they have a taaruf_request (either as sender or receiver)
    EXISTS (
      SELECT 1
      FROM public.taaruf_requests tr
      WHERE (
        (tr.from_user = auth.uid() AND tr.to_user = profiles.user_id)
        OR
        (tr.to_user = auth.uid() AND tr.from_user = profiles.user_id)
      )
    )
  );

-- Also allow viewing cv_data for taaruf participants
CREATE POLICY "cv_data_select_taaruf_participants"
  ON public.cv_data
  FOR SELECT
  TO authenticated
  USING (
    -- User can see CV if they have a taaruf_request with this user
    EXISTS (
      SELECT 1
      FROM public.taaruf_requests tr
      WHERE (
        (tr.from_user = auth.uid() AND tr.to_user = cv_data.user_id)
        OR
        (tr.to_user = auth.uid() AND tr.from_user = cv_data.user_id)
      )
    )
  );

-- Also allow viewing cv_details for taaruf participants
CREATE POLICY "cv_details_select_taaruf_participants"
  ON public.cv_details
  FOR SELECT
  TO authenticated
  USING (
    -- User can see CV details if they have a taaruf_request with this user
    EXISTS (
      SELECT 1
      FROM public.taaruf_requests tr
      WHERE (
        (tr.from_user = auth.uid() AND tr.to_user = cv_details.user_id)
        OR
        (tr.to_user = auth.uid() AND tr.from_user = cv_details.user_id)
      )
    )
  );

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ Added profiles/cv_data/cv_details SELECT policies for taaruf participants';
END $$;
