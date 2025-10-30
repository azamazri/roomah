-- =============================================
-- IMPORT CV DATA (CORRECT VERSION)
-- =============================================
-- Berdasarkan struktur database SEBENARNYA dari audit
-- AUTO-APPROVE + Auto-generate candidate_code
-- =============================================

-- =============================================
-- STEP 1: Create Temporary Staging Tables
-- =============================================

CREATE TEMP TABLE IF NOT EXISTS temp_cv_data (
  user_email TEXT NOT NULL,
  gender TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  province_id SMALLINT NOT NULL,
  education TEXT NOT NULL,
  occupation TEXT NOT NULL,
  income_bracket TEXT NOT NULL,
  height_cm INTEGER NOT NULL,
  weight_kg INTEGER NOT NULL,
  marital_status TEXT NOT NULL,
  full_address TEXT,
  ciri_fisik TEXT,
  disease_history TEXT
);

CREATE TEMP TABLE IF NOT EXISTS temp_cv_details (
  user_email TEXT NOT NULL,
  -- Family Background
  family_father_name TEXT,
  family_mother_name TEXT,
  family_siblings_count INTEGER,
  family_birth_order INTEGER,
  -- Worship Profile
  worship_sholat TEXT,
  worship_quran TEXT,
  worship_tazkiyah TEXT,
  worship_dakwah TEXT,
  -- Spouse Criteria
  spouse_min_age INTEGER,
  spouse_max_age INTEGER,
  spouse_preferred_education TEXT,
  spouse_preferred_traits TEXT,
  -- Marriage Plan
  marriage_readiness TEXT,
  marriage_target_date TEXT,
  marriage_dowry_ability TEXT,
  marriage_housing_plan TEXT
);

-- =============================================
-- STEP 2: INSERT YOUR DATA HERE
-- =============================================
-- Replace with your actual data

-- Example CV Data
INSERT INTO temp_cv_data (
  user_email, gender, full_name, birth_date, province_id, education, occupation, 
  income_bracket, height_cm, weight_kg, marital_status, full_address, ciri_fisik, disease_history
) VALUES
  ('ahmad@example.com', 'IKHWAN', 'Ahmad Rizki', '1995-05-15', 32, 'S1', 'Software Engineer', '5_10', 170, 65, 'SINGLE', 'Jl. Merdeka No. 10, Bandung', 'Berkulit sawo matang, rambut hitam', 'Tidak ada'),
  ('siti@example.com', 'AKHWAT', 'Siti Aminah', '1997-08-20', 35, 'S1', 'Guru', '2_5', 160, 50, 'SINGLE', 'Jl. Pahlawan No. 5, Surabaya', 'Berkulit putih, berhijab', 'Tidak ada'),
  ('ali@example.com', 'IKHWAN', 'Ali Rahman', '1993-12-10', 34, 'S2', 'Dosen', '10_PLUS', 175, 70, 'DUDA', 'Jl. Gejayan No. 15, Yogyakarta', 'Berkacamata, berjenggot tipis', 'Tidak ada');

-- Example CV Details
INSERT INTO temp_cv_details (
  user_email, family_father_name, family_mother_name, family_siblings_count, family_birth_order,
  worship_sholat, worship_quran, worship_tazkiyah, worship_dakwah,
  spouse_min_age, spouse_max_age, spouse_preferred_education, spouse_preferred_traits,
  marriage_readiness, marriage_target_date, marriage_dowry_ability, marriage_housing_plan
) VALUES
  ('ahmad@example.com', 'Bapak Ahmad Sr', 'Ibu Siti', 3, 1, '5 waktu rutin berjamaah', 'Setiap hari minimal 1 halaman', 'Aktif kajian mingguan', 'Aktif dakwah kampus', 22, 28, 'Minimal S1', 'Sholehah dan taat beribadah', 'Siap menikah dalam 6 bulan', '2025-06', 'Rp 10-20 juta', 'Sudah punya rumah kontrakan'),
  ('siti@example.com', 'Bapak Rahman', 'Ibu Aminah', 2, 2, '5 waktu di rumah', 'Setiap hari 2 halaman', 'Aktif halaqah', 'Mengajar TPQ', 28, 35, 'Minimal S1', 'Bertanggung jawab dan komitmen', 'Siap menikah dalam 3 bulan', '2025-03', 'Mahar sesuai kesepakatan', 'Tinggal bersama orang tua dulu'),
  ('ali@example.com', 'Bapak Abdullah', 'Ibu Fatimah', 4, 3, '5 waktu berjamaah masjid', 'Setiap hari 3 halaman', 'Aktif taklim rutin', 'Khutbah Jumat', 25, 32, 'Minimal SMA', 'Sabar dan bisa mendidik anak', 'Siap menikah secepatnya', '2025-01', 'Rp 15-25 juta', 'Sudah punya rumah sendiri');

-- =============================================
-- STEP 3: Validate Data
-- =============================================

DO $$
DECLARE
  missing_users TEXT[];
  v_count INTEGER;
BEGIN
  -- Check for users that don't exist
  SELECT ARRAY_AGG(user_email) INTO missing_users
  FROM temp_cv_data t
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.email = t.user_email
  );
  
  IF missing_users IS NOT NULL AND array_length(missing_users, 1) > 0 THEN
    RAISE WARNING 'These emails do not exist in auth.users: %', missing_users;
    RAISE WARNING 'They will be skipped. Create users first or remove from import.';
  END IF;
  
  -- Validate gender
  SELECT COUNT(*) INTO v_count FROM temp_cv_data WHERE gender NOT IN ('IKHWAN', 'AKHWAT');
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Invalid gender value. Must be IKHWAN or AKHWAT';
  END IF;
  
  -- Validate education
  SELECT COUNT(*) INTO v_count FROM temp_cv_data WHERE education NOT IN ('SMA_SMK', 'D3', 'S1', 'S2', 'S3');
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Invalid education. Must be SMA_SMK, D3, S1, S2, or S3';
  END IF;
  
  -- Validate income
  SELECT COUNT(*) INTO v_count FROM temp_cv_data WHERE income_bracket NOT IN ('SAAT_TAARUF', '0_2', '2_5', '5_10', '10_PLUS');
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Invalid income_bracket. Must be SAAT_TAARUF, 0_2, 2_5, 5_10, or 10_PLUS';
  END IF;
  
  -- Validate marital status
  SELECT COUNT(*) INTO v_count FROM temp_cv_data WHERE marital_status NOT IN ('SINGLE', 'JANDA', 'DUDA');
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Invalid marital_status. Must be SINGLE, JANDA, or DUDA';
  END IF;
  
  RAISE NOTICE '✅ All validations passed';
END $$;

-- =============================================
-- STEP 4: Insert into cv_data (AUTO-APPROVE)
-- =============================================

INSERT INTO cv_data (
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
  marital_status,
  full_address,
  ciri_fisik,
  disease_history,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  'APPROVED'::cv_status_enum as status,
  true as allow_public,
  generate_candidate_code(t.gender::gender_enum) as candidate_code,
  t.gender::gender_enum,
  t.full_name,
  t.birth_date,
  t.province_id,
  t.education::education_enum,
  t.occupation,
  t.income_bracket::income_bracket_enum,
  t.height_cm,
  t.weight_kg,
  t.marital_status::marital_status_enum,
  t.full_address,
  t.ciri_fisik,
  CASE 
    WHEN t.disease_history IS NULL OR TRIM(t.disease_history) = '' OR LOWER(TRIM(t.disease_history)) = 'tidak ada' 
    THEN NULL 
    ELSE ARRAY[t.disease_history]::text[]
  END as disease_history,
  NOW() as created_at,
  NOW() as updated_at
FROM temp_cv_data t
INNER JOIN auth.users u ON u.email = t.user_email
ON CONFLICT (user_id) DO UPDATE
SET
  status = 'APPROVED'::cv_status_enum,
  gender = EXCLUDED.gender,
  full_name = EXCLUDED.full_name,
  birth_date = EXCLUDED.birth_date,
  province_id = EXCLUDED.province_id,
  education = EXCLUDED.education,
  occupation = EXCLUDED.occupation,
  income_bracket = EXCLUDED.income_bracket,
  height_cm = EXCLUDED.height_cm,
  weight_kg = EXCLUDED.weight_kg,
  marital_status = EXCLUDED.marital_status,
  full_address = EXCLUDED.full_address,
  ciri_fisik = EXCLUDED.ciri_fisik,
  disease_history = EXCLUDED.disease_history,
  candidate_code = COALESCE(cv_data.candidate_code, EXCLUDED.candidate_code),
  updated_at = NOW();

-- =============================================
-- STEP 5: Insert into cv_details
-- =============================================

INSERT INTO cv_details (
  user_id,
  family_background,
  worship_profile,
  spouse_criteria,
  marriage_plan,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  jsonb_build_object(
    'father_name', t.family_father_name,
    'mother_name', t.family_mother_name,
    'siblings_count', t.family_siblings_count,
    'birth_order', t.family_birth_order
  ) as family_background,
  jsonb_build_object(
    'sholat', t.worship_sholat,
    'quran', t.worship_quran,
    'tazkiyah', t.worship_tazkiyah,
    'dakwah', t.worship_dakwah
  ) as worship_profile,
  jsonb_build_object(
    'min_age', t.spouse_min_age,
    'max_age', t.spouse_max_age,
    'preferred_education', t.spouse_preferred_education,
    'preferred_traits', t.spouse_preferred_traits
  ) as spouse_criteria,
  jsonb_build_object(
    'readiness', t.marriage_readiness,
    'target_date', t.marriage_target_date,
    'dowry_ability', t.marriage_dowry_ability,
    'housing_plan', t.marriage_housing_plan
  ) as marriage_plan,
  NOW() as created_at,
  NOW() as updated_at
FROM temp_cv_details t
INNER JOIN auth.users u ON u.email = t.user_email
ON CONFLICT (user_id) DO UPDATE
SET
  family_background = EXCLUDED.family_background,
  worship_profile = EXCLUDED.worship_profile,
  spouse_criteria = EXCLUDED.spouse_criteria,
  marriage_plan = EXCLUDED.marriage_plan,
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
  SELECT COUNT(*) INTO cv_data_count 
  FROM cv_data 
  WHERE updated_at >= NOW() - INTERVAL '1 minute';
  
  SELECT COUNT(*) INTO cv_details_count 
  FROM cv_details 
  WHERE updated_at >= NOW() - INTERVAL '1 minute';
  
  SELECT COUNT(*) INTO approved_count 
  FROM cv_data 
  WHERE status = 'APPROVED' 
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '         IMPORT SUMMARY';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ CV Data imported: %', cv_data_count;
  RAISE NOTICE '✅ CV Details imported: %', cv_details_count;
  RAISE NOTICE '✅ Auto-approved CVs: %', approved_count;
  RAISE NOTICE '==========================================';
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
  cd.gender,
  cd.education,
  cd.occupation,
  cd.marital_status
FROM cv_data cd
INNER JOIN auth.users u ON u.id = cd.user_id
WHERE cd.updated_at >= NOW() - INTERVAL '1 minute'
ORDER BY cd.candidate_code;

-- =============================================
-- CLEANUP
-- =============================================

DROP TABLE IF EXISTS temp_cv_data;
DROP TABLE IF EXISTS temp_cv_details;

-- =============================================
-- DONE!
-- =============================================
