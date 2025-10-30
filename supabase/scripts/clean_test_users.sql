-- Script untuk membersihkan test users
-- PERINGATAN: Ini akan menghapus user test dari database!
-- Jalankan di Supabase SQL Editor

-- 1. Lihat daftar user yang akan dihapus (kecuali admin)
SELECT 
  user_id,
  email,
  full_name,
  is_admin,
  registered_at,
  created_at
FROM profiles
WHERE is_admin = false
ORDER BY created_at DESC;

-- 2. Hapus data terkait user (uncomment untuk menjalankan)
/*
-- Hapus CV data
DELETE FROM cv_details WHERE user_id IN (
  SELECT user_id FROM profiles WHERE is_admin = false
);

DELETE FROM cv_data WHERE user_id IN (
  SELECT user_id FROM profiles WHERE is_admin = false
);

-- Hapus verifikasi onboarding
DELETE FROM onboarding_verifications WHERE user_id IN (
  SELECT user_id FROM profiles WHERE is_admin = false
);

-- Hapus wallet transactions
DELETE FROM wallet_transactions WHERE user_id IN (
  SELECT user_id FROM profiles WHERE is_admin = false
);

-- Hapus profiles
DELETE FROM profiles WHERE is_admin = false;

-- Hapus dari auth.users (HATI-HATI!)
DELETE FROM auth.users WHERE id IN (
  SELECT id FROM auth.users 
  WHERE id NOT IN (
    SELECT user_id FROM profiles WHERE is_admin = true
  )
);
*/

-- 3. Verifikasi setelah penghapusan
SELECT COUNT(*) as total_users FROM profiles;
SELECT COUNT(*) as non_admin_users FROM profiles WHERE is_admin = false;
