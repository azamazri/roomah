-- =====================================================
-- Import CV Data from datauser.csv (CORRECTED VERSION)
-- Total records: 99 users
-- Generated: 2025-10-23
-- =====================================================

-- IMPORTANT: This script uses SUBQUERY to lookup user_id from profiles table by email
-- Structure based on actual database audit:
-- - Primary Key: user_id (UUID from profiles)
-- - disease_history: TEXT[] (array, not JSONB)
-- - Province ID 39 = Luar Negeri

-- Insert cv_data records
INSERT INTO public.cv_data (
  user_id, gender, full_name, birth_date, province_id,
  education, occupation, income_bracket, height_cm, weight_kg,
  marital_status, full_address, ciri_fisik, disease_history
) 
SELECT 
  p.user_id,
  CAST(data.gender AS gender_enum),
  data.full_name,
  CAST(data.birth_date AS date),
  data.province_id,
  CAST(data.education AS education_enum),
  data.occupation,
  CAST(data.income_bracket AS income_bracket_enum),
  data.height_cm,
  data.weight_kg,
  CAST(data.marital_status AS marital_status_enum),
  data.full_address,
  data.ciri_fisik,
  ARRAY[data.disease]::text[]
FROM (VALUES
  ('userroomah1@gmail.com', 'AKHWAT', 'Rizky Aditya Putri', '1993-06-13', 9, 'S1', 'Guru PPPK', 'SAAT_TAARUF', 158, 55, 'JANDA', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Kulit sawo matang', 'Tidak ada'),
  ('userroomah2@gmail.com', 'AKHWAT', 'SPF', '2000-12-31', 9, 'S1', 'Guru TK', 'SAAT_TAARUF', 160, 70, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Agak berisi, putih, pakai kerudung', 'Tidak ada'),
  ('userroomah3@gmail.com', 'AKHWAT', 'Mei Syarah Syafrina S', '1995-05-21', 9, 'S1', 'Dokter Umum', 'SAAT_TAARUF', 150, 58, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Kulit Putih, Berisi, InshaaAllah manis', 'Tidak ada'),
  ('userroomah4@gmail.com', 'AKHWAT', 'Ayu Yulia A', '1998-12-30', 9, 'S2', 'Guru', 'SAAT_TAARUF', 160, 68, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Ada tahi lalat di hidung', 'Tidak ada'),
  ('userroomah5@gmail.com', 'AKHWAT', 'Dwi Rahmah Najiibah', '1997-07-11', 6, 'S1', 'Content Analisis', 'SAAT_TAARUF', 155, 65, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'Berhijab, pipi chubby, tidak terlalu tinggi.', 'Tidak ada'),
  ('userroomah6@gmail.com', 'AKHWAT', 'NAP', '1997-09-26', 6, 'S2', 'Startup & Ada Foundation', 'SAAT_TAARUF', 162, 60, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'Putih, Berhijab, Good Looking, Ceria, Creative, Bisa Masak', 'Tidak ada'),
  ('userroomah7@gmail.com', 'AKHWAT', 'Nina Ariyanti', '1996-09-11', 3, 'S1', 'Freelance', 'SAAT_TAARUF', 155, 60, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kulit kuning langsat', 'Tidak ada'),
  ('userroomah8@gmail.com', 'AKHWAT', 'Annisa', '1993-01-15', 36, 'S1', 'Bantu ortu', 'SAAT_TAARUF', 162, 70, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Mancung, kulit sawo matang', 'Tidak ada'),
  ('userroomah9@gmail.com', 'AKHWAT', 'Ferawati', '1993-01-20', 32, 'S1', 'Wirausaha', 'SAAT_TAARUF', 143, 44, 'SINGLE', 'Alamat lengkap di Sulawesi Selatan (belum dilengkapi)', 'Kulit kuning langsat, alis tebal, berpakaian syar''i', 'Tidak ada'),
  ('userroomah10@gmail.com', 'AKHWAT', 'Devi Pratiwi', '1997-12-13', 3, 'S1', 'Karyawan', 'SAAT_TAARUF', 145, 42, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kulit sawo matang', 'Tidak ada'),
  ('userroomah11@gmail.com', 'AKHWAT', 'S', '1991-09-23', 11, 'S1', 'Swasta', 'SAAT_TAARUF', 153, 40, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Physicly saya tidak terlalu memalukan jika dikenalkan ke kerabat atau keluarga hehe, cukup manis lah, berkacamata,, warna kulit standar wanita indonesia', 'Tidak ada'),
  ('userroomah12@gmail.com', 'AKHWAT', 'Khaerunnisa', '1997-01-19', 32, 'S2', 'Admin', 'SAAT_TAARUF', 156, 55, 'SINGLE', 'Alamat lengkap di Sulawesi Selatan (belum dilengkapi)', 'kulit kuning langsat,', 'Tidak ada'),
  ('userroomah13@gmail.com', 'AKHWAT', 'Elin Herlina', '1995-09-27', 9, 'S1', 'Karyawan Swasta', 'SAAT_TAARUF', 160, 52, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Sawo matang, tinggi, pakai kacamata, sedang perawatan behel,', 'Tidak ada'),
  ('userroomah14@gmail.com', 'AKHWAT', 'Mardiani', '1993-08-18', 3, 'S2', 'Pengajar', 'SAAT_TAARUF', 155, 49, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Sedang perawatan behel, warna kulit kuning langsat,ada tahil lalat di atas alis kanan.', 'Tidak ada'),
  ('userroomah15@gmail.com', 'AKHWAT', 'Elva Fatimatul Zahroh', '1997-04-11', 3, 'S1', 'Guru', 'SAAT_TAARUF', 150, 65, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kulit kuning langsat, rambut lurus, bercadar', 'Tidak ada'),
  ('userroomah16@gmail.com', 'AKHWAT', 'Destri yuni', '1996-06-16', 36, 'S1', 'PPPK kabupaten Pesisir Selatan', 'SAAT_TAARUF', 157, 80, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Punya tahi lalat di dahi', 'Tidak ada'),
  ('userroomah17@gmail.com', 'AKHWAT', 'LG', '2000-10-12', 10, 'S1', 'Guru & Freelancer Digital Marketing', 'SAAT_TAARUF', 170, 85, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Tinggi berisi (Sedang proses diet sehat)', 'Tidak ada'),
  ('userroomah18@gmail.com', 'AKHWAT', 'PS', '2000-10-12', 10, 'S1', 'Guru & Freelance Digital Marketing', 'SAAT_TAARUF', 170, 85, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Tinggi berisi (sedang diet)', 'Tidak ada'),
  ('userroomah19@gmail.com', 'AKHWAT', 'Dinda indria', '1995-05-31', 11, 'S1', 'Usaha properti pribadi', 'SAAT_TAARUF', 158, 65, 'JANDA', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Sawo matang,berisi, janda cerai mati dengan 1 anak laki2.', 'Tidak ada'),
  ('userroomah20@gmail.com', 'AKHWAT', 'Nuratni Krisnamurti', '1998-05-25', 10, 'S1', 'Belum ada karena 4 bulan setelah resign', 'SAAT_TAARUF', 155, 45, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Hidung mungil, sawo matang, ada bekas jerawat di pipi', 'Tidak ada'),
  ('userroomah21@gmail.com', 'AKHWAT', 'Nida Karina', '1998-02-05', 6, 'S1', 'Karyawan Swasta', 'SAAT_TAARUF', 162, 75, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'kulit sawo matang, berhijab, bisa masak', 'Tidak ada'),
  ('userroomah22@gmail.com', 'AKHWAT', 'HANY IRA KUSUMAWARDANI', '1999-08-15', 9, 'S1', 'Guru Honorer', 'SAAT_TAARUF', 163, 50, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Sawo Matang, Kurus,', 'Tidak ada'),
  ('userroomah23@gmail.com', 'AKHWAT', 'Cut Ifriza', '1992-08-18', 1, 'S1', 'Tidak bekerja', 'SAAT_TAARUF', 155, 50, 'SINGLE', 'Alamat lengkap di Aceh (belum dilengkapi)', 'Sawo matang, alis nyambung, hidung mancung', 'Tidak ada'),
  ('userroomah24@gmail.com', 'AKHWAT', 'Irma Shinta Rahmadhani', '1998-01-10', 9, 'S1', 'Mengajar', 'SAAT_TAARUF', 160, 50, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Kuning langsat, berhijab', 'Tidak ada'),
  ('userroomah25@gmail.com', 'IKHWAN', 'Pawit Suwito', '1995-07-13', 5, 'S1', 'Staff HRD', 'SAAT_TAARUF', 158, 56, 'SINGLE', 'Alamat lengkap di DI Yogyakarta (belum dilengkapi)', 'Putih, Hidung mancung, Rambut Lurus', 'Tidak ada'),
  ('userroomah26@gmail.com', 'AKHWAT', 'Syahudatul Arifa', '1994-07-16', 4, 'S1', 'Dokter', 'SAAT_TAARUF', 160, 58, 'SINGLE', 'Alamat lengkap di Bengkulu (belum dilengkapi)', 'Mata sipit', 'Tidak ada'),
  ('userroomah27@gmail.com', 'AKHWAT', 'Ai Laela Sari', '1997-03-08', 9, 'S1', 'Guru', 'SAAT_TAARUF', 145, 53, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Sawo matang, mata belo', 'Tidak ada'),
  ('userroomah28@gmail.com', 'AKHWAT', 'Disya Putri Pajrianti', '2003-03-16', 9, 'SMA_SMK', 'Mahasiswi', 'SAAT_TAARUF', 170, 89, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Tinggi,gemuk,berkacamata,warna kulit sawo matang', 'Tidak ada'),
  ('userroomah29@gmail.com', 'IKHWAN', 'Tresna', '1989-12-03', 9, 'D3', 'Aparatur Sipil Negara di Pemda', 'SAAT_TAARUF', 177, 80, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Tinggi', 'Tidak ada'),
  ('userroomah30@gmail.com', 'AKHWAT', 'Ayu Miranda Umar', '1997-06-18', 19, 'S2', 'Sedang Mencari Pekerjaan', 'SAAT_TAARUF', 155, 80, 'SINGLE', 'Alamat lengkap di Lampung (belum dilengkapi)', 'chubby, berjilbab, agak putih', 'Tidak ada'),
  ('userroomah31@gmail.com', 'AKHWAT', 'Dini Zahirotul Aisy', '1997-09-30', 10, 'D3', 'Perawat', 'SAAT_TAARUF', 155, 55, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Sawo matang, berhijab', 'Tidak ada'),
  ('userroomah32@gmail.com', 'IKHWAN', 'M', '1993-06-24', 39, 'S1', 'Engineer', 'SAAT_TAARUF', 167, 68, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Berkacamata', 'Tidak ada'),
  ('userroomah33@gmail.com', 'AKHWAT', 'Siti Sarah', '1996-07-01', 6, 'S1', 'Guru', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'Berlesung pipi', 'Tidak ada'),
  ('userroomah34@gmail.com', 'AKHWAT', 'Siti Sarah', '1996-07-01', 6, 'S1', 'Guru', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'Berlesung pipi', 'Tidak ada'),
  ('userroomah35@gmail.com', 'AKHWAT', 'Zulfatul laily', '1995-07-04', 19, 'S1', 'Guru Madrasah', 'SAAT_TAARUF', 148, 50, 'SINGLE', 'Alamat lengkap di Lampung (belum dilengkapi)', 'Berkacamata, kulit putih, pipi chubby', 'Tidak ada'),
  ('userroomah36@gmail.com', 'AKHWAT', 'Hany Nuraeni', '1998-11-13', 9, 'S1', 'Guru', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Chubby, kulit sawo matang', 'Tidak ada'),
  ('userroomah37@gmail.com', 'AKHWAT', 'Mulia Lestari', '1998-03-27', 1, 'S2', 'Guru', 'SAAT_TAARUF', 161, 50, 'SINGLE', 'Alamat lengkap di Aceh (belum dilengkapi)', 'Kulit sawo matang; Hidung mancung; Kurus; Tidak ada yang spesial tapi kata mama aku manis dan cantik.', 'Tidak ada'),
  ('userroomah38@gmail.com', 'AKHWAT', 'A', '1995-06-26', 36, 'S1', 'Remote', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Tidak ada', 'Tidak ada'),
  ('userroomah39@gmail.com', 'AKHWAT', 'Selvi Aprianti', '1998-04-14', 9, 'S1', 'Karyawan swasta', 'SAAT_TAARUF', 154, 53, 'JANDA', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Tidak ada', 'Tidak ada'),
  ('userroomah40@gmail.com', 'AKHWAT', 'NJ', '1998-09-19', 32, 'S1', 'Finance Administration Officer (Admin)', 'SAAT_TAARUF', 155, 45, 'SINGLE', 'Alamat lengkap di Sulawesi Selatan (belum dilengkapi)', 'Kulit sawo matang', 'Tidak ada'),
  ('userroomah41@gmail.com', 'AKHWAT', 'Linda Pebriani', '1998-02-11', 5, 'S2', 'Accountant', 'SAAT_TAARUF', 152, 47, 'SINGLE', 'Alamat lengkap di DI Yogyakarta (belum dilengkapi)', 'Tidak ada cacat fisik, kecil menggemaskan, pipi chubby hidung pesek.', 'Tidak ada'),
  ('userroomah42@gmail.com', 'AKHWAT', 'Pahriya Aisaturrohimah (Ria)', '2001-05-17', 39, 'S1', 'Pengolahan Makanan', 'SAAT_TAARUF', 158, 56, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Mata sipit', 'Tidak ada'),
  ('userroomah43@gmail.com', 'AKHWAT', 'Jameela', '1988-03-20', 32, 'S2', 'Dosen', 'SAAT_TAARUF', 145, 60, 'SINGLE', 'Alamat lengkap di Sulawesi Selatan (belum dilengkapi)', 'Pendek gemuk', 'Tidak ada'),
  ('userroomah44@gmail.com', 'AKHWAT', 'Dessy runita', '1998-01-02', 39, 'S1', 'Magang jepang', 'SAAT_TAARUF', 163, 60, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Berkacamata', 'Tidak ada'),
  ('userroomah45@gmail.com', 'AKHWAT', 'Nadia Novita', '1997-07-01', 11, 'S1', 'Guru', 'SAAT_TAARUF', 156, 49, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Kulit sawo matang, berat badan ideal, bibir tipis', 'Tidak ada'),
  ('userroomah46@gmail.com', 'AKHWAT', 'Mustabsyirah', '1998-11-01', 1, 'S1', 'Karyawan Swasta', 'SAAT_TAARUF', 155, 54, 'SINGLE', 'Alamat lengkap di Aceh (belum dilengkapi)', 'Kuning langsat, hidung agak mancung, mata sipit', 'Tidak ada'),
  ('userroomah47@gmail.com', 'AKHWAT', 'Tazkia Roid Bee', '1998-04-24', 6, 'S1', 'Karyawan Swasta (Junior Officer)', 'SAAT_TAARUF', 150, 78, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'kulit kuning langsat berkacamata', 'Tidak ada'),
  ('userroomah48@gmail.com', 'AKHWAT', 'BAIQ AULIA PERMATA SARI', '1992-06-19', 22, 'S1', 'Peg BUMN', 'SAAT_TAARUF', 167, 67, 'SINGLE', 'Alamat lengkap di Nusa Tenggara Barat (belum dilengkapi)', 'Agak tinggi tp berisi, Putih, sipit, agak mancung', 'Tidak ada'),
  ('userroomah49@gmail.com', 'AKHWAT', 'Robiah Ulpah', '1997-10-01', 9, 'S1', 'Virtual Assistan dan Sedang Proses Pengurusan Bekerja di Jepang sebagai caregiver.', 'SAAT_TAARUF', 158, 68, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Berkacamata, Berkerudung, Chubby.', 'Tidak ada'),
  ('userroomah50@gmail.com', 'AKHWAT', 'Hazrina Annisafitri', '1995-09-13', 14, 'S1', 'Leader konservasi', 'SAAT_TAARUF', 160, 57, 'SINGLE', 'Alamat lengkap di Kalimantan Tengah (belum dilengkapi)', 'Berkacamata, tidak kelihatan gemuk, kulit kuning langsat', 'Tidak ada'),
  ('userroomah51@gmail.com', 'AKHWAT', 'Alvia Turohmah', '2000-02-16', 39, 'D3', 'Trainer', 'SAAT_TAARUF', 156, 54, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Berhijab, berpakaian sederhana', 'Tidak ada'),
  ('userroomah52@gmail.com', 'AKHWAT', 'Yuni Amelia', '1995-06-01', 8, 'S1', 'Mengajar', 'SAAT_TAARUF', 168, 50, 'JANDA', 'Alamat lengkap di Jambi (belum dilengkapi)', 'Kuning langsat, hidung mancung', 'Tidak ada'),
  ('userroomah53@gmail.com', 'AKHWAT', 'Khonsa Shafira', '1999-12-01', 39, 'S1', 'Engineer', 'SAAT_TAARUF', 160, 57, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'berkacamata', 'Tidak ada'),
  ('userroomah54@gmail.com', 'AKHWAT', 'Fadhilah Nur Utami', '1997-05-20', 9, 'S1', 'Dokter Umum', 'SAAT_TAARUF', 160, 70, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Memakai hijab, berkacamata, pipi sedikit chubby', 'Tidak ada'),
  ('userroomah55@gmail.com', 'AKHWAT', 'Liana putri', '1999-06-26', 39, 'S1', 'Pengelolaan makanan', 'SAAT_TAARUF', 147, 56, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Rambut pendek', 'Tidak ada'),
  ('userroomah56@gmail.com', 'AKHWAT', 'Annisa', '1995-02-03', 8, 'S1', 'Pegawai swasta', 'SAAT_TAARUF', 152, 47, 'SINGLE', 'Alamat lengkap di Jambi (belum dilengkapi)', 'Kulit putih, mata sipit', 'Tidak ada'),
  ('userroomah57@gmail.com', 'AKHWAT', 'Icha Meilani', '1995-05-18', 9, 'S2', 'Karyawan swasta', 'SAAT_TAARUF', 165, 80, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Rambut diwarnai sesuai mood, bergelombang karena sering diikat dan memakai kerudung, memiliki tindik di kuping masing2 3 lubang, sawo matang, mata coklat', 'Tidak ada'),
  ('userroomah58@gmail.com', 'AKHWAT', 'FA', '1995-06-26', 39, 'SMA_SMK', 'Perawat dijepang', 'SAAT_TAARUF', 158, 52, 'JANDA', 'Alamat di luar negeri (belum dilengkapi)', 'Kuning langsat, berhijab', 'Tidak ada'),
  ('userroomah59@gmail.com', 'AKHWAT', 'Fakhriyah Azura Salsabila', '2001-08-29', 9, 'S1', 'Belum bekerja', 'SAAT_TAARUF', 150, 55, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Mata normal, kulit kuning Langsat, tiap senyum ada garisnya, chubby, sipit', 'Tidak ada'),
  ('userroomah60@gmail.com', 'AKHWAT', 'putri nur fitriana', '2002-07-12', 39, 'SMA_SMK', 'kaigo jepang', 'SAAT_TAARUF', 145, 41, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'kecil', 'Tidak ada'),
  ('userroomah61@gmail.com', 'AKHWAT', 'Elda fitra', '1995-11-11', 18, 'S1', 'Wiraswasta', 'SAAT_TAARUF', 150, 53, 'SINGLE', 'Alamat lengkap di Kepulauan Riau (belum dilengkapi)', 'Putih, berhijab', 'Tidak ada'),
  ('userroomah62@gmail.com', 'AKHWAT', 'Fatma Yuli', '1998-07-11', 36, 'S1', 'Admin gudang', 'SAAT_TAARUF', 160, 48, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Wajah oval, punya tahi lalat didagu kanan', 'Tidak ada'),
  ('userroomah63@gmail.com', 'AKHWAT', 'Niken Nurul Damayanti', '1999-01-25', 39, 'D3', 'Caregiver', 'SAAT_TAARUF', 155, 50, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah64@gmail.com', 'AKHWAT', 'Dini Puspita Permana', '1995-12-16', 39, 'S1', 'Kaigo (Perawat Lansia)', 'SAAT_TAARUF', 150, 52, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Putih, berhijab', 'Tidak ada'),
  ('userroomah65@gmail.com', 'AKHWAT', 'Suci Alvionisa', '2001-11-24', 39, 'S1', 'Peternakan', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Pendek, kantung mata terlihat', 'Tidak ada'),
  ('userroomah66@gmail.com', 'AKHWAT', 'Nisrina Fatin', '1996-07-12', 3, 'S1', 'Karyawan', 'SAAT_TAARUF', 154, 47, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kurus, hidung mancung, kulit sawo matang', 'Tidak ada'),
  ('userroomah67@gmail.com', 'AKHWAT', 'N', '2000-07-23', 9, 'S1', 'Saat ini sedang mencari pekerjaan, karena baru resign, pekerjaan terakhir menjadi hse officer', 'SAAT_TAARUF', 164, 40, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Tinggi, Kurus, Berkacamata', 'Tidak ada'),
  ('userroomah68@gmail.com', 'AKHWAT', 'Hetty Aprilianawati', '1980-04-07', 15, 'SMA_SMK', 'PNS', 'SAAT_TAARUF', 158, 98, 'JANDA', 'Alamat lengkap di Kalimantan Timur (belum dilengkapi)', 'Kulit sawo matang', 'Tidak ada'),
  ('userroomah69@gmail.com', 'AKHWAT', 'Toripa abidah', '1994-11-27', 39, 'D3', 'Kaigo', 'SAAT_TAARUF', 141, 51, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Pendek', 'Tidak ada'),
  ('userroomah70@gmail.com', 'AKHWAT', 'Riza Mufarida Akhsin', '1996-06-07', 3, 'S1', 'Karyawan swasta', 'SAAT_TAARUF', 155, 52, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kulit sawo matang, berkacamata', 'Tidak ada'),
  ('userroomah71@gmail.com', 'AKHWAT', 'Kartika Sari', '1993-04-24', 18, 'S1', 'Planner', 'SAAT_TAARUF', 164, 65, 'SINGLE', 'Alamat lengkap di Kepulauan Riau (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah72@gmail.com', 'AKHWAT', 'FA', '1995-06-26', 39, 'SMA_SMK', 'Kaigo(perawat)', 'SAAT_TAARUF', 159, 53, 'JANDA', 'Alamat di luar negeri (belum dilengkapi)', 'Kuning langsat, berhijab', 'Tidak ada'),
  ('userroomah73@gmail.com', 'AKHWAT', 'Listya Ajeng Salsabila', '1999-07-20', 11, 'S1', 'Penulis', 'SAAT_TAARUF', 169, 57, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Bentuk wajah oval, pipi chubby', 'Tidak ada'),
  ('userroomah74@gmail.com', 'AKHWAT', 'Khodijah Matanatun Imaniyah', '2000-03-16', 39, 'D3', 'Kaigo (Caregiver)', 'SAAT_TAARUF', 152, 43, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Tinggi badan saya sekitar 152 cm, berat badan 43 kg. Kulit saya kuning langsat, rambut hitam bergelombang, dan wajah saya oval. Saya tidak bertato, tidak memakai tindik, dan selalu berusaha menjaga penampilan agar rapi dan sopan.', 'Tidak ada'),
  ('userroomah75@gmail.com', 'AKHWAT', 'Mety Rosrianti Rahayu', '1994-05-06', 9, 'S1', 'Dokter', 'SAAT_TAARUF', 154, 50, 'SINGLE', 'Alamat lengkap di Jawa Barat (belum dilengkapi)', 'Badan kecil, berkerudung', 'Tidak ada'),
  ('userroomah76@gmail.com', 'AKHWAT', 'Rini Sundari', '1996-01-25', 30, 'S1', 'Pegawai Swasta', 'SAAT_TAARUF', 163, 60, 'SINGLE', 'Alamat lengkap di Riau (belum dilengkapi)', 'Kulit sawo matang, muka bulat, pakai kaca mata dan ada lesung pipi', 'Tidak ada'),
  ('userroomah77@gmail.com', 'AKHWAT', 'Erina Nurhanifah', '1996-02-26', 39, 'D3', 'Magang/Jisshusei', 'SAAT_TAARUF', 151, 50, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Kulit sawo matang', 'Tidak ada'),
  ('userroomah78@gmail.com', 'AKHWAT', 'DESI PRIMA SETIANATA', '1997-12-22', 19, 'S1', 'CPNS Daerah', 'SAAT_TAARUF', 156, 72, 'SINGLE', 'Alamat lengkap di Lampung (belum dilengkapi)', 'ada lesung pipi, on diet', 'Tidak ada'),
  ('userroomah79@gmail.com', 'AKHWAT', 'Vinni W', '1995-07-26', 6, 'S1', 'Teknologi Laboratorium Medis', 'SAAT_TAARUF', 158, 50, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'kurus, kuning langsat', 'Tidak ada'),
  ('userroomah80@gmail.com', 'AKHWAT', 'Fahriza nursiraj hermadi', '2000-12-05', 5, 'S1', 'Customer servis', 'SAAT_TAARUF', 153, 53, 'SINGLE', 'Alamat lengkap di DI Yogyakarta (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah81@gmail.com', 'AKHWAT', 'SITI YILIANI', '2000-07-31', 3, 'S1', 'Freelance', 'SAAT_TAARUF', 157, 60, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Berkacamata, kulit sawo matang, rambut keriting', 'Tidak ada'),
  ('userroomah82@gmail.com', 'AKHWAT', 'RK', '1995-01-05', 10, 'S1', 'Guru', 'SAAT_TAARUF', 152, 45, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Berjilbab, langsing, kulit sawo matang', 'Tidak ada'),
  ('userroomah83@gmail.com', 'AKHWAT', 'Meyke Arune Id''ha', '1995-05-10', 11, 'S2', 'Belum bekerja', 'SAAT_TAARUF', 150, 42, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Bersih, ada beberapa tahi lalat di wajah', 'Tidak ada'),
  ('userroomah84@gmail.com', 'AKHWAT', 'Meliyani', '1996-02-24', 39, 'S1', 'Pekerja magang jepang', 'SAAT_TAARUF', 158, 53, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Badan Proposal, kulit kuning langsat, hijab (belum syar''i)', 'Tidak ada'),
  ('userroomah85@gmail.com', 'AKHWAT', 'Dicha tri khusniyah', '2000-08-05', 3, 'D3', 'Perawat', 'SAAT_TAARUF', 159, 48, 'SINGLE', 'Alamat lengkap di Banten (belum dilengkapi)', 'Kulit kuning langsat, hidung mancung, tahi lalat di pipi kiri', 'Tidak ada'),
  ('userroomah86@gmail.com', 'AKHWAT', 'Audrie Yoanita Adnan', '2001-10-15', 39, 'S1', 'Pehotelan', 'SAAT_TAARUF', 150, 60, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Kulit kuning langsat, sedikit berisi, rambut sedikit ikal, gigi bawah agak berantakan (pernah di behel)', 'Tidak ada'),
  ('userroomah87@gmail.com', 'AKHWAT', 'Rizka Epadulijah', '1997-10-16', 36, 'D3', 'Asn', 'SAAT_TAARUF', 150, 53, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Lumayan pendek, kulit sawo matang, pipi chubby', 'Tidak ada'),
  ('userroomah88@gmail.com', 'AKHWAT', 'Ika Yunika', '1994-06-09', 39, 'D3', 'Perawat', 'SAAT_TAARUF', 161, 45, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Tinggi, berjilbab', 'Tidak ada'),
  ('userroomah89@gmail.com', 'AKHWAT', 'Shayma salies', '1996-08-31', 6, 'S1', 'Nakes di Madinah', 'SAAT_TAARUF', 157, 75, 'SINGLE', 'Alamat lengkap di DKI Jakarta (belum dilengkapi)', 'Jauh dari kata sempurna dan ideal seorang wanita', 'Tidak ada'),
  ('userroomah90@gmail.com', 'AKHWAT', 'Meike Dyah Layla Kalsum', '1999-05-04', 39, 'S1', 'Tokutei Ginou', 'SAAT_TAARUF', 153, 48, 'SINGLE', 'Alamat di luar negeri (belum dilengkapi)', 'Sedikit mungil, alis tebal', 'Tidak ada'),
  ('userroomah91@gmail.com', 'AKHWAT', 'Deni Setyowati', '1999-05-21', 10, 'D3', 'Design Interior (Drafter)', 'SAAT_TAARUF', 150, 50, 'SINGLE', 'Alamat lengkap di Jawa Tengah (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah92@gmail.com', 'AKHWAT', 'Siti Ema Kustianingsih', '1999-03-20', 11, 'S1', 'Guru', 'SAAT_TAARUF', 158, 49, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Proporsional', 'Tidak ada'),
  ('userroomah93@gmail.com', 'AKHWAT', 'Nurhayati', '1995-04-01', 1, 'S2', 'Belum bekerja', 'SAAT_TAARUF', 150, 47, 'SINGLE', 'Alamat lengkap di Aceh (belum dilengkapi)', 'Sawo matang, hidung mancung, dan sederhana', 'Tidak ada'),
  ('userroomah94@gmail.com', 'AKHWAT', 'Rizka Amelia', '1993-07-30', 8, 'D3', 'ASN', 'SAAT_TAARUF', 155, 45, 'SINGLE', 'Alamat lengkap di Jambi (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah95@gmail.com', 'AKHWAT', 'Novia Devi Triana', '1990-11-28', 11, 'S1', 'Staf non ASN', 'SAAT_TAARUF', 152, 50, 'SINGLE', 'Alamat lengkap di Jawa Timur (belum dilengkapi)', 'Berhijab', 'Tidak ada'),
  ('userroomah96@gmail.com', 'AKHWAT', 'putri hasanah', '1996-10-25', 30, 'S1', 'asisten apoteker', 'SAAT_TAARUF', 167, 70, 'SINGLE', 'Alamat lengkap di Riau (belum dilengkapi)', 'berhijab, kulit kuning langsat, Badan tinggi dan berisi (tidak gendut)', 'Tidak ada'),
  ('userroomah97@gmail.com', 'AKHWAT', 'Nora Fitriani', '1995-11-19', 12, 'D3', 'Finance', 'SAAT_TAARUF', 156, 58, 'SINGLE', 'Alamat lengkap di Kalimantan Barat (belum dilengkapi)', 'Kulit sawo matang, berkacamata', 'Tidak ada'),
  ('userroomah98@gmail.com', 'AKHWAT', 'ridha nurul hayati', '1995-10-26', 22, 'S2', 'Dosen', 'SAAT_TAARUF', 154, 50, 'SINGLE', 'Alamat lengkap di Nusa Tenggara Barat (belum dilengkapi)', 'Tidak ada deskripsi', 'Tidak ada'),
  ('userroomah99@gmail.com', 'IKHWAN', 'Renal Eki Riyanto', '1999-06-16', 36, 'S1', 'Developer Kontrak', 'SAAT_TAARUF', 163, 87, 'SINGLE', 'Alamat lengkap di Sumatera Barat (belum dilengkapi)', 'Gemuk, Sawo matang, Wajah bulat', 'Tidak ada')
) AS data(email, gender, full_name, birth_date, province_id, education, occupation, income_bracket, height_cm, weight_kg, marital_status, full_address, ciri_fisik, disease)
LEFT JOIN public.profiles p ON p.email = data.email
WHERE p.user_id IS NOT NULL;

-- Verify insertion
SELECT COUNT(*) as total_imported FROM public.cv_data;

-- Show sample by province
SELECT 
  prov.name as provinsi,
  COUNT(*) as jumlah_user
FROM public.cv_data cv
LEFT JOIN public.provinces prov ON cv.province_id = prov.id
GROUP BY prov.name
ORDER BY jumlah_user DESC;

-- Show users that failed to import (email not found in profiles)
SELECT data.email
FROM (VALUES
  ('userroomah1@gmail.com'), ('userroomah2@gmail.com'), ('userroomah3@gmail.com'),
  ('userroomah4@gmail.com'), ('userroomah5@gmail.com'), ('userroomah6@gmail.com'),
  ('userroomah7@gmail.com'), ('userroomah8@gmail.com'), ('userroomah9@gmail.com'),
  ('userroomah10@gmail.com'), ('userroomah11@gmail.com'), ('userroomah12@gmail.com'),
  ('userroomah13@gmail.com'), ('userroomah14@gmail.com'), ('userroomah15@gmail.com'),
  ('userroomah16@gmail.com'), ('userroomah17@gmail.com'), ('userroomah18@gmail.com'),
  ('userroomah19@gmail.com'), ('userroomah20@gmail.com'), ('userroomah21@gmail.com'),
  ('userroomah22@gmail.com'), ('userroomah23@gmail.com'), ('userroomah24@gmail.com'),
  ('userroomah25@gmail.com'), ('userroomah26@gmail.com'), ('userroomah27@gmail.com'),
  ('userroomah28@gmail.com'), ('userroomah29@gmail.com'), ('userroomah30@gmail.com'),
  ('userroomah31@gmail.com'), ('userroomah32@gmail.com'), ('userroomah33@gmail.com'),
  ('userroomah34@gmail.com'), ('userroomah35@gmail.com'), ('userroomah36@gmail.com'),
  ('userroomah37@gmail.com'), ('userroomah38@gmail.com'), ('userroomah39@gmail.com'),
  ('userroomah40@gmail.com'), ('userroomah41@gmail.com'), ('userroomah42@gmail.com'),
  ('userroomah43@gmail.com'), ('userroomah44@gmail.com'), ('userroomah45@gmail.com'),
  ('userroomah46@gmail.com'), ('userroomah47@gmail.com'), ('userroomah48@gmail.com'),
  ('userroomah49@gmail.com'), ('userroomah50@gmail.com'), ('userroomah51@gmail.com'),
  ('userroomah52@gmail.com'), ('userroomah53@gmail.com'), ('userroomah54@gmail.com'),
  ('userroomah55@gmail.com'), ('userroomah56@gmail.com'), ('userroomah57@gmail.com'),
  ('userroomah58@gmail.com'), ('userroomah59@gmail.com'), ('userroomah60@gmail.com'),
  ('userroomah61@gmail.com'), ('userroomah62@gmail.com'), ('userroomah63@gmail.com'),
  ('userroomah64@gmail.com'), ('userroomah65@gmail.com'), ('userroomah66@gmail.com'),
  ('userroomah67@gmail.com'), ('userroomah68@gmail.com'), ('userroomah69@gmail.com'),
  ('userroomah70@gmail.com'), ('userroomah71@gmail.com'), ('userroomah72@gmail.com'),
  ('userroomah73@gmail.com'), ('userroomah74@gmail.com'), ('userroomah75@gmail.com'),
  ('userroomah76@gmail.com'), ('userroomah77@gmail.com'), ('userroomah78@gmail.com'),
  ('userroomah79@gmail.com'), ('userroomah80@gmail.com'), ('userroomah81@gmail.com'),
  ('userroomah82@gmail.com'), ('userroomah83@gmail.com'), ('userroomah84@gmail.com'),
  ('userroomah85@gmail.com'), ('userroomah86@gmail.com'), ('userroomah87@gmail.com'),
  ('userroomah88@gmail.com'), ('userroomah89@gmail.com'), ('userroomah90@gmail.com'),
  ('userroomah91@gmail.com'), ('userroomah92@gmail.com'), ('userroomah93@gmail.com'),
  ('userroomah94@gmail.com'), ('userroomah95@gmail.com'), ('userroomah96@gmail.com'),
  ('userroomah97@gmail.com'), ('userroomah98@gmail.com'), ('userroomah99@gmail.com')
) AS data(email)
LEFT JOIN public.profiles p ON p.email = data.email
WHERE p.user_id IS NULL;
