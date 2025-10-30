# 🔍 DATABASE CONFIGURATION AUDIT

## Kenapa Perlu Audit?

Setelah banyak perubahan kode, kita **HARUS** crosscheck apakah semua konfigurasi database sudah applied atau belum.

**Fokus:** KONFIGURASI (bukan data) - Tables, RLS, Policies, Functions, Storage, dll

---

## 📋 Yang Akan Dicek:

### 1. **Database Structure** ✅
- Semua tabel ada atau tidak
- Kolom-kolom sesuai dengan types
- Data types cocok

### 2. **Enums** 🎨
- GenderEnum (IKHWAN, AKHWAT)
- CVStatus (DRAFT, REVIEW, APPROVED, REVISI)
- TaarufRequestStatus
- PaymentStatus
- dll

### 3. **Foreign Keys & Relationships** 🔗
- Relationships antar tabel
- Cascade rules
- Referential integrity

### 4. **Indexes** 📊
- Performance indexes
- Unique constraints

### 5. **RPC Functions** ⚡ **CRITICAL!**
- ✅ `deduct_koin(p_user_id, p_amount)` - **MUST EXIST**
- ✅ `add_koin(p_user_id, p_amount)` - **MUST EXIST**
- Other custom functions

### 6. **Views** 👁️
- Custom views untuk reporting

### 7. **Triggers** ⚡
- Auto-update triggers
- Validation triggers

### 8. **Row Level Security (RLS)** 🔒
- RLS enabled status
- Policies configured
- Permissions correct

### 9. **Storage Buckets** 📦
- avatars bucket
- documents bucket
- Permissions & limits

### 10. **Data Statistics** 📈
- Row counts per table
- Actual data status
- Migration history

---

## 🚀 HOW TO RUN

### **PENTING: Gunakan SIMPLE_DATABASE_AUDIT.sql**
File `COMPLETE_DATABASE_AUDIT.sql` error karena psql commands. Gunakan yang simple!

### **Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard
```

### **Step 2: Select Project**
Pilih project **"Roomah"**

### **Step 3: Open SQL Editor**
Sidebar → **"SQL Editor"** → **"New Query"**

### **Step 4: Copy & Paste**
Copy isi file `DATABASE_CONFIG_AUDIT.sql` dan paste di SQL Editor

### **Step 5: Run**
Click **"Run"** atau tekan `Ctrl + Enter`

⏱️ Tunggu ~5-15 detik

### **Step 6: Copy Output**
- Scroll ke bawah sampai habis
- Akan ada banyak tables dengan hasil
- Select semua output (Ctrl+A di results panel)
- Copy (Ctrl+C)
- Save ke file `.txt` atau share langsung

---

## 📤 WHAT TO DO WITH OUTPUT

### **Option 1: Save as File**
```
Desktop/roomah-database-audit-2025-10-23.txt
```

### **Option 2: Share via Pastebin**
- https://pastebin.com
- Paste output
- Set expiration: 1 week
- Share link

### **Option 3: Share Screenshot**
Jika output tidak terlalu panjang:
- Screenshot semua sections
- Kirim ke developer

---

## ⚠️ CRITICAL ITEMS TO CHECK

### **Priority 1: RPC Functions**
Di section **"10. CRITICAL RPC FUNCTIONS CHECK"**, harus muncul:
```
✅ deduct_koin FOUND
✅ add_koin FOUND
```

❌ Jika muncul **"MISSING"**, maka migration `20251023_add_koin_rpc_functions.sql` BELUM di-apply!

### **Priority 2: Tables**
Di section **"5. ALL TABLES"**, harus ada minimal:
- profiles
- cv_data
- cv_details
- taaruf_requests
- taaruf_sessions
- wallet_transactions
- payment_transactions

### **Priority 3: Row Counts**
Di section **"18. CRITICAL TABLES DATA SAMPLE"**, cek apakah ada data atau kosong.

---

## 🔧 IF ISSUES FOUND

### **Issue 1: RPC Functions Missing**
```sql
-- Run this in SQL Editor:
-- File: supabase/migrations/20251023_add_koin_rpc_functions.sql
-- Copy-paste isi file tersebut dan execute
```

### **Issue 2: Missing Tables**
Run migrations in order:
```
20250116_01_create_enums.sql
20250116_02_create_core_tables.sql
20250116_03_create_cv_tables.sql
...
```

### **Issue 3: RLS Not Enabled**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## 📊 EXPECTED OUTPUT EXAMPLE

```
==============================================
ROOMAH DATABASE COMPLETE AUDIT
Generated: 2025-10-23 13:00:00
==============================================

1. DATABASE OVERVIEW
----------------------------------------------
 database_name | current_schema | postgres_version
---------------+----------------+------------------
 postgres      | public         | PostgreSQL 15.x

2. INSTALLED EXTENSIONS
----------------------------------------------
 extension_name | version | schema
----------------+---------+--------
 uuid-ossp      | 1.1     | public
 pgcrypto       | 1.3     | public

...

10. CRITICAL RPC FUNCTIONS CHECK
----------------------------------------------
 deduct_koin_status
--------------------
 ✅ deduct_koin FOUND

 add_koin_status
-----------------
 ✅ add_koin FOUND

...
```

---

## 🎯 KESIMPULAN

Setelah audit, kita akan tahu:
- ✅ Apa yang sudah ada di database
- ❌ Apa yang masih missing
- 🔧 Apa yang perlu di-fix
- 📊 Status data saat ini

**Sangat penting untuk development selanjutnya!** 🚀
