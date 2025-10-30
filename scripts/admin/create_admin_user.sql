-- ========================================
-- CREATE ADMIN USER SCRIPT
-- ========================================
-- This script grants admin access to existing users
-- or helps create new admin accounts
-- 
-- Date: October 26, 2025
-- ========================================

-- ========================================
-- STEP 1: Create Auth User in Supabase Dashboard
-- ========================================
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- 
-- Or use this SQL if you have admin access:
-- 
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'admin@roomah.com',
--   crypt('your-secure-password', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- );

-- ========================================
-- STEP 2: Grant Admin Access to Existing User
-- ========================================

-- Option A: Grant by email
UPDATE public.profiles
SET 
  is_admin = true,
  updated_at = now()
WHERE email = 'admin@roomah.com'
RETURNING user_id, full_name, email, is_admin;

-- Option B: Grant by user_id (if you know the UUID)
-- UPDATE public.profiles
-- SET 
--   is_admin = true,
--   updated_at = now()
-- WHERE user_id = 'your-user-uuid-here'
-- RETURNING user_id, full_name, email, is_admin;

-- ========================================
-- STEP 3: Verify Admin User
-- ========================================

-- Check all admin users
SELECT 
  user_id,
  full_name,
  email,
  is_admin,
  is_suspended,
  created_at,
  updated_at
FROM public.profiles
WHERE is_admin = true
ORDER BY created_at DESC;

-- ========================================
-- STEP 4: Check Admin Count
-- ========================================

SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN is_suspended = false THEN 1 END) as active_admins,
  COUNT(CASE WHEN is_suspended = true THEN 1 END) as suspended_admins
FROM public.profiles
WHERE is_admin = true;

-- ========================================
-- USEFUL ADMIN MANAGEMENT QUERIES
-- ========================================

-- 1. Grant admin access to multiple users at once
-- UPDATE public.profiles
-- SET is_admin = true, updated_at = now()
-- WHERE email IN (
--   'admin1@roomah.com',
--   'admin2@roomah.com',
--   'admin3@roomah.com'
-- )
-- RETURNING email, is_admin;

-- 2. Remove admin access
-- UPDATE public.profiles
-- SET is_admin = false, updated_at = now()
-- WHERE email = 'user@roomah.com'
-- RETURNING email, is_admin;

-- 3. Suspend admin (keeps admin flag but blocks access)
-- UPDATE public.profiles
-- SET is_suspended = true, updated_at = now()
-- WHERE email = 'admin@roomah.com'
-- RETURNING email, is_admin, is_suspended;

-- 4. Unsuspend admin
-- UPDATE public.profiles
-- SET is_suspended = false, updated_at = now()
-- WHERE email = 'admin@roomah.com'
-- RETURNING email, is_admin, is_suspended;

-- 5. Find users who have registered but are not admin
-- SELECT user_id, full_name, email, registered_at
-- FROM public.profiles
-- WHERE is_admin = false
--   AND registered_at IS NOT NULL
-- ORDER BY registered_at DESC
-- LIMIT 10;

-- 6. Promote user to admin (with full info)
-- WITH promoted AS (
--   UPDATE public.profiles
--   SET is_admin = true, updated_at = now()
--   WHERE email = 'user@roomah.com'
--   RETURNING *
-- )
-- SELECT 
--   user_id,
--   full_name,
--   email,
--   is_admin,
--   gender,
--   birth_date,
--   registered_at,
--   created_at,
--   updated_at
-- FROM promoted;

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Check if profile exists for a user
-- SELECT * FROM public.profiles WHERE email = 'admin@roomah.com';

-- Check if auth user exists
-- SELECT id, email, email_confirmed_at, created_at 
-- FROM auth.users 
-- WHERE email = 'admin@roomah.com';

-- Find profiles without auth users (orphaned profiles)
-- SELECT p.user_id, p.email, p.full_name
-- FROM public.profiles p
-- LEFT JOIN auth.users u ON p.user_id = u.id
-- WHERE u.id IS NULL;

-- Find auth users without profiles
-- SELECT u.id, u.email, u.created_at
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.user_id
-- WHERE p.user_id IS NULL;

-- ========================================
-- SECURITY NOTES
-- ========================================
-- 
-- 1. Always use strong passwords for admin accounts
-- 2. Limit number of admin users (principle of least privilege)
-- 3. Regularly audit admin access logs
-- 4. Use is_suspended flag instead of deleting admin access
-- 5. Consider implementing 2FA for admin accounts (future)
-- 
-- ========================================

-- ========================================
-- TESTING CHECKLIST
-- ========================================
-- 
-- After running this script:
-- 
-- [ ] Verify admin flag is set in profiles table
-- [ ] Test login at /admin/login
-- [ ] Test access to /admin/dashboard
-- [ ] Test access to all 7 admin pages:
--     [ ] /admin/dashboard
--     [ ] /admin/verifikasi-cv
--     [ ] /admin/manajemen-akun
--     [ ] /admin/proses-taaruf
--     [ ] /admin/koin-transaksi
--     [ ] /admin/medsos
--     [ ] /admin/pengaturan
-- [ ] Test logout at /admin/logout
-- [ ] Verify non-admin users cannot access admin panel
-- 
-- ========================================
