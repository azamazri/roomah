# 📊 PANDUAN IMPORT DATA CV

## 🎯 Tujuan
Import data CV secara otomatis dengan status **AUTO-APPROVE** dan generate **candidate_code**.

---

## 📋 PERSIAPAN DATA

### **Format Data yang Dibutuhkan**

Anda perlu 2 file (bisa Excel atau CSV):

#### **1. File: CV Data (Informasi Dasar)**

| Field | Type | Required | Contoh | Keterangan |
|-------|------|----------|--------|------------|
| `user_email` | TEXT | ✅ | `john@example.com` | Email user yang sudah terdaftar |
| `full_name` | TEXT | ✅ | `Ahmad Rizki` | Nama lengkap |
| `gender` | TEXT | ✅ | `IKHWAN` atau `AKHWAT` | Gender (HARUS uppercase) |
| `birth_date` | DATE | ✅ | `1995-05-15` | Format: YYYY-MM-DD |
| `birth_place` | TEXT | ✅ | `Jakarta` | Tempat lahir |
| `current_city` | TEXT | ✅ | `Bandung` | Kota domisili |
| `province_id` | TEXT | ✅ | `32` | ID Provinsi (11-94) |
| `phone` | TEXT | ✅ | `081234567890` | Nomor HP |

#### **2. File: CV Details (Informasi Detail)**

| Field | Type | Required | Contoh | Keterangan |
|-------|------|----------|--------|------------|
| `user_email` | TEXT | ✅ | `john@example.com` | Email user (untuk mapping) |
| `pendidikan_terakhir` | TEXT | ✅ | `S1` | SMA_SMK, D3, S1, S2, S3 |
| `pekerjaan` | TEXT | ✅ | `Software Engineer` | Pekerjaan |
| `penghasilan` | TEXT | ✅ | `5_10` | SAAT_TAARUF, 0_2, 2_5, 5_10, 10_PLUS |
| `status_pernikahan` | TEXT | ✅ | `SINGLE` | SINGLE, JANDA, DUDA |
| `tinggi_badan` | INT | ✅ | `170` | Dalam cm |
| `berat_badan` | INT | ✅ | `65` | Dalam kg |
| `tentang_diri` | TEXT | ❌ | `Saya adalah...` | Bio singkat (optional) |
| `motivasi_menikah` | TEXT | ❌ | `Ingin melengkapi...` | Motivasi (optional) |
| `harapan_pasangan` | TEXT | ❌ | `Saya mencari...` | Harapan (optional) |

---

## ⚠️ PENTING: ENUM VALUES

### **Gender**
- ✅ `IKHWAN` (laki-laki)
- ✅ `AKHWAT` (perempuan)

### **Pendidikan Terakhir**
- ✅ `SMA_SMK`
- ✅ `D3`
- ✅ `S1`
- ✅ `S2`
- ✅ `S3`

### **Penghasilan (per bulan dalam juta)**
- ✅ `SAAT_TAARUF` - Akan diberitahu saat taaruf
- ✅ `0_2` - 0-2 juta
- ✅ `2_5` - 2-5 juta
- ✅ `5_10` - 5-10 juta
- ✅ `10_PLUS` - >10 juta

### **Status Pernikahan**
- ✅ `SINGLE`
- ✅ `JANDA`
- ✅ `DUDA`

### **Province ID (Kode Provinsi)**
```
11 = Aceh
12 = Sumatera Utara
13 = Sumatera Barat
14 = Riau
15 = Jambi
16 = Sumatera Selatan
17 = Bengkulu
18 = Lampung
19 = Kepulauan Bangka Belitung
21 = Kepulauan Riau
31 = DKI Jakarta
32 = Jawa Barat
33 = Jawa Tengah
34 = DI Yogyakarta
35 = Jawa Timur
36 = Banten
51 = Bali
52 = Nusa Tenggara Barat
53 = Nusa Tenggara Timur
61 = Kalimantan Barat
62 = Kalimantan Tengah
63 = Kalimantan Selatan
64 = Kalimantan Timur
65 = Kalimantan Utara
71 = Sulawesi Utara
72 = Sulawesi Tengah
73 = Sulawesi Selatan
74 = Sulawesi Tenggara
75 = Gorontalo
76 = Sulawesi Barat
81 = Maluku
82 = Maluku Utara
91 = Papua Barat
94 = Papua
```

---

## 📝 TEMPLATE FILE

Gunakan template yang sudah disediakan:

1. **`scripts/seed/cv_data_template.csv`** - Template untuk CV Data
2. **`scripts/seed/cv_details_template.csv`** - Template untuk CV Details

**Tips:** Buka dengan Excel/Google Sheets, edit, lalu save as CSV.

---

## 🚀 CARA MENGGUNAKAN

### **Option A: Jika Data Sudah di Excel/CSV**

1. **Export data ke CSV:**
   - Buka Excel/Google Sheets
   - File → Save As → CSV (Comma delimited)
   - Save 2 file: `cv_data.csv` dan `cv_details.csv`

2. **Convert CSV ke SQL INSERT:**
   - Buka file CSV dengan text editor
   - Copy semua rows (skip header)
   - Paste ke script SQL di section "STEP 2: INSERT YOUR DATA HERE"

3. **Format menjadi SQL VALUES:**
   ```
   Dari CSV:
   john@example.com,Ahmad Rizki,IKHWAN,1995-05-15,Jakarta,Bandung,32,081234567890
   
   Jadi SQL:
   ('john@example.com', 'Ahmad Rizki', 'IKHWAN', '1995-05-15', 'Jakarta', 'Bandung', '32', '081234567890'),
   ```

### **Option B: Input Manual di SQL Script**

1. **Buka file:** `scripts/seed/import_cv_data.sql`

2. **Cari section "STEP 2":**
   ```sql
   -- Example: Insert CV Basic Data
   INSERT INTO temp_cv_data (...) VALUES
     ('email1@example.com', 'Nama 1', 'IKHWAN', '1995-01-01', ...),
     ('email2@example.com', 'Nama 2', 'AKHWAT', '1997-05-15', ...);
   ```

3. **Replace contoh data dengan data real Anda**

4. **Lakukan hal yang sama untuk CV Details**

---

## ▶️ MENJALANKAN SCRIPT

### **Step 1: Buka Supabase SQL Editor**
```
https://supabase.com/dashboard
→ Project Roomah
→ SQL Editor
→ New Query
```

### **Step 2: Copy-Paste Script**
- Copy seluruh isi file `scripts/seed/import_cv_data.sql`
- Paste ke SQL Editor

### **Step 3: Ganti Data**
- Ganti contoh data di section "STEP 2" dengan data real Anda

### **Step 4: Run Script**
- Click "Run" atau tekan `Ctrl+Enter`
- Tunggu proses selesai (~5-30 detik tergantung jumlah data)

### **Step 5: Lihat Hasil**
Script akan menampilkan:
```
======================================
IMPORT SUMMARY
======================================
✅ CV Data imported: 10
✅ CV Details imported: 10
✅ Auto-approved CVs: 10
======================================

Candidate Code | Full Name      | Email                  | Status   
---------------|----------------|------------------------|----------
IKH-2025-0001  | Ahmad Rizki    | john@example.com       | APPROVED
AKH-2025-0001  | Siti Aminah    | jane@example.com       | APPROVED
```

---

## ✅ FITUR SCRIPT

### **1. Auto-Approve**
- Status otomatis: `APPROVED`
- `approved_at` otomatis di-set
- Langsung bisa muncul di candidate listing

### **2. Auto-Generate Candidate Code**
- Ikhwan: `IKH-2025-XXXX`
- Akhwat: `AKH-2025-XXXX`
- Sequential & unique

### **3. Data Validation**
- Validasi enum values (gender, education, income, dll)
- Check user exists di `auth.users`
- Warning jika ada email yang tidak terdaftar

### **4. Upsert (Update or Insert)**
- Jika user sudah punya CV → **UPDATE**
- Jika user belum punya CV → **INSERT**
- Tidak akan duplicate data

### **5. Transaction Safety**
- Semua operasi dalam 1 transaction
- Jika ada error → rollback semua
- Data tetap konsisten

---

## ⚠️ TROUBLESHOOTING

### **Error: "User not found"**
**Penyebab:** Email tidak ada di `auth.users`

**Solusi:**
1. Pastikan user sudah register via aplikasi
2. Atau buat user dulu via Supabase Auth
3. Atau hapus email tersebut dari import data

---

### **Error: "Invalid gender value"**
**Penyebab:** Gender bukan `IKHWAN` atau `AKHWAT`

**Solusi:**
- Pastikan uppercase: `IKHWAN` bukan `ikhwan`
- Tidak boleh typo: `AKHWAD` ❌, `AKHWAT` ✅

---

### **Error: "Invalid pendidikan_terakhir"**
**Penyebab:** Nilai education tidak sesuai enum

**Solusi:**
- Harus salah satu: `SMA_SMK`, `D3`, `S1`, `S2`, `S3`
- Jika `SMA` → ubah jadi `SMA_SMK`
- Jika `Sarjana` → ubah jadi `S1`

---

### **Error: "Invalid penghasilan"**
**Penyebab:** Format income bracket salah

**Solusi:**
- Format: `0_2` (pakai underscore)
- Bukan: `0-2` ❌ atau `0 sampai 2` ❌
- Valid: `SAAT_TAARUF`, `0_2`, `2_5`, `5_10`, `10_PLUS`

---

## 📊 CONTOH DATA LENGKAP

### **CSV Data:**

**cv_data.csv:**
```csv
user_email,full_name,gender,birth_date,birth_place,current_city,province_id,phone
ahmad@example.com,Ahmad Rizki,IKHWAN,1995-05-15,Jakarta,Bandung,32,081234567890
siti@example.com,Siti Aminah,AKHWAT,1997-08-20,Surabaya,Surabaya,35,081298765432
```

**cv_details.csv:**
```csv
user_email,pendidikan_terakhir,pekerjaan,penghasilan,status_pernikahan,tinggi_badan,berat_badan,tentang_diri,motivasi_menikah,harapan_pasangan
ahmad@example.com,S1,Software Engineer,5_10,SINGLE,170,65,Saya muslim yang taat,Ingin melengkapi agama,Mencari pasangan sholehah
siti@example.com,S1,Guru,2_5,SINGLE,160,50,Muslimah aktif sosial,Mencari ridho Allah,Mencari suami bertanggung jawab
```

### **Hasil Import:**
```
✅ 2 CV Data imported
✅ 2 CV Details imported
✅ 2 Auto-approved CVs

IKH-2025-0001 | Ahmad Rizki | APPROVED
AKH-2025-0001 | Siti Aminah | APPROVED
```

---

## 🎯 KESIMPULAN

### **Workflow:**
1. ✅ Siapkan data dalam Excel/CSV sesuai template
2. ✅ Convert/copy data ke SQL script
3. ✅ Run script di Supabase SQL Editor
4. ✅ CV langsung approved dan muncul di listing

### **Keuntungan:**
- ⚡ Cepat (batch import)
- ✅ No manual approval needed
- 🔒 Safe (validation built-in)
- 🔄 Repeatable (bisa dijalankan berkali-kali)

---

**Butuh bantuan convert data Anda?** Share format data yang Anda punya dan saya akan buatkan SQL script yang sudah siap pakai! 🚀
