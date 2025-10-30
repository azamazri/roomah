# 📊 Import CV Data - Fokus ke cv_data (Candidate Listing)

## ✅ **TABEL TARGET: `cv_data`**

Ini adalah tabel yang datanya **TAMPIL DI CANDIDATE LISTING**. Tidak termasuk cv_details.

---

## 📋 **STRUKTUR TABEL cv_data (14 Fields)**

| Field           | Type  | Contoh                                | Keterangan                               |
| --------------- | ----- | ------------------------------------- | ---------------------------------------- |
| user_email      | TEXT  | user@example.com                      | Email user (FK dari users)               |
| gender          | TEXT  | IKHWAN / AKHWAT                       | Wajib: IKHWAN atau AKHWAT                |
| full_name       | TEXT  | Ahmad Fauzan                          | Nama lengkap                             |
| birth_date      | DATE  | 1995-05-20                            | Format: YYYY-MM-DD                       |
| province_id     | INT   | 6 (DKI Jakarta)                       | ID provinsi (1-39)                       |
| education       | TEXT  | S1                                    | SMA_SMK / D3 / S1 / S2 / S3              |
| occupation      | TEXT  | Software Engineer                     | Pekerjaan                                |
| income_bracket  | TEXT  | 5_10                                  | 0_2 / 2_5 / 5_10 / 10_PLUS / SAAT_TAARUF |
| height_cm       | INT   | 170                                   | Tinggi badan (cm)                        |
| weight_kg       | INT   | 65                                    | Berat badan (kg)                         |
| marital_status  | TEXT  | SINGLE                                | SINGLE / JANDA / DUDA                    |
| full_address    | TEXT  | Jl. Sudirman No. 123, Jakarta Selatan | Alamat lengkap                           |
| ciri_fisik      | TEXT  | Berkulit sawo matang, bermata coklat  | Deskripsi fisik (max 200 char)           |
| disease_history | JSONB | ["Tidak Ada"]                         | Array riwayat penyakit                   |

---

## 🗺️ **DAFTAR PROVINCE ID (39 Provinsi)**

Gunakan ID ini untuk field `province_id` (ID otomatis dari 1-39):

```
1  - Aceh
2  - Bali
3  - Banten
4  - Bengkulu
5  - DI Yogyakarta
6  - DKI Jakarta
7  - Gorontalo
8  - Jambi
9  - Jawa Barat
10 - Jawa Tengah
11 - Jawa Timur
12 - Kalimantan Barat
13 - Kalimantan Selatan
14 - Kalimantan Tengah
15 - Kalimantan Timur
16 - Kalimantan Utara
17 - Kepulauan Bangka Belitung
18 - Kepulauan Riau
19 - Lampung
20 - Maluku
21 - Maluku Utara
22 - Nusa Tenggara Barat
23 - Nusa Tenggara Timur
24 - Papua
25 - Papua Barat
26 - Papua Barat Daya
27 - Papua Pegunungan
28 - Papua Selatan
29 - Papua Tengah
30 - Riau
31 - Sulawesi Barat
32 - Sulawesi Selatan
33 - Sulawesi Tengah
34 - Sulawesi Tenggara
35 - Sulawesi Utara
36 - Sumatera Barat
37 - Sumatera Selatan
38 - Sumatera Utara
39 - Luar Negeri
```

**CATATAN:** ID ini auto-increment dari database (1-38), bukan kode BPS. Urutannya alfabetis sesuai seed migration.

---

## 📄 **CARA PAKAI:**

1. **Siapkan data Anda** dalam format:
   - Excel (.xlsx)
   - CSV
   - Google Sheets
   - Plain text

2. **Saya akan validate** struktur datanya sesuai tabel di atas

3. **Generate SQL INSERT** yang siap pakai

4. **Anda tinggal run** di Supabase SQL Editor

---

## ⚠️ **PENTING:**

- ✅ Data ini yang **tampil di halaman "Cari Jodoh"**
- ✅ Format harus **exact match** dengan tipe data di atas
- ✅ `province_id` harus valid (1-39) sesuai ID di database
- ✅ `gender` harus **IKHWAN** atau **AKHWAT** (uppercase)
- ✅ `education` harus salah satu: SMA_SMK, D3, S1, S2, S3
- ✅ `income_bracket` harus salah satu: 0_2, 2_5, 5_10, 10_PLUS, SAAT_TAARUF
- ✅ `marital_status` harus salah satu: SINGLE, JANDA, DUDA
- ✅ `disease_history` harus format JSON array: ["item1", "item2"]

---

## 🎯 **Silahkan lampirkan data CV Anda sekarang!**
