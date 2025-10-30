-- =============================================
-- IMPORT CV DATA WITH AUTO-APPROVE
-- =============================================
-- This script imports CV data and automatically approves them
-- Also generates candidate_code for each CV
-- =============================================

-- =============================================
-- STEP 1: Create Temporary Staging Tables
-- =============================================

-- Staging table for CV basic data
CREATE TEMP TABLE IF NOT EXISTS temp_cv_data (
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_place TEXT NOT NULL,
  current_city TEXT NOT NULL,
  province_id TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Staging table for CV detailed data
CREATE TEMP TABLE IF NOT EXISTS temp_cv_details (
  user_email TEXT NOT NULL,
  pendidikan_terakhir TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  penghasilan TEXT NOT NULL,
  status_pernikahan TEXT NOT NULL,
  tinggi_badan INTEGER NOT NULL,
  berat_badan INTEGER NOT NULL,
  tentang_diri TEXT,
  motivasi_menikah TEXT,
  harapan_pasangan TEXT
);

-- =============================================
-- STEP 2: INSERT YOUR DATA HERE
-- =============================================

-- Example: Insert CV Basic Data
INSERT INTO temp_cv_data (user_email, full_name, gender, birth_date, birth_place, current_city, province_id, phone) VALUES
  ('john.ikhwan@example.com', 'Ahmad Rizki', 'IKHWAN', '1995-05-15', 'Jakarta', 'Bandung', '32', '081234567890'),
  ('jane.akhwat@example.com', 'Siti Aminah', 'AKHWAT', '1997-08-20', 'Surabaya', 'Surabaya', '35', '081298765432'),
  ('ali.muslim@example.com', 'Ali Rahman', 'IKHWAN', '1993-12-10', 'Yogyakarta', 'Sleman', '34', '081233334444');

-- Example: Insert CV Detailed Data
INSERT INTO temp_cv_details (user_email, pendidikan_terakhir, pekerjaan, penghasilan, status_pernikahan, tinggi_badan, berat_badan, tentang_diri, motivasi_menikah, harapan_pasangan) VALUES
  ('john.ikhwan@example.com', 'S1', 'Software Engineer', '5_10', 'SINGLE', 170, 65, 'Saya adalah seorang muslim yang taat dan pekerja keras', 'Ingin melengkapi separuh agama dan membangun keluarga sakinah', 'Saya mencari pasangan yang sholehah dan mendukung'),
  ('jane.akhwat@example.com', 'S1', 'Guru', '2_5', 'SINGLE', 160, 50, 'Saya adalah muslimah yang aktif di kegiatan sosial', 'Mencari ridho Allah dengan menikah', 'Mencari suami yang bertanggung jawab'),
  ('ali.muslim@example.com', 'S2', 'Dosen', '10_PLUS', 'DUDA', 175, 70, 'Akademisi yang mencintai ilmu dan dakwah', 'Ingin menikah lagi untuk kebaikan anak-anak', 'Pasangan yang sabar dan bisa jadi ibu yang baik');

-- =============================================
-- STEP 3: Validate Data
-- =============================================

-- Check for users that don't exist in profiles
DO $$
DECLARE
  missing_users TEXT[];
BEGIN
  SELECT ARRAY_AGG(user_email) INTO missing_users
  FROM temp_cv_data t
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.email = t.user_email
  );
  
  IF missing_users IS NOT NULL AND array_length(missing_users, 1) > 0 THEN
    RAISE NOTICE 'WARNING: The following emails do not exist in auth.users: %', missing_users;
    RAISE NOTICE 'These records will be skipped. Please create users first or remove from import.';
  END IF;
END $$;

-- Check for invalid enum values
DO $$
BEGIN
  -- Check gender
  IF EXISTS (SELECT 1 FROM temp_cv_data WHERE gender NOT IN ('IKHWAN', 'AKHWAT')) THEN
    RAISE EXCEPTION 'Invalid gender value. Must be IKHWAN or AKHWAT';
  END IF;
  
  -- Check education
  IF EXISTS (SELECT 1 FROM temp_cv_details WHERE pendidikan_terakhir NOT IN ('SMA_SMK', 'D3', 'S1', 'S2', 'S3')) THEN
    RAISE EXCEPTION 'Invalid pendidikan_terakhir. Must be SMA_SMK, D3, S1, S2, or S3';
  END IF;
  
  -- Check income bracket
  IF EXISTS (SELECT 1 FROM temp_cv_details WHERE penghasilan NOT IN ('SAAT_TAARUF', '0_2', '2_5', '5_10', '10_PLUS')) THEN
    RAISE EXCEPTION 'Invalid penghasilan. Must be SAAT_TAARUF, 0_2, 2_5, 5_10, or 10_PLUS';
  END IF;
  
  -- Check marital status
  IF EXISTS (SELECT 1 FROM temp_cv_details WHERE status_pernikahan NOT IN ('SINGLE', 'JANDA', 'DUDA')) THEN
    RAISE EXCEPTION 'Invalid status_pernikahan. Must be SINGLE, JANDA, or DUDA';
  END IF;
  
  RAISE NOTICE '✅ All enum values are valid';
END $$;

-- =============================================
-- STEP 4: Insert into cv_data with AUTO-APPROVE
-- =============================================

INSERT INTO cv_data (
  user_id,
  full_name,
  birth_date,
  birth_place,
  current_city,
  province_id,
  phone,
  status,
  candidate_code,
  approved_at,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  t.full_name,
  t.birth_date,
  t.birth_place,
  t.current_city,
  t.province_id,
  t.phone,
  'APPROVED'::cv_status_enum as status,
  generate_candidate_code(t.gender::gender_enum) as candidate_code,
  NOW() as approved_at,
  NOW() as created_at,
  NOW() as updated_at
FROM temp_cv_data t
INNER JOIN auth.users u ON u.email = t.user_email
ON CONFLICT (user_id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  birth_date = EXCLUDED.birth_date,
  birth_place = EXCLUDED.birth_place,
  current_city = EXCLUDED.current_city,
  province_id = EXCLUDED.province_id,
  phone = EXCLUDED.phone,
  status = 'APPROVED'::cv_status_enum,
  candidate_code = COALESCE(cv_data.candidate_code, EXCLUDED.candidate_code),
  approved_at = COALESCE(cv_data.approved_at, NOW()),
  updated_at = NOW();

-- =============================================
-- STEP 5: Insert into cv_details
-- =============================================

INSERT INTO cv_details (
  user_id,
  pendidikan_terakhir,
  pekerjaan,
  penghasilan,
  status_pernikahan,
  tinggi_badan,
  berat_badan,
  tentang_diri,
  motivasi_menikah,
  harapan_pasangan,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  t.pendidikan_terakhir::education_enum,
  t.pekerjaan,
  t.penghasilan::income_bracket_enum,
  t.status_pernikahan::marital_status_enum,
  t.tinggi_badan,
  t.berat_badan,
  t.tentang_diri,
  t.motivasi_menikah,
  t.harapan_pasangan,
  NOW() as created_at,
  NOW() as updated_at
FROM temp_cv_details t
INNER JOIN auth.users u ON u.email = t.user_email
ON CONFLICT (user_id) DO UPDATE
SET
  pendidikan_terakhir = EXCLUDED.pendidikan_terakhir,
  pekerjaan = EXCLUDED.pekerjaan,
  penghasilan = EXCLUDED.penghasilan,
  status_pernikahan = EXCLUDED.status_pernikahan,
  tinggi_badan = EXCLUDED.tinggi_badan,
  berat_badan = EXCLUDED.berat_badan,
  tentang_diri = EXCLUDED.tentang_diri,
  motivasi_menikah = EXCLUDED.motivasi_menikah,
  harapan_pasangan = EXCLUDED.harapan_pasangan,
  updated_at = NOW();

-- =============================================
-- STEP 6: Summary Report
-- =============================================

DO $$
DECLARE
  cv_data_count INTEGER;
  cv_details_count INTEGER;
  approved_count INTEGER;
BEGIN
  -- Count imported records
  SELECT COUNT(*) INTO cv_data_count FROM cv_data WHERE approved_at >= NOW() - INTERVAL '1 minute';
  SELECT COUNT(*) INTO cv_details_count FROM cv_details WHERE updated_at >= NOW() - INTERVAL '1 minute';
  SELECT COUNT(*) INTO approved_count FROM cv_data WHERE status = 'APPROVED' AND approved_at >= NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE '';
  RAISE NOTICE '======================================';
  RAISE NOTICE 'IMPORT SUMMARY';
  RAISE NOTICE '======================================';
  RAISE NOTICE '✅ CV Data imported: %', cv_data_count;
  RAISE NOTICE '✅ CV Details imported: %', cv_details_count;
  RAISE NOTICE '✅ Auto-approved CVs: %', approved_count;
  RAISE NOTICE '======================================';
  RAISE NOTICE '';
END $$;

-- =============================================
-- STEP 7: Show Imported Data
-- =============================================

SELECT 
  cd.candidate_code,
  cd.full_name,
  u.email,
  cd.status,
  cd.approved_at,
  cdd.pekerjaan,
  cdd.pendidikan_terakhir
FROM cv_data cd
INNER JOIN auth.users u ON u.id = cd.user_id
LEFT JOIN cv_details cdd ON cdd.user_id = cd.user_id
WHERE cd.approved_at >= NOW() - INTERVAL '1 minute'
ORDER BY cd.candidate_code;

-- =============================================
-- CLEANUP: Drop Temporary Tables
-- =============================================

DROP TABLE IF EXISTS temp_cv_data;
DROP TABLE IF EXISTS temp_cv_details;

-- =============================================
-- DONE!
-- =============================================
