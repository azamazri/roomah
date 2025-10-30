-- =====================================================
-- Insert Profiles for First 15 Users
-- These users have been created in Supabase Auth
-- Data populated from datauser.csv
-- =====================================================

-- Insert into profiles table with full CV data
INSERT INTO public.profiles (
  user_id, email, full_name, gender, dob, province_id, 
  education, occupation, created_at, updated_at
)
VALUES
  ('878953b1-360a-4fc5-aa1b-af8ff9e2b67e', 'userroomah1@gmail.com', 'Rizky Aditya Putri', CAST('AKHWAT' AS gender_enum), '1993-06-13', 9, CAST('S1' AS education_enum), 'Guru PPPK', NOW(), NOW()),
  ('80247b16-8c38-4225-90fb-d484305ea989', 'userroomah2@gmail.com', 'SPF', CAST('AKHWAT' AS gender_enum), '2000-12-31', 9, CAST('S1' AS education_enum), 'Guru TK', NOW(), NOW()),
  ('c435789e-251c-4be0-baa3-3939d4dfcfa0', 'userroomah3@gmail.com', 'Mei Syarah Syafrina S', CAST('AKHWAT' AS gender_enum), '1995-05-21', 9, CAST('S1' AS education_enum), 'Dokter Umum', NOW(), NOW()),
  ('3775a697-5156-41be-94a6-7e0c35b17366', 'userroomah4@gmail.com', 'Ayu Yulia A', CAST('AKHWAT' AS gender_enum), '1998-12-30', 9, CAST('S2' AS education_enum), 'Guru', NOW(), NOW()),
  ('50aa71a3-a551-4b5d-8566-35aba799052c', 'userroomah5@gmail.com', 'Dwi Rahmah Najiibah', CAST('AKHWAT' AS gender_enum), '1997-07-11', 6, CAST('S1' AS education_enum), 'Content Analisis', NOW(), NOW()),
  ('25ed4f28-5820-4304-92a7-de0b5513ad37', 'userroomah6@gmail.com', 'NAP', CAST('AKHWAT' AS gender_enum), '1997-09-26', 6, CAST('S2' AS education_enum), 'Startup & Ada Foundation', NOW(), NOW()),
  ('4cd63c6b-6d05-4635-8d30-f6f0bf1a5fc1', 'userroomah7@gmail.com', 'Nina Ariyanti', CAST('AKHWAT' AS gender_enum), '1996-09-11', 3, CAST('S1' AS education_enum), 'Freelance', NOW(), NOW()),
  ('0dd480d1-da64-4007-9666-e07460d36952', 'userroomah8@gmail.com', 'Annisa', CAST('AKHWAT' AS gender_enum), '1993-01-15', 36, CAST('S1' AS education_enum), 'Bantu ortu', NOW(), NOW()),
  ('5c759c6e-6f1c-431a-8e5d-a625a1740619', 'userroomah9@gmail.com', 'Ferawati', CAST('AKHWAT' AS gender_enum), '1993-01-20', 32, CAST('S1' AS education_enum), 'Wirausaha', NOW(), NOW()),
  ('3a71d6bf-e784-40b7-aed0-f4ff67d5eea9', 'userroomah10@gmail.com', 'Devi Pratiwi', CAST('AKHWAT' AS gender_enum), '1997-12-13', 3, CAST('S1' AS education_enum), 'Karyawan', NOW(), NOW()),
  ('c430ad1d-2d70-4bd7-8442-23b27c623e08', 'userroomah11@gmail.com', 'S', CAST('AKHWAT' AS gender_enum), '1991-09-23', 11, CAST('S1' AS education_enum), 'Swasta', NOW(), NOW()),
  ('1fc8c148-91da-4178-bff2-02f0a8ab4424', 'userroomah12@gmail.com', 'Khaerunnisa', CAST('AKHWAT' AS gender_enum), '1997-01-19', 32, CAST('S2' AS education_enum), 'Admin', NOW(), NOW()),
  ('39034ae2-2e11-4ceb-97d1-80327e5ef1c4', 'userroomah13@gmail.com', 'Elin Herlina', CAST('AKHWAT' AS gender_enum), '1995-09-27', 9, CAST('S1' AS education_enum), 'Karyawan Swasta', NOW(), NOW()),
  ('b3779c83-74c7-4b76-afe1-23df1041dc2e', 'userroomah14@gmail.com', 'Mardiani', CAST('AKHWAT' AS gender_enum), '1993-08-18', 3, CAST('S2' AS education_enum), 'Pengajar', NOW(), NOW()),
  ('9dbda8d0-9425-4343-add5-30a243ef0cf2', 'userroomah15@gmail.com', 'Elva Fatimatul Zahroh', CAST('AKHWAT' AS gender_enum), '1997-04-11', 3, CAST('S1' AS education_enum), 'Guru', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Verify insertion
SELECT 
  user_id,
  email,
  created_at
FROM public.profiles
WHERE email LIKE 'userroomah%'
ORDER BY email;

-- Count total profiles
SELECT COUNT(*) as total_profiles 
FROM public.profiles 
WHERE email LIKE 'userroomah%';
