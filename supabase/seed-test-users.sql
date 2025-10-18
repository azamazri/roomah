-- ============================================================================
-- SEED TEST USERS FOR TAARUF TESTING
-- Run this in Supabase SQL Editor
-- ============================================================================

-- IMPORTANT: These are test UUIDs. In production, auth.users creates real UUIDs.
-- For testing, we'll create users directly in auth.users first.

-- ============================================================================
-- 1. CREATE AUTH USERS (Run in Supabase SQL Editor)
-- ============================================================================

-- User A - Ikhwan (Male)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ikhwan@test.com',
  crypt('password123', gen_salt('bf')), -- Password: password123
  now(),
  now(),
  now(),
  '{"full_name": "Ahmad Ikhwan"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- User B - Akhwat (Female)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'akhwat@test.com',
  crypt('password123', gen_salt('bf')), -- Password: password123
  now(),
  now(),
  now(),
  '{"full_name": "Fatimah Akhwat"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CREATE PROFILES
-- ============================================================================

INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  gender,
  dob,
  province_id,
  education,
  occupation,
  is_admin,
  registered_at,
  created_at,
  updated_at
) VALUES 
  -- User A - Ikhwan
  (
    '11111111-1111-1111-1111-111111111111',
    'ikhwan@test.com',
    'Ahmad Ikhwan',
    'IKHWAN',
    '1995-01-15',
    6, -- DKI Jakarta
    'S1',
    'Software Engineer',
    false,
    now(),
    now(),
    now()
  ),
  -- User B - Akhwat
  (
    '22222222-2222-2222-2222-222222222222',
    'akhwat@test.com',
    'Fatimah Akhwat',
    'AKHWAT',
    '1997-05-20',
    6, -- DKI Jakarta
    'S1',
    'Graphic Designer',
    false,
    now(),
    now(),
    now()
  )
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  gender = EXCLUDED.gender,
  dob = EXCLUDED.dob,
  province_id = EXCLUDED.province_id,
  education = EXCLUDED.education,
  occupation = EXCLUDED.occupation;

-- ============================================================================
-- 3. CREATE ONBOARDING VERIFICATIONS (5Q Completed)
-- ============================================================================

INSERT INTO public.onboarding_verifications (
  user_id,
  q1, q2, q3, q4, q5,
  committed,
  created_at,
  updated_at
) VALUES 
  ('11111111-1111-1111-1111-111111111111', true, true, true, true, true, false, now(), now()),
  ('22222222-2222-2222-2222-222222222222', true, true, true, true, true, false, now(), now())
ON CONFLICT (user_id) DO UPDATE SET
  q1 = EXCLUDED.q1,
  q2 = EXCLUDED.q2,
  q3 = EXCLUDED.q3,
  q4 = EXCLUDED.q4,
  q5 = EXCLUDED.q5;

-- ============================================================================
-- 4. CREATE CV DATA (APPROVED with candidate codes)
-- ============================================================================

-- Generate candidate codes first
INSERT INTO public.sequences (seq_key, last_number, updated_at)
VALUES 
  ('CANDIDATE_IKHWAN', 1, now()),
  ('CANDIDATE_AKHWAT', 1, now())
ON CONFLICT (seq_key) DO UPDATE SET
  last_number = GREATEST(public.sequences.last_number, EXCLUDED.last_number);

INSERT INTO public.cv_data (
  user_id,
  status,
  allow_public,
  candidate_code,
  gender,
  full_name,
  birth_date,
  province_id,
  education,
  occupation,
  income_bracket,
  height_cm,
  weight_kg,
  disease_history,
  created_at,
  updated_at
) VALUES 
  -- User A - Ikhwan
  (
    '11111111-1111-1111-1111-111111111111',
    'APPROVED',
    true,
    'IKHWAN1',
    'IKHWAN',
    'Ahmad Ikhwan',
    '1995-01-15',
    6,
    'S1',
    'Software Engineer',
    '5_10',
    175,
    70,
    'Tidak ada',
    now(),
    now()
  ),
  -- User B - Akhwat
  (
    '22222222-2222-2222-2222-222222222222',
    'APPROVED',
    true,
    'AKHWAT1',
    'AKHWAT',
    'Fatimah Akhwat',
    '1997-05-20',
    6,
    'S1',
    'Graphic Designer',
    '2_5',
    160,
    55,
    'Tidak ada',
    now(),
    now()
  )
ON CONFLICT (user_id) DO UPDATE SET
  status = EXCLUDED.status,
  candidate_code = EXCLUDED.candidate_code,
  allow_public = EXCLUDED.allow_public;

-- ============================================================================
-- 5. CREATE WALLET BALANCES (Give both users 10 koin = 1000 cents)
-- ============================================================================

INSERT INTO public.wallet_transactions (
  user_id,
  type,
  amount_cents,
  reason,
  description,
  created_at
) VALUES 
  -- User A - Initial balance
  (
    '11111111-1111-1111-1111-111111111111',
    'CREDIT',
    1000, -- 10 koin
    'TOPUP',
    'Saldo awal testing',
    now()
  ),
  -- User B - Initial balance
  (
    '22222222-2222-2222-2222-222222222222',
    'CREDIT',
    1000, -- 10 koin
    'TOPUP',
    'Saldo awal testing',
    now()
  );

-- ============================================================================
-- 6. REFRESH MATERIALIZED VIEW
-- ============================================================================

REFRESH MATERIALIZED VIEW public.approved_candidates_v;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check users created
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.gender,
  cv.status as cv_status,
  cv.candidate_code,
  cv.allow_public
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.cv_data cv ON u.id = cv.user_id
WHERE u.email IN ('ikhwan@test.com', 'akhwat@test.com');

-- Check wallet balances
SELECT 
  p.full_name,
  COALESCE(SUM(CASE WHEN wt.type = 'CREDIT' THEN wt.amount_cents ELSE 0 END) -
           SUM(CASE WHEN wt.type = 'DEBIT' THEN wt.amount_cents ELSE 0 END), 0) / 100 as koin_balance
FROM public.profiles p
LEFT JOIN public.wallet_transactions wt ON p.user_id = wt.user_id
WHERE p.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
GROUP BY p.full_name;

-- Check approved candidates in materialized view
SELECT 
  candidate_code,
  full_name,
  gender_label,
  age,
  province,
  education,
  taaruf_status
FROM public.approved_candidates_v
WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
TEST CREDENTIALS:

User A (Ikhwan):
  Email: ikhwan@test.com
  Password: password123
  Candidate Code: IKHWAN1
  Balance: 10 koin
  CV Status: APPROVED

User B (Akhwat):
  Email: akhwat@test.com
  Password: password123
  Candidate Code: AKHWAT1
  Balance: 10 koin
  CV Status: APPROVED

Ready for testing:
1. Login sebagai ikhwan@test.com
2. Browse kandidat → akan muncul AKHWAT1
3. Ajukan ta'aruf → koin terpotong 5
4. Logout, login sebagai akhwat@test.com
5. Lihat CV Masuk → terima/tolak
6. Check Taaruf Aktif
*/
