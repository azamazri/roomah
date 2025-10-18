# Admin Tables Migration Guide

## Overview

Dua migration baru untuk mendukung fitur admin yang lengkap:

1. **20250117_01_create_admin_tables.sql** - Membuat 10 tabel admin baru dengan indexes dan triggers
2. **20250117_02_admin_tables_rls.sql** - Mengaktifkan RLS dan membuat policies keamanan

Total: **10 tabel baru + 25 indexes + 9 triggers + 30+ RLS policies**

---

## 📋 Daftar Tabel Baru

### 1. admin_platform_settings
Menyimpan konfigurasi platform secara global (maintenance mode, feature toggles, etc)

```sql
setting_key VARCHAR(255) -- unique key
setting_value JSONB       -- flexible value storage
description TEXT
```

### 2. admin_feature_flags
Feature flags untuk A/B testing dan gradual rollout

```sql
flag_name VARCHAR(255)           -- unique
enabled BOOLEAN
rollout_percentage INTEGER       -- 0-100
target_audience TEXT             -- JSON string for targeting
```

### 3. social_media_accounts
Akun media sosial pengguna yang terverifikasi

```sql
user_id UUID                     -- FK to profiles
platform VARCHAR(50)             -- instagram, tiktok, etc
account_handle VARCHAR(255)
is_verified BOOLEAN
followers_count INTEGER
engagement_rate DECIMAL(5, 2)
platform_metadata JSONB
```

### 4. audit_logs
Log semua aktivitas admin untuk compliance dan debugging

```sql
actor_id UUID                    -- who did it
action VARCHAR(255)              -- what action
entity_type VARCHAR(100)         -- on what entity
changes JSONB                    -- what changed
ip_address INET                  -- from where
user_agent TEXT
```

### 5. cv_verification_queue
Queue untuk CV yang pending approval

```sql
cv_id UUID
user_id UUID
status VARCHAR(50)               -- pending, in_review, approved, rejected
reviewed_by UUID                 -- admin yang review
rejection_reason TEXT
priority INTEGER                 -- untuk urgent reviews
```

### 6. taaruf_session_reports
Laporan/komplain tentang sesi taaruf tertentu

```sql
session_id UUID
reporter_id UUID
report_type VARCHAR(50)          -- harassment, spam, etc
description TEXT
status VARCHAR(50)               -- pending, investigating, resolved
resolved_by UUID
action_taken VARCHAR(255)        -- suspended user, etc
```

### 7. user_suspensions
Track user suspensions/bans

```sql
user_id UUID
suspended_by UUID                -- admin
reason VARCHAR(500)
suspension_type VARCHAR(50)      -- account_suspension, taaruf_suspension
suspension_period_days INTEGER
suspended_until TIMESTAMP
is_active BOOLEAN
```

### 8. payment_refunds
Track semua refund request dan status

```sql
transaction_id UUID              -- FK to wallet_transactions
initiated_by UUID                -- admin
refund_amount DECIMAL(12, 2)
refund_reason VARCHAR(500)
status VARCHAR(50)               -- pending, completed, failed
midtrans_refund_id VARCHAR(255)  -- integration with Midtrans
```

### 9. social_media_platform_settings
Konfigurasi API untuk setiap social media platform

```sql
platform VARCHAR(50)             -- unique
api_key VARCHAR(500)
api_secret VARCHAR(500)
webhook_url TEXT
is_enabled BOOLEAN
sync_frequency_minutes INTEGER
```

### 10. dashboard_metrics
Cache data metrics untuk dashboard admin

```sql
metric_type VARCHAR(100)         -- user_signups, cv_approvals, etc
metric_date DATE
metric_value BIGINT              -- count/value
additional_data JSONB
UNIQUE(metric_type, metric_date)
```

---

## 🚀 HOW TO RUN

### Step 1: Run Main Migration (Tables & Indexes)

**Di Supabase Dashboard:**
1. Buka: https://supabase.com/dashboard/project/fvqcwphjgftadhbqkpss/sql/new
2. Copy-paste isi dari: `supabase/migrations/20250117_01_create_admin_tables.sql`
3. Click "Run"
4. Tunggu hingga selesai ✓

**atau pakai CLI:**
```bash
supabase db push --only-migrations 20250117_01_create_admin_tables
```

### Step 2: Run RLS Migration (Policies)

**Di Supabase Dashboard:**
1. Copy-paste isi dari: `supabase/migrations/20250117_02_admin_tables_rls.sql`
2. Click "Run"
3. Tunggu hingga selesai ✓

**atau pakai CLI:**
```bash
supabase db push --only-migrations 20250117_02_admin_tables_rls
```

---

## ✅ VERIFICATION

Setelah kedua migration berhasil, jalankan query berikut untuk verify:

```sql
-- 1. Check semua tabel baru ada
SELECT tablename FROM pg_tables 
WHERE tablename IN (
  'admin_platform_settings',
  'admin_feature_flags',
  'social_media_accounts',
  'audit_logs',
  'cv_verification_queue',
  'taaruf_session_reports',
  'user_suspensions',
  'payment_refunds',
  'social_media_platform_settings',
  'dashboard_metrics'
)
ORDER BY tablename;
-- Expected: 10 rows

-- 2. Check indexes created (~25 indexes)
SELECT COUNT(*) as index_count FROM pg_indexes
WHERE tablename IN (
  'admin_platform_settings',
  'admin_feature_flags',
  'social_media_accounts',
  'audit_logs',
  'cv_verification_queue',
  'taaruf_session_reports',
  'user_suspensions',
  'payment_refunds',
  'social_media_platform_settings',
  'dashboard_metrics'
);
-- Expected: 20+

-- 3. Check RLS enabled on all tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'admin_platform_settings',
  'admin_feature_flags',
  'social_media_accounts',
  'audit_logs',
  'cv_verification_queue',
  'taaruf_session_reports',
  'user_suspensions',
  'payment_refunds',
  'social_media_platform_settings',
  'dashboard_metrics'
);
-- Expected: All show 't' for rowsecurity

-- 4. Check RLS policies created (30+)
SELECT COUNT(*) as policy_count FROM pg_policies
WHERE tablename IN (
  'admin_platform_settings',
  'admin_feature_flags',
  'social_media_accounts',
  'audit_logs',
  'cv_verification_queue',
  'taaruf_session_reports',
  'user_suspensions',
  'payment_refunds',
  'social_media_platform_settings',
  'dashboard_metrics'
);
-- Expected: 30+
```

---

## 📊 Migration Statistics

| Category | Count |
|----------|-------|
| **Tables Created** | 10 |
| **Indexes Created** | 25 |
| **Triggers Created** | 9 |
| **RLS Policies** | 30+ |
| **Foreign Keys** | 20+ |
| **Constraints** | 15+ |

---

## 🔒 Security Features

### Row Level Security (RLS)

Semua tabel dilindungi dengan RLS yang ketat:

- **Platform Settings**: Admin only
- **Feature Flags**: Admin write, authenticated read (if enabled)
- **Social Media Accounts**: User owns, Admin manages, Public can view verified
- **Audit Logs**: Admin only (untuk compliance)
- **CV Verification Queue**: Admin manages, User can view own status
- **Taaruf Reports**: User can create/view own, Admin manages
- **User Suspensions**: User view own, Admin manages
- **Payment Refunds**: User view own, Admin manages
- **Platform Settings (Social)**: Admin only
- **Dashboard Metrics**: Admin only

### Audit Trail

Setiap perubahan di tabel admin dicatat di `audit_logs`:
- Actor ID (siapa)
- Action (apa)
- Entity Type & ID (pada apa)
- Changes (berapa/apa yang berubah)
- Timestamp (kapan)

---

## 🔧 Backend Integration

Backend server actions sudah ada di: `features/admin/server/`

File yang sudah support tabel ini:
- `settings.ts` → admin_platform_settings, admin_feature_flags, dashboard_metrics
- `social-media.ts` → social_media_accounts, social_media_platform_settings
- `payments.ts` → payment_refunds
- `taaruf-monitoring.ts` → taaruf_session_reports

---

## ⚠️ Important Notes

1. **Migration Order**: Jalankan `20250117_01_*` **SEBELUM** `20250117_02_*`
2. **RLS Helper Functions**: Pastikan `is_admin()` function sudah ada (dari migration sebelumnya)
3. **update_updated_at() Trigger**: Pastikan function ini sudah ada
4. **Service Role Key**: Untuk test via Supabase dashboard, gunakan service_role key jika perlu bypass RLS

---

## 🐛 Troubleshooting

### Error: "function update_updated_at() does not exist"
**Solusi**: Pastikan migration `20250116_08_create_functions.sql` sudah dijalankan dulu.

### Error: "function is_admin() does not exist"
**Solusi**: Pastikan migration `20250116_12_create_rls_helpers.sql` sudah dijalankan.

### Error: "relation already exists"
**Solusi**: Migrations menggunakan `CREATE TABLE IF NOT EXISTS`, jadi aman di-run berkali-kali.

### Error: "duplicate key value violates unique constraint"
**Solusi**: Tabel sudah ada. Lihat existing data: `SELECT * FROM admin_platform_settings;`

---

## 📞 Next Steps

Setelah migrations berhasil:

1. ✅ **Test Backend**: Jalankan server actions untuk test CRUD operations
2. ✅ **Verify RLS**: Test policies dengan curl atau Postman
3. ✅ **Integrasi Frontend**: Build admin dashboard UI
4. ✅ **E2E Testing**: Test full workflows

---

**Status**: ✅ Ready to deploy  
**Created**: 2025-01-17  
**Last Updated**: 2025-01-17
